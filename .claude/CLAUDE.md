# Words of Soul — Project AI Guidelines

## Available Claude Code Skills

Use the `/skill` command to invoke these:

| Skill | When to use |
|---|---|
| `/run` | Start the dev server, verify a change works in the real browser |
| `/verify` | Confirm a feature or fix works end-to-end before marking done |
| `/code-review` | Review a diff for bugs, simplification, efficiency issues |
| `/simplify` | After implementing — reuse, DRY, cleanup passes |
| `/security-review` | Before merging: check for XSS, injection, auth flaws |
| `/deep-research` | Multi-source research (library choices, design patterns, perf) |
| `/tdd` | Full TDD spec for a unit-testable piece of logic |
| `/init` | Re-generate or update the project CLAUDE.md |
| `/review` | Review a pull request end-to-end |
| `/update-config` | Modify `.claude/settings.json`, hooks, or permissions |
| `/loop` | Recurring task / polling loop |
| `/schedule` | Schedule a one-off or recurring cloud agent |

## AI Working Principles for This Project

### TDD Default (from global `~/.claude/CLAUDE.md`)
- For any **testable logic** (lib functions, converters, composables): PLAN → RED → GREEN → REFACTOR.
- **Skip TDD** for CSS/UI tweaks, config, and visual work — use `/verify` or `/run` instead.
- This project has **no test suite yet** — when the first testable utility is added, set up Vitest at the same time.

### UI Work Principles
- Follow the **Botanical Whisper** design system (`DESIGN.md` tokens, already wired into `app/globals.css`).
- Use semantic token names (`bg-surface`, `text-primary`, `border-outline-variant`) — never raw hex.
- Fonts via utility classes `font-serif` (EB Garamond) and `font-sans` (DM Sans) only.
- Components live in `components/` — layout in `components/layout/`, story UI in `components/stories/`, editor in `components/editor/`.
- For any new page with nav/footer, import `Header` + `Footer` from `components/layout/`.
- **Skip TDD** for all UI/component work — verify visually with `/run`.

### Firebase / Auth Rules
- Never import from `lib/firebase.ts` for auth — always `lib/auth.ts` (lazy load, avoids module-load throw).
- All Firestore CRUD goes through `lib/stories.ts` — do not write Firestore calls inline in pages.
- Storage abstracted in `lib/storage.ts` — callers never import Firebase Storage directly.

### Next.js 16 Gotchas
- Dynamic route `params` are a **Promise** — always `await params` before destructuring.
- Server components can be `async`; client components cannot — keep `'use client'` only where needed.
- ISR: public dashboard uses `revalidate = 60`; admin uses `revalidate = 0`.

### Git
- Always work on a feature branch — never commit directly to `main`.
- One feature per branch/session.
- Commit message style: `type: short description` (e.g. `feat:`, `fix:`, `chore:`, `docs:`).
