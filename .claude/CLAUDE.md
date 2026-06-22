# Words of Soul — Project AI Guidelines

## Slash Commands

| Command | Purpose |
|---|---|
| `/commit` | Stage + commit with conventional message (review gate) |
| `/pr` | Create a pull request |
| `/sync` | Sync branch with upstream |
| `/branch` | Create a new feature branch |
| `/git-status` | Git status summary |
| `/feature` | Start a feature workflow |
| `/bug` | Start a bug-fix workflow |
| `/implement` | Full implement cycle |
| `/lint` | Fix lint errors |
| `/handoff` | Session handoff summary |
| `/prime` | Load project context |

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

> Full reference: `FIREBASE.md` — read it before any Firebase task.

**Before touching any Firebase feature, always:**
1. Check `firestore.rules` and `storage.rules` are consistent with the change.
2. If rules need updating, edit the relevant `.rules` file **and** remind the user to deploy:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```
3. Verify `.env.local` has all required `NEXT_PUBLIC_FIREBASE_*` keys before assuming SDK calls will work.

**Code conventions (never bypass):**
- Never import from `lib/firebase.ts` for auth — always use `lib/auth.ts` (lazy load).
- All Firestore CRUD goes through `lib/stories.ts` only — never call Firestore SDK directly from components.
- Storage operations through `lib/storage.ts` only.
- Never call Firebase SDK directly from a component — always go through the lib layer.

**Common 403/permission errors:**
- `Missing or insufficient permissions` on Firestore write → `firestore.rules` needs updating + deploy.
- `Permission denied` on Storage upload → `storage.rules` needs updating + deploy.
- Both errors look like network failures but are rules mismatches — check rules first before debugging code.

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
