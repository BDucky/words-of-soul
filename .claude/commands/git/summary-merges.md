---
description: "Summarize merged PRs on a branch for tester notification. Args: [branch] [--since=DATE]"
allowed-tools: Bash(git:*), Bash(gh:*), AskUserQuestion
---

# Summary of Merged PRs

Generate a Slack-ready summary of all PRs merged into a target branch, categorized by type (Feature, Fix, Performance, Chore), with Jira ticket references.

## Arguments

- `branch` - Target branch to summarize (optional, will prompt if not provided)
- `--since=DATE` - Only show merges since this date, e.g. `--since=2026-04-01` (optional, defaults to today)

## Instructions

### Step 1: Determine Target Branch

Parse `$ARGUMENTS` for the branch name and `--since` flag.

**If branch is provided in arguments** (e.g. `dev`, `stage`, `main`), use it directly. Default to `dev` if no branch argument is given.

Do NOT prompt the user to choose a branch — just use `dev` by default. Only ask if the argument is ambiguous.

### Step 2: Determine Date Range

- If `--since` flag is provided, use that date
- If not provided, default to **today** (current date)

### Step 3: Fetch and Collect PR Data

**IMPORTANT:** When querying for today's merges, use `--since="<date> 00:00:00"` to include all commits from the start of the day. Plain `--since="YYYY-MM-DD"` can miss commits due to timezone issues.

```bash
# Fetch latest
git fetch origin <branch> 2>&1 | tail -3

# Get merged PRs for the date range (use 00:00:00 to include full day)
git log origin/<branch> --format="%h %ad %s" --date=iso --merges --since="<since_date> 00:00:00" | grep "Merge pull request"
```

If no PRs found, tell the user:
> No PRs were merged into `<branch>` since `<since_date>`.

And stop.

### Step 4: Get PR Details

For each PR number found, fetch details from GitHub:

```bash
gh pr view <PR_NUMBER> --json title,body,labels,number --repo CorjlSoftware/corjl-webapp
```

From the PR body, extract:
- **Jira ticket**: Look for patterns like `COR-XXXX` in the body, branch name, or Related Issues section (URLs like `atlassian.net/browse/COR-XXXX`)
- **Summary**: Use the `## Summary` section from the PR body if available, otherwise use the PR title

### Step 5: Categorize PRs

Categorize each PR based on its branch name prefix or PR title prefix:

| Prefix | Category |
|--------|----------|
| `feat/`, `feature/`, `feat(` | Feature |
| `fix/`, `hotfix/`, `fix(` | Fix |
| `perf/`, `perf(` | Performance |
| `chore/`, `chore(` | Chore/Update |
| `refactor/`, `refactor(` | Refactor |
| `docs/`, `docs(` | Documentation |

Skip PRs that are:
- Merges from `stage` into `dev` (branch = `stage`)
- Cherry-pick PRs (`cherry-pick/` prefix) — these are duplicates of original PRs

### Step 6: Generate Slack-Formatted Output

Generate the summary in Slack mrkdwn format. Output it as a **copyable text block**:

```
:rocket: *<Branch> Branch Merges — <Date>*

---

:star: *FEATURES*

• *PR #XXX* | `COR-XXXX` — *<PR Title>*
  <1-2 sentence summary from PR body>

• *PR #YYY* — *<PR Title>*
  <1-2 sentence summary>

---

:wrench: *FIXES*

• *PR #ZZZ* | `COR-XXXX` — *<PR Title>*
  <1-2 sentence summary>

---

:zap: *PERFORMANCE*

• *PR #AAA* — *<PR Title>*
  <1-2 sentence summary>

---

:test_tube: *Testing Notes*

• *PR #XXX* (`COR-XXXX`) — <what to test, key scenarios, areas affected>
• *PR #YYY* — <what to test>
• *PR #ZZZ* (`COR-XXXX`) — <what to test>
```

**Formatting rules:**
- Only include category sections that have PRs (skip empty sections)
- Jira ticket shown as `` `COR-XXXX` `` only if one exists, otherwise omit
- Summary should be 1-2 sentences, written for testers (what changed from user perspective)
- Testing Notes should tell testers what to verify for each PR
- Use Slack emoji codes: `:rocket:`, `:star:`, `:wrench:`, `:zap:`, `:test_tube:`, `:broom:` (chore), `:books:` (docs), `:recycle:` (refactor)
- Wrap output in a markdown code block so user can copy-paste easily

### Step 7: Present to User

Show the Slack-formatted summary inside a code block and tell the user they can copy and paste it directly into Slack.

## Arguments

$ARGUMENTS
