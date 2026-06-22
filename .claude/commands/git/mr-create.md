---
allowed-tools: Bash(gh:*), Bash(git:*)
description: "Create a merge request on GitHub. Args: [target_branch] [--skip-review] (default: dev)"
---

# Git Create Merge Request

Create a merge request on GitHub with proper formatting, auto-labeling for protected branches, and auto-assignment.

## Arguments

- `target_branch` - Target branch for the MR (optional, default: `dev`)
- `--skip-review` - Skip the review phase and create MR immediately (optional)

## Protected Branches

Protected branches (`test`, `stage`, `prod`) have labels auto-applied.

## Instructions

### Step 1: Parse Arguments

Arguments format: `[target_branch] [--skip-review]` (optional, default: `dev`)

Examples:
- `/git:create-mr` - Create MR from current branch to `dev`
- `/git:create-mr stage` - Create MR from current branch to `stage`
- `/git:create-mr dev stage` - Create MR from `dev` to `stage` (release flow)

### Step 2: Gather Information

```bash
# Get current branch
git branch --show-current

# Fetch latest
git fetch origin

# Get commits to be included
git log origin/<target_branch>..HEAD --oneline

# Get detailed commits for summary
git log origin/<target_branch>..HEAD --pretty=format:"- %s" --no-merges

# Get files changed
git diff origin/<target_branch>...HEAD --stat

# Check if MR already exists
gh pr list --head $(git branch --show-current) --base <target_branch>
```

### Step 3: Extract Jira Issue Key

Extract Jira issue key from branch name or commit messages for linking:

```bash
# Extract Jira issue key from branch name (e.g., cor-5200-feature → COR-5200)
BRANCH_NAME=$(git branch --show-current)
JIRA_KEY=$(echo "$BRANCH_NAME" | grep -oiE 'cor-[0-9]+' | head -1 | tr '[:lower:]' '[:upper:]')

# If not found in branch name, check commit messages
if [ -z "$JIRA_KEY" ]; then
  JIRA_KEY=$(git log origin/<target_branch>..HEAD --pretty=format:"%s" | grep -oiE 'cor-[0-9]+' | head -1 | tr '[:lower:]' '[:upper:]')
fi
```

Format as Jira link if found:
- **Jira URL pattern:** `https://corjl-software.atlassian.net/browse/<JIRA_KEY>`
- Example: `https://corjl-software.atlassian.net/browse/COR-5200`

### Step 4: Check Existing MR

If MR already exists:
- Display existing MR number, title, and URL
- Ask the user if they want to **update** the existing MR or **cancel**
- If user chooses to update: save the MR number/URL, flag the flow as an **update**, and continue through Steps 5-7
- If user cancels: stop and do nothing

If no existing MR:
- Flag the flow as a **create** (will use `gh pr create` in Step 8)

### Step 5: Ensure Branch is Pushed

```bash
git push -u origin $(git branch --show-current)
```

### Step 6: Generate MR Content

#### Title Format

For feature/fix branches:
```
<type>(<scope>): <description>
```

For release flow (protected branch to protected branch):
```
Release: <source_branch> to <target_branch>
```

#### Type (for feature/fix)

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, `perf`, `delete`

### Step 7: Review Phase (unless `--skip-review` is provided)

Present the proposed MR to the user for review:

```markdown
### 📝 Proposed Merge Request

| Field | Value |
|-------|-------|
| Action | `Create new MR` or `Update existing MR #<number>` |
| Title | `<title>` |
| Base | `<target_branch>` |
| Head | `<source_branch>` |
| Label | `<label>` (if protected) or None |
| Assignee | @me |
| Files | X files changed |

**Commits to be included:**
<list of commits>

**Proposed Description:**
<MR body content>

Would you like to proceed with this MR, modify the title/description, or cancel?
```

- Wait for user confirmation before proceeding
- If user wants to modify, apply their suggested changes to the title and/or description
- If user cancels, abort the MR creation/update

### Step 8: Create or Update MR

```bash
# Determine if target is a protected branch
PROTECTED_BRANCHES="test stage prod"
TARGET_BRANCH="<target_branch>"

# Build label flag (only if target is protected)
if [[ " $PROTECTED_BRANCHES " =~ " $TARGET_BRANCH " ]]; then
  LABEL_FLAG="--label $TARGET_BRANCH"
else
  LABEL_FLAG=""
fi
```

**If creating a new MR:**

```bash
gh pr create \
  --base <target_branch> \
  --title "<title>" \
  --assignee "@me" \
  $LABEL_FLAG \
  --body "<body>"
```

**If updating an existing MR:**

```bash
gh pr edit <pr_number> \
  --title "<title>" \
  --body "<body>" \
  $LABEL_FLAG
```

#### MR Body Template

For feature/fix branches:

**Conditional Testing section:** Based on the `git diff --stat` output from Step 2, decide whether to include the `## Testing` section:
- **Include** when the diff contains application code changes (`.ts`, `.vue`, `.scss`, `.js`, etc.)
- **Omit** when the PR **only** contains non-code changes: documentation (`.md`), CI/CD config (`.yml`, `.yaml`, `Dockerfile`, `infrastructure/`), linting/formatting config (`.eslintrc`, `.prettierrc`, etc.), git config (`.gitignore`, `.gitattributes`), AI docs/agent commands (`ai-docs/`, `.claude/`), or lockfiles (`pnpm-lock.yaml`)

```markdown
## Summary
<bullet points summarizing the changes>

## Changes
<list of key changes made>

<!-- Include this section ONLY if the diff contains application code changes -->
## Testing
- [ ] Tested locally
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Build succeeds

## Related Issues
<If Jira key found: https://corjl-software.atlassian.net/browse/COR-XXXX>
<If no Jira key found: N/A>
```

For release flow:
```markdown
## Summary
<Generate from merged PRs and commits>

## Merged PRs
<List PRs merged in this release>

## Test Plan
- [ ] Verify all changes work correctly
- [ ] Run typecheck and lint
- [ ] Manual testing of critical features
```

## Report

### Success

| Field | Value |
|-------|-------|
| MR | #123 (created) or #123 (updated) |
| Title | `<title>` |
| URL | https://github.com/CorjlSoftware/corjl-webapp/pull/123 |
| Base | `<target_branch>` |
| Head | `<source_branch>` |
| Label | `<label>` (if protected) or None |
| Assignee | @me |
| Files | X files changed |

### Failed

**Reason:** <error message>

## Arguments

$ARGUMENTS
