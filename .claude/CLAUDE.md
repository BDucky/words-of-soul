# Words of Soul — Project AI Guidelines

## Slash Commands

| Command | Invoked as | Purpose |
|---|---|---|
| `commands/commit.md` | `/commit` | Stage + commit with conventional message (review gate) |
| `commands/git/commit.md` | `/git:commit` | Same — nested alias |
| `commands/git/mr-create.md` | `/git:mr-create` | Open a pull request |
| `commands/git/sync.md` | `/git:sync` | Sync branch with upstream |
| `commands/git/status.md` | `/git:status` | Git status summary |
| `commands/git/worktree-init.md` | `/git:worktree-init` | Create a new worktree |
| `commands/git/worktree-clean.md` | `/git:worktree-clean` | Remove a worktree |
| `commands/lint/audit.md` | `/lint:audit` | Run ESLint audit |
| `commands/lint/resolve.md` | `/lint:resolve` | Fix lint errors |
| `commands/workflow/feature.md` | `/workflow:feature` | Start a feature workflow |
| `commands/workflow/bug.md` | `/workflow:bug` | Start a bug-fix workflow |
| `commands/workflow/implement.md` | `/workflow:implement` | Full implement cycle |
| `commands/workflow/review.md` | `/workflow:review` | Review current changes |
| `commands/handoff.md` | `/handoff` | Session handoff summary |
| `commands/prime.md` | `/prime` | Load project context |

## Built-in Claude Code Skills

| Skill | When to use |
|---|---|
| `/run` | Start the dev server, verify a change in the real browser |
| `/verify` | Confirm a feature works end-to-end before marking done |
| `/code-review` | Review a diff for bugs, simplification, efficiency |
| `/simplify` | Cleanup pass after implementing |
| `/security-review` | Pre-merge check for XSS, injection, auth flaws |
| `/deep-research` | Multi-source research (library choices, perf, patterns) |
| `/tdd` | Full TDD spec for a unit-testable piece of logic |

## AI Working Principles

### Delivery (MANDATORY — never skip)
Before reporting any UI change as done:
1. Start the dev server.
2. Use `playwright-cli` to take a screenshot of the affected page.
3. Visually compare against the reference design.
4. Deliver only after verifying — describe what matches and what differs.

### TDD
- For testable logic (lib functions, utils, converters): PLAN → RED → GREEN → REFACTOR.
- **Skip TDD** for CSS/UI — use playwright-cli to verify visually instead.
- No test suite yet — add Vitest when the first testable utility is ready.

### UI / Design System
- Design system: **Botanical Whisper** (`DESIGN.md` tokens wired into `app/globals.css`).
- Always use semantic token names (`bg-surface`, `text-primary`) — never raw hex.
- Fonts: `font-serif` (EB Garamond) and `font-sans` (DM Sans) utility classes only.
- No arbitrary Tailwind values — use canonical scale equivalents (`max-w-280` not `max-w-[70rem]`).
- No bare `<a>` for internal routes — always `<Link>` from `next/link`.

### Firebase / Auth
- Never import from `lib/firebase.ts` for auth — always use `lib/auth.ts` (lazy load).
- All Firestore CRUD goes through `lib/stories.ts` only.
- Storage operations through `lib/storage.ts` only.

### Next.js 16
- Dynamic route `params` are a **Promise** — always `await params` before destructuring.
- `'use client'` only where necessary — prefer server components.
- ISR: public dashboard `revalidate = 60`, admin `revalidate = 0`.

### Git
- Always work on a feature branch — **never commit directly to `main`**.
- **NEVER commit or push unless the user explicitly asks.**
- One feature per branch/session.
- Commit format: `type(scope): description` — present tense, max 50 chars.

## Hooks (auto-enforced via settings.json)

| Hook | File | What it does |
|---|---|---|
| `PreToolUse` | `hooks/pre_tool_use.py` | Blocks rm outside project, push to protected branches; warns on git reset --hard and sensitive files |
| `PostToolUse` | `hooks/post_tool_use.py` | Logs all tool usage, monitors build/lint failures |
| `UserPromptSubmit` | `hooks/user_prompt_submit.py` | Logs prompts, injects git branch context |
| `Stop` | `hooks/stop.py` | macOS notification when Claude finishes |
| `SubagentStop` | `hooks/subagent_stop.py` | Logs subagent completions |
| `PreCompact` | `hooks/pre_compact.py` | Saves session state before context compaction |
| `Notification` | `hooks/notification.py` | Desktop notification for idle alerts |
