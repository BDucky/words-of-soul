# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Warning: Next.js 16

This project uses **Next.js 16**, which has breaking API changes from versions in most training data. Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`. Heed all deprecation notices — do not assume Next.js 13/14/15 patterns work here.

Notable difference: dynamic route `params` are now a **Promise** — always `await params` before destructuring (see `app/admin/stories/[id]/edit/page.tsx` for the correct pattern).

## Commands

```bash
npm run dev      # dev server (Turbopack) — check terminal for actual port, 3000 is often taken
npm run build    # production build + TypeScript check
npm run lint     # ESLint
```

No test suite yet.

## Architecture

**Stack:** Next.js 16 App Router · Tailwind CSS v4 · Firebase (Firestore + Storage + Auth) · TipTap v3

### Three views

| Route | Type | Purpose |
|---|---|---|
| `/` | Server (ISR 60s) | Public dashboard — hero, featured grid |
| `/stories/[slug]` | SSG | Public story reader |
| `/admin/*` | Server + Client | Auth-gated editor |

### Auth flow

`AdminAuthGuard` (`components/layout/AdminAuthGuard.tsx`) is a client component wrapping the entire `/admin` layout. It calls `onAuthStateChanged` and redirects unauthenticated users to `/admin/login`. The guard renders `null` until Firebase resolves auth state — no flash of protected content.

**Auth is always lazy.** Never import from `lib/firebase.ts` for auth — import from `lib/auth.ts` only (avoids a module-load throw when env vars are absent).

### Firebase wiring

- `lib/firebase.ts` — exports `db`, `storage`, `app`. Safe to import anywhere.
- `lib/auth.ts` — exports `getFirebaseAuth()`, `signIn()`, `signOut()`. Admin-only imports.
- `lib/stories.ts` — all Firestore CRUD. `toStory()` is the single mapping function from Firestore doc → `Story` type.
- `lib/storage.ts` — `uploadImage()` / `deleteImage()`. Swap the body to change storage providers without touching callers.
- `lib/site.ts` — `SITE_NAME` and `SITE_TAGLINE` constants. Import from here, never hardcode.

### Data model

`types/story.ts` defines the `Story` interface and `StoryInput` (= Story minus auto-set fields). `CATEGORIES` is the canonical Vietnamese category list — always import from here.

### Design system

Tailwind v4 with `@theme` tokens in `app/globals.css`. Use semantic token names (`bg-surface`, `text-primary`, `border-outline-variant`) — never raw hex values. Fonts are CSS variables `--font-serif` (EB Garamond) and `--font-sans` (DM Sans), applied via `font-serif` / `font-sans` utility classes.

### Editor

`StoryForm` is a client component that owns all editor state. `RichTextEditor` (TipTap) is dynamically imported with `ssr: false`. `CoverImageUpload` calls `lib/storage.ts` directly. Slug auto-generates from title on create; on edit it only auto-updates if the slug still matches the original title's slug.

### Image domains

`next.config.ts` allowlists `firebasestorage.googleapis.com` and `images.unsplash.com`. Add new domains there before using `<Image>` with external sources.

### Environment

All Firebase config lives in `.env.local` (gitignored). Keys are `NEXT_PUBLIC_FIREBASE_*`. `NEXT_PUBLIC_ADMIN_EMAIL` is informational — access control is enforced by Firestore/Storage security rules using the user's UID, not email.
