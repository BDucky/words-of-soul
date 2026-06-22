#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

"""
Pre-tool-use hook for Words of Soul (Next.js / npm project).

Protections:
- Block rm commands outside project directory
- Guard critical project directories from recursive deletion
- Block direct push to protected branches (fetched from GitHub)
- Warn on git reset --hard
- Warn on sensitive file access (.env, credentials, keys)
"""

import json
import sys
import re
import os
from pathlib import Path

from utils.constants import ensure_session_log_dir


def get_project_root():
    hook_path = Path(__file__).resolve()
    return hook_path.parent.parent.parent


def resolve_path(path_str, cwd=None):
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
    resolved = resolve_path(path_str, cwd)
    try:
        resolved.relative_to(project_root)
        return True
    except ValueError:
        return False


def extract_paths_from_rm_command(command):
    parts = command.split()
    paths = []
    for part in parts:
        if part == 'rm':
            continue
        if part.startswith('-'):
            continue
        paths.append(part)
    return paths


def is_dangerous_rm_command(command, cwd=None):
    """Block rm outside project; warn on critical directories."""
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
            return True, f'BLOCKED: rm targets path outside project: {path_str}'

    # Guard critical Next.js directories from recursive deletion
    critical_patterns = [
        (r'\brm\s+.*-r.*\s+app/?$',        'BLOCKED: Cannot delete entire app/ directory'),
        (r'\brm\s+.*-r.*\s+components/?$', 'BLOCKED: Cannot delete entire components/ directory'),
        (r'\brm\s+.*-r.*\s+lib/?$',        'BLOCKED: Cannot delete entire lib/ directory'),
        (r'\brm\s+.*-r.*\s+public/?$',     'BLOCKED: Cannot delete entire public/ directory'),
        (r'\brm\s+.*-r.*\s+\.claude/?$',   'BLOCKED: Cannot delete .claude/ directory'),
    ]
    for pattern, message in critical_patterns:
        if re.search(pattern, normalized):
            return True, message

    # Soft warnings
    warn_patterns = [
        (r'\brm\s+.*-r.*\s+node_modules', 'WARNING: Deleting node_modules — run npm install afterwards'),
        (r'\brm\s+.*-r.*\s+\.next',       'WARNING: Deleting .next build cache'),
    ]
    for pattern, message in warn_patterns:
        if re.search(pattern, normalized):
            print(message, file=sys.stderr)

    return False, None


def _get_current_branch():
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
    import subprocess
    import time
    import tempfile

    cache_file = Path(tempfile.gettempdir()) / 'wos_protected_branches.json'
    cache_ttl = 86400  # 24 hours

    if cache_file.exists():
        try:
            with open(cache_file, 'r') as f:
                cache = json.load(f)
            if time.time() - cache.get('timestamp', 0) < cache_ttl:
                return set(cache.get('branches', []))
        except (json.JSONDecodeError, ValueError, OSError):
            pass

    branches = set()

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

    try:
        with open(cache_file, 'w') as f:
            json.dump({'timestamp': time.time(), 'branches': list(branches)}, f)
    except Exception:
        pass

    return branches


def check_git_commands(command):
    """Block push to protected branches; warn on hard reset."""
    normalized = ' '.join(command.split())

    if re.search(r'\bgit\s+push\b', normalized):
        protected_branches = _get_protected_branches()
        if protected_branches:
            block_msg = 'BLOCKED: Direct push to protected branch ({branch}). Use a feature branch and open a PR.'
            branches_pattern = '|'.join(re.escape(b) for b in protected_branches)

            refspec_match = re.search(
                r'git\s+push\s+\S+\s+\S+:(' + branches_pattern + r')\b',
                normalized, re.IGNORECASE
            )
            if refspec_match:
                return True, block_msg.format(branch=refspec_match.group(1))

            direct_match = re.search(
                r'git\s+push\s+\S+\s+(' + branches_pattern + r')\b',
                normalized, re.IGNORECASE
            )
            if direct_match:
                return True, block_msg.format(branch=direct_match.group(1))

            if re.match(r'git\s+push\s*$', normalized) or re.match(r'git\s+push\s+\S+\s*$', normalized):
                current_branch = _get_current_branch()
                if current_branch in protected_branches:
                    return True, block_msg.format(branch=current_branch)

    if re.search(r'git\s+reset\s+--hard', normalized):
        print('WARNING: git reset --hard detected — uncommitted changes will be lost', file=sys.stderr)

    return False, None


def check_sensitive_files(tool_name, tool_input):
    """Warn (never block) when accessing env/credential files."""
    sensitive_patterns = [r'\.env', r'credentials', r'secrets', r'\.pem$', r'\.key$']
    if tool_name in ['Write', 'Edit', 'Read']:
        file_path = tool_input.get('file_path', '')
        for pattern in sensitive_patterns:
            if re.search(pattern, file_path, re.IGNORECASE):
                print(f'WARNING: Accessing sensitive file: {file_path}', file=sys.stderr)
                break


def log_tool_use(session_id, input_data):
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

        tool_name  = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})
        session_id = input_data.get('session_id', 'unknown')

        log_tool_use(session_id, input_data)

        if tool_name == 'Bash':
            command = tool_input.get('command', '')

            is_blocked, message = check_git_commands(command)
            if is_blocked:
                print(message, file=sys.stderr)
                sys.exit(2)

            is_blocked, message = is_dangerous_rm_command(command)
            if is_blocked:
                print(message, file=sys.stderr)
                sys.exit(2)

        check_sensitive_files(tool_name, tool_input)

        sys.exit(0)

    except json.JSONDecodeError:
        sys.exit(0)
    except Exception:
        sys.exit(0)


if __name__ == '__main__':
    main()
