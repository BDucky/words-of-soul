---
allowed-tools: Bash(git:*)
description: Stage and commit changes with a conventional commit message
---

# Git Commit

Stage and commit all pending changes with a properly formatted conventional commit message.

## Arguments

- `--skip-review` — Skip the confirmation prompt and commit immediately

## Instructions

1. Check repository state:
   - `git status --short`
   - `git diff HEAD`

2. If nothing to commit → report **No changes to commit** and stop.

3. Draft commit message following this format:

   `<type>(<scope>): <description>`

   | Type | When |
   |------|------|
   | `feat` | New feature or page |
   | `fix` | Bug fix |
   | `refactor` | Code change without behaviour change |
   | `chore` | Config, deps, tooling |
   | `docs` | Documentation only |
   | `style` | Formatting, class renames |
   | `perf` | Performance improvement |
   | `delete` | Removing files/code |

   **Scope** — the affected area, e.g. `login`, `admin`, `stories`, `ui`, `firebase`, `config`

   **Description** — present tense, max 50 chars, no period.

   Examples:
   ```
   feat(login): redesign page with botanical background
   fix(admin): remove header from login route
   chore(config): add Claude Code hooks and commands
   style(ui): replace arbitrary tw classes with canonical scale
   ```

4. **Review phase** (unless `--skip-review`):

   Present proposed commit:

   ```
   ### Proposed Commit

   | Field   | Value |
   |---------|-------|
   | Type    | `<type>` |
   | Scope   | `<scope>` |
   | Message | `<type>(<scope>): <description>` |
   | Files   | X changed |

   Changed files:
   - file1
   - file2

   Proceed, modify, or cancel?
   ```

   Wait for confirmation. Apply any edits the user requests.

5. Stage and commit:
   ```bash
   git add <specific files>   # prefer named files over -A
   git status --short         # verify — check for accidental .env files
   git commit -m "<message>"
   ```

6. If a pre-commit hook fails: fix the issue, re-stage, create a **new** commit (never --amend).

## Output

### ✅ Commit Created

| Field   | Value |
|---------|-------|
| Hash    | `abc1234` |
| Message | `type(scope): description` |
| Files   | X changed |

### ❌ Commit Failed

**Reason:** `<hook output or error>`
