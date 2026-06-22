#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

"""
Pre-tool-use hook for Corjl Webapp monorepo.

Protections:
- Block npm/yarn (must use pnpm)
- Block all direct pushes to GitHub-protected branches (fetched dynamically)
- Block rm commands outside project
- Warn on dangerous rm patterns within project
- Protect GraphQL generated files
- Validate file locations for Vue components
- Block `any` type in TypeScript/Vue files
- Block console.log in source files (use logger)
- Block relative imports crossing package boundaries
- Enforce <script setup> in Vue components
"""

import json
import sys
import re
import os
from pathlib import Path

from utils.constants import ensure_session_log_dir


def get_project_root():
    """Get the project root directory."""
    hook_path = Path(__file__).resolve()
    return hook_path.parent.parent.parent


def resolve_path(path_str, cwd=None):
    """Resolve a path string to an absolute path."""
    if cwd is None:
        cwd = Path.cwd()

    path_str = os.path.expanduser(path_str)
    path_str = os.path.expandvars(path_str)

    path = Path(path_str)
    if not path.is_absolute():
        path = cwd / path

    try:
        return path.resolve()
    except (OSError, ValueError):
        return path


def is_path_within_project(path_str, project_root, cwd=None):
    """Check if a given path is within the project directory."""
    resolved = resolve_path(path_str, cwd)
    try:
        resolved.relative_to(project_root)
        return True
    except ValueError:
        return False


def extract_paths_from_rm_command(command):
    """Extract file/directory paths from an rm command."""
    parts = command.split()
    paths = []

    for part in parts:
        if part == 'rm':
            continue
        if part.startswith('-'):
            continue
        paths.append(part)

    return paths


def check_dangerous_rm_within_project(command):
    """
    Check for dangerous rm patterns within project.
    Returns (is_dangerous, message) tuple.
    """
    normalized = ' '.join(command.split())

    # Critical directories that should never be deleted entirely
    critical_patterns = [
        (r'\brm\s+.*-r.*\s+packages/?$', 'BLOCKED: Cannot delete entire packages/ directory'),
        (r'\brm\s+.*-r.*\s+apps/?$', 'BLOCKED: Cannot delete entire apps/ directory'),
        (r'\brm\s+.*-r.*\s+\.claude/?$', 'BLOCKED: Cannot delete .claude/ directory'),
        (r'\brm\s+.*-r.*\s+docs/?$', 'BLOCKED: Cannot delete entire docs/ directory'),
        (r'\brm\s+.*-r.*\s+infrastructure/?$', 'BLOCKED: Cannot delete infrastructure/ directory'),
    ]

    for pattern, message in critical_patterns:
        if re.search(pattern, normalized):
            return True, message

    # Warn patterns (not blocked, just logged)
    warn_patterns = [
        (r'\brm\s+.*-r.*\s+node_modules', 'WARNING: Deleting node_modules - will need pnpm install'),
        (r'\brm\s+.*-r.*\s+\.pnpm-store', 'WARNING: Deleting pnpm store'),
        (r'\brm\s+.*-r.*\s+dist/?', 'WARNING: Deleting build output'),
    ]

    for pattern, message in warn_patterns:
        if re.search(pattern, normalized):
            # Log warning but don't block
            print(message, file=sys.stderr)
            return False, None

    return False, None


def is_dangerous_rm_command(command, cwd=None):
    """Block rm commands that target paths outside the project."""
    normalized = ' '.join(command.split())
    if not re.search(r'\brm\s+', normalized):
        return False, None

    project_root = get_project_root()
    paths = extract_paths_from_rm_command(normalized)

    if cwd is None:
        cwd = Path.cwd()

    for path_str in paths:
        if not path_str.strip():
            continue

        if not is_path_within_project(path_str, project_root, cwd):
            return True, f'BLOCKED: rm command targets path outside project: {path_str}'

    # Check for dangerous patterns within project
    return check_dangerous_rm_within_project(command)


def check_package_manager(command):
    """
    Block npm/yarn commands - must use pnpm in this monorepo.
    Returns (is_blocked, message) tuple.
    """
    normalized = ' '.join(command.split())

    # Block npm commands (except npx which is ok for one-off tools)
    npm_patterns = [
        (r'^npm\s+install', 'BLOCKED: Use "pnpm install" instead of npm install'),
        (r'^npm\s+i\s', 'BLOCKED: Use "pnpm add" instead of npm i'),
        (r'^npm\s+add', 'BLOCKED: Use "pnpm add" instead of npm add'),
        (r'^npm\s+run', 'BLOCKED: Use "pnpm run" or "pnpm cli" instead of npm run'),
        (r'^npm\s+ci', 'BLOCKED: Use "pnpm install --frozen-lockfile" instead of npm ci'),
        (r'^npm\s+publish', 'BLOCKED: Publishing not allowed from local environment'),
    ]

    for pattern, message in npm_patterns:
        if re.search(pattern, normalized):
            return True, message

    # Block yarn commands
    yarn_patterns = [
        (r'^yarn\s+install', 'BLOCKED: Use "pnpm install" instead of yarn install'),
        (r'^yarn\s+add', 'BLOCKED: Use "pnpm add" instead of yarn add'),
        (r'^yarn\s+run', 'BLOCKED: Use "pnpm run" or "pnpm cli" instead of yarn run'),
        (r'^yarn\s*$', 'BLOCKED: Use "pnpm install" instead of yarn'),
        (r'^yarn\s+publish', 'BLOCKED: Publishing not allowed from local environment'),
    ]

    for pattern, message in yarn_patterns:
        if re.search(pattern, normalized):
            return True, message

    return False, None


def _get_current_branch():
    """Get the current git branch name."""
    import subprocess
    try:
        result = subprocess.run(
            ['git', 'branch', '--show-current'],
            capture_output=True, text=True, timeout=5
        )
        return result.stdout.strip()
    except Exception:
        return ''


def _get_protected_branches():
    """
    Fetch protected branches from GitHub via gh CLI.
    Checks both legacy branch protection (/branches) and modern rulesets (/rulesets).
    Results are cached for 1 hour in a temp file to avoid repeated API calls.
    """
    import subprocess
    import time
    import tempfile

    cache_file = Path(tempfile.gettempdir()) / 'corjl_protected_branches.json'
    cache_ttl = 86400  # 24 hours

    # Check cache first
    if cache_file.exists():
        try:
            with open(cache_file, 'r') as f:
                cache = json.load(f)
            if time.time() - cache.get('timestamp', 0) < cache_ttl:
                return set(cache.get('branches', []))
        except (json.JSONDecodeError, ValueError, OSError):
            pass

    branches = set()

    # 1. Fetch legacy branch protection
    try:
        result = subprocess.run(
            ['gh', 'api', 'repos/{owner}/{repo}/branches', '--jq',
             '.[] | select(.protected == true) | .name'],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            for b in result.stdout.strip().splitlines():
                if b.strip():
                    branches.add(b.strip())
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return set()

    # 2. Fetch modern rulesets — these can protect branches not caught by /branches
    try:
        # Get default branch name (for ~DEFAULT_BRANCH resolution)
        default_result = subprocess.run(
            ['gh', 'api', 'repos/{owner}/{repo}', '--jq', '.default_branch'],
            capture_output=True, text=True, timeout=10
        )
        default_branch = default_result.stdout.strip() if default_result.returncode == 0 else ''

        # Get all active rulesets
        rulesets_result = subprocess.run(
            ['gh', 'api', 'repos/{owner}/{repo}/rulesets', '--jq',
             '.[] | select(.enforcement == "active") | .id'],
            capture_output=True, text=True, timeout=10
        )
        if rulesets_result.returncode == 0:
            ruleset_ids = [r.strip() for r in rulesets_result.stdout.strip().splitlines() if r.strip()]
            for rid in ruleset_ids:
                detail_result = subprocess.run(
                    ['gh', 'api', f'repos/{{owner}}/{{repo}}/rulesets/{rid}',
                     '--jq', '.conditions.ref_name.include[]'],
                    capture_output=True, text=True, timeout=10
                )
                if detail_result.returncode == 0:
                    for ref in detail_result.stdout.strip().splitlines():
                        ref = ref.strip()
                        if ref == '~DEFAULT_BRANCH' and default_branch:
                            branches.add(default_branch)
                        elif ref.startswith('refs/heads/'):
                            branches.add(ref.removeprefix('refs/heads/'))
    except (FileNotFoundError, subprocess.TimeoutExpired) as e:
        print(f'WARNING: Ruleset fetch failed: {e}', file=sys.stderr)
    except Exception as e:
        print(f'WARNING: Unexpected error fetching rulesets: {e}', file=sys.stderr)

    # Write cache
    try:
        with open(cache_file, 'w') as f:
            json.dump({'timestamp': time.time(), 'branches': list(branches)}, f)
    except Exception:
        pass

    return branches


def check_git_commands(command):
    """
    Block dangerous git commands.
    Returns (is_blocked, message) tuple.
    """
    normalized = ' '.join(command.split())

    # Only fetch protected branches when a push command is detected
    if re.search(r'\bgit\s+push\b', normalized):
        protected_branches = _get_protected_branches()

        if protected_branches:
            block_msg = 'BLOCKED: Direct push to protected branch ({branch}) is not allowed. Push to a feature branch and create a PR instead.'
            # Build regex alternation from protected branch names
            branches_pattern = '|'.join(re.escape(b) for b in protected_branches)

            # Pattern: git push origin HEAD:dev, git push origin branch:stage
            refspec_match = re.search(
                r'git\s+push\s+\S+\s+\S+:(' + branches_pattern + r')\b',
                normalized, re.IGNORECASE
            )
            if refspec_match:
                return True, block_msg.format(branch=refspec_match.group(1))

            # Pattern: git push origin dev (direct branch name as refspec)
            direct_match = re.search(
                r'git\s+push\s+\S+\s+(' + branches_pattern + r')\b',
                normalized, re.IGNORECASE
            )
            if direct_match:
                return True, block_msg.format(branch=direct_match.group(1))

            # Pattern: bare "git push" or "git push origin" — check current branch
            if re.match(r'git\s+push\s*$', normalized) or re.match(r'git\s+push\s+\S+\s*$', normalized):
                current_branch = _get_current_branch()
                if current_branch in protected_branches:
                    return True, block_msg.format(branch=current_branch)

    # Block hard reset (warn only, don't block)
    if re.search(r'git\s+reset\s+--hard', normalized):
        print('WARNING: git reset --hard detected - uncommitted changes will be lost', file=sys.stderr)

    return False, None


def check_protected_files(tool_name, tool_input):
    """
    Protect generated and critical files from modification.
    Returns (is_blocked, message) tuple.
    """
    protected_patterns = [
        # GraphQL generated files
        (r'packages/plugins/graphql/_generated/', 'BLOCKED: Cannot modify generated GraphQL files. Run "pnpm cli graphql update-exports" instead'),
        # Lock files (should not be manually edited)
        (r'pnpm-lock\.yaml$', 'BLOCKED: Do not manually edit pnpm-lock.yaml. Run "pnpm install" to update'),
    ]

    # Check file paths in Write/Edit tools
    if tool_name in ['Write', 'Edit']:
        file_path = tool_input.get('file_path', '')
        for pattern, message in protected_patterns:
            if re.search(pattern, file_path):
                return True, message

    return False, None


def check_env_files(tool_name, tool_input):
    """
    Warn when modifying environment/credential files.
    Returns warning message or None.
    """
    sensitive_patterns = [
        r'\.env',
        r'credentials',
        r'secrets',
        r'\.pem$',
        r'\.key$',
    ]

    if tool_name in ['Write', 'Edit', 'Read']:
        file_path = tool_input.get('file_path', '')
        for pattern in sensitive_patterns:
            if re.search(pattern, file_path, re.IGNORECASE):
                print(f'WARNING: Accessing sensitive file: {file_path}', file=sys.stderr)
                return None  # Warn but don't block

    return None


def validate_vue_file_location(tool_name, tool_input):
    """
    Validate Vue component file locations.
    Returns warning message or None (advisory only).
    """
    if tool_name != 'Write':
        return None

    file_path = tool_input.get('file_path', '')
    content = tool_input.get('content', '')

    # Check if this is a Vue file
    if not file_path.endswith('.vue'):
        return None

    # Check if it's a component that might belong in packages/core
    # This is advisory - just logs a note
    if '/apps/' in file_path and '/components/' in file_path:
        # Check if component seems generic (no app-specific imports)
        if '@corjl/core' in content and 'apps/' not in content.replace(file_path, ''):
            print(f'NOTE: Consider if this component should be in packages/core/components/', file=sys.stderr)

    return None


def _get_edit_write_content(tool_name, tool_input):
    """Extract the relevant content string from an Edit or Write tool input."""
    if tool_name == 'Edit':
        return tool_input.get('new_string', '')
    return tool_input.get('content', '')


def _get_file_path(tool_input):
    """Extract and return the file_path from tool input."""
    return tool_input.get('file_path', '')


def check_no_any_type(tool_name, tool_input):
    """
    Block usage of `any` type in TypeScript/Vue files.
    Returns (is_blocked, message) tuple.
    """
    file_path = _get_file_path(tool_input)

    # Only check .ts and .vue files
    if not re.search(r'\.(ts|vue)$', file_path):
        return False, None

    # Skip test files, declaration files, and fabric-fork
    if re.search(r'\.(test|spec)\.ts$|__tests__/|\.d\.ts$|@corjl/fabric-fork/', file_path):
        return False, None

    content = _get_edit_write_content(tool_name, tool_input)
    if re.search(r':\s*any\b|<any>|<any,|\bas\s+any\b', content):
        return True, (
            'BLOCKED: Do not use the `any` type in TypeScript files.\n'
            'Use proper types or `Record<string, unknown>` instead.\n'
            '  Examples: Record<string, unknown>, unknown, specific interfaces'
        )

    return False, None


def check_no_console_log(tool_name, tool_input):
    """
    Block console.log/warn/error/info/debug in source files.
    Returns (is_blocked, message) tuple.
    """
    file_path = _get_file_path(tool_input)

    # Only check .ts, .vue, .js files
    if not re.search(r'\.(ts|vue|js)$', file_path):
        return False, None

    # Skip test files, fabric-fork, scripts/, config files, and logger package
    if re.search(
        r'\.(test|spec)\.(ts|js)$|__tests__/'
        r'|@corjl/fabric-fork/'
        r'|/scripts/'
        r'|\.config\.(ts|js)$'
        r'|packages/plugins/logger/',
        file_path,
    ):
        return False, None

    content = _get_edit_write_content(tool_name, tool_input)
    if re.search(r'\bconsole\.(log|warn|error|info|debug)\b', content):
        return True, (
            'BLOCKED: Do not use console.log/warn/error/info/debug in source files.\n'
            'Use `logger` from `@corjl/plugins/logger` instead.\n'
            "  import { logger } from '@corjl/plugins/logger'"
        )

    return False, None


def check_cross_package_imports(tool_name, tool_input):
    """
    Block relative imports that cross package boundaries.
    Resolves the import path and checks if it escapes the file's package root.
    Returns (is_blocked, message) tuple.
    """
    file_path = _get_file_path(tool_input)

    # Only check .ts, .vue, .js files within packages/ or apps/
    if not re.search(r'\.(ts|vue|js)$', file_path):
        return False, None

    # Skip @corjl/* fork packages - they have their own import conventions
    if 'packages/@corjl/' in file_path:
        return False, None

    # Extract the package root (e.g. "packages/core" or "apps/designer")
    pkg_match = re.search(r'((?:packages|apps)/(?:@[^/]+/)?[^/]+)', file_path)
    if not pkg_match:
        return False, None

    pkg_root = pkg_match.group(1)
    file_dir = os.path.dirname(file_path)

    content = _get_edit_write_content(tool_name, tool_input)

    # Find all relative imports with ../ patterns
    import_paths = re.findall(r'''(?:from\s+['"]|import\s*\(['"])(\.\.\/[^'"]+)['"]''', content)

    for import_path in import_paths:
        # Strip file extension for resolution
        resolved = os.path.normpath(os.path.join(file_dir, import_path))
        # Check if resolved path still starts with the package root
        if not resolved.startswith(pkg_root) and not resolved.startswith('/' + pkg_root):
            return True, (
                'BLOCKED: Detected relative imports that cross package boundaries.\n'
                'Use @corjl/* path aliases instead of deep relative imports.\n'
                '  Examples:\n'
                "    import { ... } from '@corjl/core'\n"
                "    import { ... } from '@corjl/editor'\n"
                "    import { ... } from '@corjl/plugins'\n"
                f'\n  Detected: {import_path}'
            )

    return False, None


def check_vue_script_setup(tool_name, tool_input):
    """
    Enforce <script setup lang="ts"> in Vue components (Write only).
    Returns (is_blocked, message) tuple.
    """
    # Only check Write (new files / full rewrites)
    if tool_name != 'Write':
        return False, None

    file_path = _get_file_path(tool_input)
    if not file_path.endswith('.vue'):
        return False, None

    content = _get_edit_write_content(tool_name, tool_input)

    # Check for <script> tag without setup attribute
    if re.search(r'<script(\s+lang="ts")?\s*>', content) and not re.search(r'<script\s+setup', content):
        return True, (
            'BLOCKED: Vue components must use `<script setup lang="ts">` syntax.\n'
            'Replace `<script>` or `<script lang="ts">` with `<script setup lang="ts">`.'
        )

    return False, None


def log_tool_use(session_id, input_data):
    """Log tool usage to session directory."""
    log_dir = ensure_session_log_dir(session_id)
    log_path = log_dir / 'pre_tool_use.json'

    if log_path.exists():
        with open(log_path, 'r') as f:
            try:
                log_data = json.load(f)
            except (json.JSONDecodeError, ValueError):
                log_data = []
    else:
        log_data = []

    log_data.append(input_data)

    with open(log_path, 'w') as f:
        json.dump(log_data, f, indent=2)


def main():
    try:
        input_data = json.load(sys.stdin)

        tool_name = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})
        session_id = input_data.get('session_id', 'unknown')

        # Log all tool usage
        log_tool_use(session_id, input_data)

        # Check Bash commands
        if tool_name == 'Bash':
            command = tool_input.get('command', '')

            # Check package manager (npm/yarn blocked)
            is_blocked, message = check_package_manager(command)
            if is_blocked:
                print(message, file=sys.stderr)
                sys.exit(2)

            # Check git commands
            is_blocked, message = check_git_commands(command)
            if is_blocked:
                print(message, file=sys.stderr)
                sys.exit(2)

            # Check rm commands
            is_blocked, message = is_dangerous_rm_command(command)
            if is_blocked:
                print(message, file=sys.stderr)
                sys.exit(2)

        # Check protected files
        is_blocked, message = check_protected_files(tool_name, tool_input)
        if is_blocked:
            print(message, file=sys.stderr)
            sys.exit(2)

        # Check Edit/Write content rules
        if tool_name in ('Edit', 'Write'):
            for check_fn in (check_no_any_type, check_no_console_log,
                             check_cross_package_imports, check_vue_script_setup):
                is_blocked, message = check_fn(tool_name, tool_input)
                if is_blocked:
                    print(message, file=sys.stderr)
                    sys.exit(2)

        # Warn on sensitive files (not blocked)
        check_env_files(tool_name, tool_input)

        # Validate Vue file locations (advisory)
        validate_vue_file_location(tool_name, tool_input)

        sys.exit(0)

    except json.JSONDecodeError:
        sys.exit(0)
    except Exception:
        sys.exit(0)


if __name__ == '__main__':
    main()
