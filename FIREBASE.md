# Firebase Setup & Operations

Project ID: `words-of-soul`

## Services in use

| Service | Purpose |
|---|---|
| Firestore | Story documents (`stories` collection) |
| Storage | Cover image uploads (`covers/` folder) |
| Auth | Admin email/password login |

## Security rules

Rules files are tracked in the repo and deployed via Firebase CLI.

| File | Service |
|---|---|
| `firestore.rules` | Firestore read/write gates |
| `storage.rules` | Storage upload/download gates |
| `firebase.json` | CLI deployment config |
| `.firebaserc` | Project alias (`default` → `words-of-soul`) |

### Firestore rules summary

- **Read**: open to all — including unauthenticated server-side requests (ISR/SSR)
- **Write** (create/update/delete): authenticated admin only

> **Why open reads?** Next.js server components (`app/page.tsx`, `app/admin/page.tsx`) call
> `getPublishedStories()` / `getAllStories()` on the server using the Firebase **client** SDK.
> There is no logged-in user on the server — `request.auth` is always null. A read rule of
> `resource.data.published == true || request.auth != null` blocks all server-side reads and
> causes silent empty pages. Stories are public content for a personal blog, so open reads
> are the correct design here. Drafts being technically queryable via Firestore console is
> acceptable. If multi-tenant privacy is needed later, migrate to Firebase Admin SDK for SSR.

### Storage rules summary

- **Public**: read any file (cover images served to story readers)
- **Authenticated admin**: write (upload/delete) any file

### Deploying rules

```bash
# Deploy both Firestore and Storage rules
firebase deploy --only firestore:rules,storage

# Deploy one at a time
firebase deploy --only firestore:rules
firebase deploy --only storage
```

If `firebase` CLI is not installed:

```bash
npm install -g firebase-tools
firebase login
```

## Common errors and fixes

### `Missing or insufficient permissions` (Firestore write)

The Firestore security rules are blocking the operation. Symptoms:
- Story create/update fails with 403 or "Missing or insufficient permissions"
- Firestore Write channel returns non-200

Fix: deploy updated `firestore.rules` (see above).

### `Permission denied` (Storage upload)

The Storage security rules are blocking the upload. Symptoms:
- Cover image POST to `firebasestorage.googleapis.com` returns 403
- `uploadBytes` throws in `lib/storage.ts`

Fix: deploy updated `storage.rules` (see above).

### Auth not initialized error

Caused by importing from `lib/firebase.ts` for auth. Always use `lib/auth.ts`:

```ts
// WRONG
import { getAuth } from '@/lib/firebase'

// CORRECT
import { getFirebaseAuth } from '@/lib/auth'
```

## Code conventions

All Firebase access is funnelled through three lib files — never call Firebase SDK directly from components:

| Module | File | What it owns |
|---|---|---|
| Firestore CRUD | `lib/stories.ts` | All story reads and writes |
| Storage | `lib/storage.ts` | `uploadImage()` / `deleteImage()` |
| Auth | `lib/auth.ts` | `getFirebaseAuth()` / `signIn()` / `signOut()` |

`lib/firebase.ts` only exports `db`, `storage`, `app` — never auth (it is lazy-loaded to avoid throwing when env vars are absent during SSR/build).

## Environment variables

All in `.env.local` (gitignored). Keys:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_ADMIN_EMAIL   # informational only — access control is via Firestore rules + UID
```

## Firestore data model

Collection: `stories`

| Field | Type | Notes |
|---|---|---|
| `title` | string | |
| `slug` | string | URL-safe, unique, auto-generated from title |
| `excerpt` | string | 1–2 sentence summary |
| `content` | string | TipTap HTML |
| `coverImage` | string | Firebase Storage download URL |
| `category` | string | One of `CATEGORIES` from `types/story.ts` |
| `readTimeMinutes` | number | Calculated from word count ÷ 200 |
| `publishedAt` | Timestamp | Set on create, never updated |
| `updatedAt` | Timestamp | Updated on every save |
| `published` | boolean | `false` = draft |
| `authorId` | string | Firebase Auth UID of creator; `''` for legacy docs |

### authorId ownership model

- Stamped on `createStory()` from `getFirebaseAuth().currentUser?.uid`
- On edit, preserved from the original document
- Legacy docs (`authorId === ''`) are editable by any admin
- `StoryCardActions` and `StoryForm` gate edit/delete on `authorId === currentUid || !authorId`
