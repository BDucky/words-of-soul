---
allowed-tools: Bash(git:*)
description: Create a git commit with conventional commit message
---

# Git Commit

Create a git commit with a properly formatted conventional commit message.

## Arguments

- `--skip-review` - Skip the review phase and commit immediately (optional)

## Instructions

1. First, check repository state:
   - `git status --short` - list changed files
   - `git diff HEAD` - view all changes (staged + unstaged)

2. If no changes exist, report: **No changes to commit**

3. Review changes and generate commit message following project conventions:

### Commit Format

Format: `<type>(<scope>): <description>`

**Types:**

| Type | Purpose |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code refactoring (no feature change) |
| `chore` | Maintenance tasks (deps, config) |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons |
| `test` | Adding/updating tests |
| `perf` | Performance improvements |
| `delete` | Removing code/files |

**Scope:** The affected module/component (e.g. `orderPrints`, `cartMigration`, `editor`, `auth`, `designer`)

**Description rules:**
- Present tense: "add", "fix", "update" (not "added", "fixed")
- Max 50 characters
- No period at end
- Descriptive of actual changes

**Examples:**
```
fix(orderPrints): update fetching state handling in MobileOrderPrintsDrawer
refactor(orderPrints): unify configuration handling across components
feat(cartMigration): implement line item limit in cart migration process
delete(cartMigrationMockup): remove cart migration mockup component
```

4. **Review Phase** (unless `--skip-review` is provided):
   - Present the proposed commit message to the user in this format:
     ```
     ### 📝 Proposed Commit

     | Field | Value |
     |-------|-------|
     | Type | `<type>` |
     | Scope | `<scope>` |
     | Message | `<type>(<scope>): <description>` |
     | Files | X files changed |

     **Changed files:**
     - file1.ts
     - file2.vue
     ...

     Would you like to proceed with this commit, modify the message, or cancel?
     ```
   - Wait for user confirmation before proceeding
   - If user wants to modify, use their suggested changes
   - If user cancels, abort the commit

5. Stage and commit:
   - `git add -A` - stage all changes
   - `git status --short` - verify staged files (check for sensitive files)
   - `git commit -m "<type>(<scope>): <description>"` - create commit

6. If commit fails due to pre-commit hooks:
   - Review hook output for issues
   - Fix any auto-fixable issues
   - Retry commit once

## Report

Display result in this format:

### ✅ Commit Created

| Field | Value |
|-------|-------|
| Hash | `abc1234` |
| Message | `type(scope): description` |
| Files | X files changed |

Or if failed:

### ❌ Commit Failed

**Reason:** <error message>
