---
description: "Error Guard: Generate third-party error scenario tests for changed files. Args: [scope] (default: affected) - full|affected|<file-paths>"
---

# Error Guard: Third-Party Error Scenario Tests

Scan changed code for **API calls and third-party integrations**, then generate comprehensive **error scenario tests** to verify the frontend handles failures gracefully.

## Goal

> "If 3rd-party returns an error, the FE must handle it thoroughly — no white screens, no unhandled rejections, no silent failures."

**Every external dependency = a potential failure point.**
This command ensures each one has tests that simulate real-world failures.

## Auto-Fix Policy

**This skill has zero tolerance for UI-breaking error handling.** At every phase, if any of the following is detected — auto-fix it immediately using the Edit tool, without asking for confirmation:

| Detected Issue | Auto-Fix Action |
|---------------|-----------------|
| `isLoading/isValidating/isSubmitting = true` with no `finally` reset | Wrap call in `try/catch/finally`, reset state in `finally` |
| `await thirdPartyCall()` with no `try/catch` | Add `try/catch`, log with `logger.warn`, set error state |
| Submit handler returns early on error but spinner still runs | Add `finally { isLoading.value = false }` |
| Error thrown but no user-visible feedback | Add error state ref, show alert in template |
| `router.push()` after API call with no error handling | Wrap in try/catch, handle navigation failure |

**Auto-fix format — always report before and after:**
```
🚨 AUTO-FIX [{file}:{line}]
Problem : isValidating is never reset when validateStreetAddress throws
Impact  : Form freezes — user cannot retry or close after network failure
Fix     : Added finally block to reset isValidating.value = false
```

---

## Workflow

```
/test:error-guard
    │
    ├─→ Phase 1: DETECT — Find API/third-party calls in changed files
    │
    ├─→ Phase 2: ANALYZE — Categorize by type & map failure scenarios
    │
    ├─→ Phase 3: GENERATE — Write error scenario tests
    │
    └─→ Phase 4: RUN & VALIDATE — Run tests, fix failures (max 3 retries)
```

---

## Arguments

| Argument | Description |
|----------|-------------|
| _(empty)_ | Scan changed files only (default) |
| `affected`, `changed` | Same as default |
| `full`, `all` | Scan entire codebase |
| `<file-paths>` | Scan specific files |

---

## Phase 1: DETECT

### Step 1.1: Get Changed Files

```bash
# Check for ADW worktree state
state_file=$(ls .ai/agents/*/adw_state.json 2>/dev/null | head -1)
if [ -n "$state_file" ]; then
  base_branch=$(cat "$state_file" | jq -r '.worktree.base_branch // "origin/dev"')
else
  base_branch="origin/dev"
fi

# Get changed source files (exclude test files)
git diff --name-status ${base_branch}...HEAD \
  | grep -E '\.(ts|vue)$' \
  | grep -v '\.spec\.' \
  | grep -v '\.test\.' \
  | grep -v '__tests__' \
  | grep -v 'index\.ts$' \
  | grep -v '\.d\.ts$'
```

### Step 1.2: Scan for Third-Party Calls

Read each changed file and identify calls matching these patterns:

#### GraphQL Calls
```
Pattern: useMutation, useQuery, useSubscription, graphql client calls
Files: api/*.ts, *.api.ts, composables using GraphQL operations
Imports: @corjl/plugins/graphql, @/api/*, @/modules/*/api/*
```

#### External Service Calls
```
Pattern: Smarty, Pusher, AWS Amplify/Cognito, Sentry, Stripe, third-party SDKs
Files: services/, plugins/, any file importing external SDK packages
Imports: smartystreets-javascript-sdk, pusher-js, aws-amplify, @aws-amplify/*, @sentry/vue
```

#### REST/HTTP Calls
```
Pattern: fetch(), axios.get/post/put/delete, XMLHttpRequest
Files: api clients, services
Signs: url strings, HTTP methods, response.json()
```

#### Browser APIs (can fail)
```
Pattern: indexedDB, navigator.clipboard, FileReader, window.localStorage, navigator.serviceWorker
Signs: browser-specific API usage that requires permissions or can hit quotas
```

### Step 1.3: Build Dependency Map

For each file with detected calls, create a map:

```
file: src/modules/orders/composables/useCreateOrder.ts
calls:
  - type: graphql, fn: orderApi.createPreOrder, mock: @/modules/orders/api/orderApi
  - type: graphql, fn: orderApi.initiateManualOrder, mock: @/modules/orders/api/orderApi
  - type: external, fn: useRouter.push (vue-router — can fail on nav guard)

file: src/services/smarty.service.ts
calls:
  - type: external, sdk: smartystreets-javascript-sdk, fn: client.send
  - type: rest, fn: fetch (fallback)
```

---

## Phase 2: ANALYZE — Map Failure Scenarios

### ⚠️ CRITICAL RULE: Stop & Fix Before Generating Tests

Before mapping scenarios, **read the source code** and check: if any third-party call fails, does it leave the UI in an unusable state?

**Signs of a broken UI state:**
- `isLoading` / `isValidating` / `isSubmitting` set to `true` but never reset on error
- `await apiCall()` in a try block with no catch → unhandled rejection → Vue error boundary breaks the page
- Form submit handler returns early on error but doesn't clear a loading spinner
- A ref is set before the call but never cleared if the call throws
- `router.push()` called after an API call with no error handling — user stuck on wrong page

**If any of these are found → DO NOT STOP. Report AND auto-fix immediately, then continue:**

```
🚨 BLOCKING ISSUE FOUND in {file}:{line}
Problem: {function} sets isLoading=true but has no catch block — API error leaves UI frozen
Impact: User cannot interact with the form after any network failure
Auto-fixing now...
```

**Apply the fix directly to the source file using the Edit tool.** Do not ask for confirmation — fix it, report what was changed, then continue to Phase 3.

**The fix pattern:**
```typescript
// ❌ Before — UI freezes on error
const handleSubmit = async () => {
  isLoading.value = true;
  await apiCall(); // throws → isLoading never reset
  isLoading.value = false;
};

// ✅ After — UI always recovers
const handleSubmit = async () => {
  isLoading.value = true;
  try {
    await apiCall();
  } catch (error) {
    logger.warn(LOG_SOURCE.CORE, LOG_DOMAIN.API, 'handleSubmit failed', { error });
    // show error to user if needed
  } finally {
    isLoading.value = false; // always reset
  }
};
```

After auto-fixing all blocking issues, continue to map all scenarios:

For each detected call type, map the error scenarios to test:

### Happy Path Baseline (REQUIRED for every test suite)

**Every error scenario suite MUST start with a passing baseline test.** Without it, failing tests are ambiguous — you can't tell if the error scenario broke something or if the baseline was already broken.

| Scenario | Mock Setup | What to Verify |
|----------|------------|----------------|
| **API success** | `mockFn.mockResolvedValue({ ...validData })` | Data processed correctly, loading reset, no error state set |
| **Empty result (valid)** | `mockFn.mockResolvedValue([])` or `mockFn.mockResolvedValue(null)` | Empty state rendered correctly, no crash |

**Rule**: If the baseline test fails → stop. Fix the source or test setup before writing error scenarios.

---

### GraphQL Partial Error (error + data) — Framework-Level Scenario

> **This project's `GraphQLClient` handles partial errors at the framework level.**
> When GraphQL returns `{ errors: [...], data: { field: {...} } }` with valid data,
> `GraphQLClient.executeQuery()` returns the data silently — composables see success, not error.

**Where to test:**
- ✅ Test at **`GraphQLClient`** level to verify the framework behavior
- ❌ Do NOT test at composable/store/component level — they receive data as success

| Scenario | Mock Setup | What to Verify |
|----------|------------|----------------|
| **Error + full data** | Mock `client.graphql` to throw `{ errors: [...], data: { field: {...valid...} } }` | Data returned, no toast shown, no throw, Sentry notified |
| **Error + empty data** | Mock `client.graphql` to throw `{ errors: [...], data: { field: null } }` | CustomError thrown (falls through to normal error path) |
| **Error + partial items** | Mock `client.graphql` to throw `{ errors: [...], data: { field: { items: [...] } } }` | Data with items returned, not thrown |

**Detection rule**: If the file under test calls `GraphQLClient` methods directly (`.fetch`, `.get`, `.post`), or if you're scanning `GraphQLClient.ts` itself — generate partial error tests. Otherwise, skip (composables are covered by the framework).

---

### Cache / Guard Conditions (early return)

**Detect these patterns in the source code:**

```typescript
// Pattern 1: cache guard
if (someList.value.length) return;

// Pattern 2: flag guard
if (isAlreadyLoaded.value) return;

// Pattern 3: dependency guard
if (!userId || !orgId) return;
```

**For each guard found, test:**

| Scenario | Mock Setup | What to Verify |
|----------|------------|----------------|
| **Cache hit** | Pre-populate the cached ref with data | API NOT called, existing data preserved |
| **Cache miss** | Leave cache empty | API IS called, data loaded and stored |
| **Guard condition false** | Set guard to `false`/empty | API skipped, no loading state, no error |
| **Guard condition true** | Set guard to `true`/present | Normal API flow executes |

**Mock pattern for cache tests:**
```typescript
// Verify API is NOT called when cache exists
it('should not call API when data is already cached', async () => {
  store.listAddresses = [mockAddress]; // pre-populate cache

  await loadAddresses();

  expect(mockApi.listAddressesByUser).not.toHaveBeenCalled();
  expect(store.listAddresses).toHaveLength(1); // cache preserved
});
```

---

### GraphQL Error Scenarios

| Scenario | Mock Setup | What to Verify |
|----------|------------|----------------|
| **Network error** | `mockFn.mockRejectedValue(new Error('Network Error'))` | Error message shown, loading reset, no crash |
| **GraphQL error response** | `mockFn.mockResolvedValue({ errors: [{ message: 'Forbidden' }] })` | Error handled, not treated as success |
| **Partial data (null fields)** | `mockFn.mockResolvedValue({ data: { field: null } })` | Graceful null handling, no TypeError |
| **Authentication error** | `mockFn.mockRejectedValue(new Error('401 Unauthorized'))` | Redirect or auth error shown |
| **Timeout** | `mockFn.mockRejectedValue(new Error('Request timeout'))` | Timeout message shown |
| **Server error** | `mockFn.mockRejectedValue(new Error('500 Internal Server Error'))` | Generic error, not raw stack |

### External Service Error Scenarios

| Scenario | Mock Setup | What to Verify |
|----------|------------|----------------|
| **Service unavailable** | `mockFn.mockRejectedValue(new Error('Service unavailable'))` | Fallback used or error shown |
| **Malformed response** | `mockFn.mockResolvedValue(null)` or `mockFn.mockResolvedValue({})` | Null-safe handling |
| **Auth token expired** | `mockFn.mockRejectedValue(new Error('Token expired'))` | Re-auth flow or error message |
| **Rate limit** | `mockFn.mockRejectedValue(new Error('Too many requests'))` | Rate limit message shown |
| **SDK initialization failure** | Throw in constructor/setup | Graceful degradation without SDK |

### REST API Error Scenarios

| Scenario | Mock Setup | What to Verify |
|----------|------------|----------------|
| **Network error** | `mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))` | Error state shown |
| **HTTP 400** | `{ ok: false, status: 400, json: () => ({ message: 'Bad Request' }) }` | Validation error surfaced |
| **HTTP 401** | `{ ok: false, status: 401 }` | Auth redirect or error |
| **HTTP 403** | `{ ok: false, status: 403 }` | Permission denied message |
| **HTTP 404** | `{ ok: false, status: 404 }` | Not found handled |
| **HTTP 500** | `{ ok: false, status: 500 }` | Generic server error shown |
| **Empty response** | `{ ok: true, json: () => null }` | Null response handled |

### Vue Component UI State Scenarios

When a changed file is a `.vue` component, also scan the template for error state bindings:

| Template pattern | Scenario to test | What to verify |
|-----------------|------------------|----------------|
| `v-if="errorState \|\| alertVisible"` | Submit with API failure | Error element is visible after submit |
| `v-if="isLoading \|\| isValidating"` | API in-flight then fails | Loading element gone after error |
| `v-if="suggestedAddress \|\| candidates"` | API returns partial/alternative data | Confirmation panel shown, no error |
| `emit('submit')` / `emit('update')` | API fails | Event NOT emitted — form is blocked |
| Fail-open pattern (service unavailable) | API completely down | No error shown, form submits normally |

**Rule**: For every component-level `v-if` tied to an error ref — there must be a test that goes through the full submit flow and verifies the element's visibility.

### Browser API Error Scenarios

| API | Scenario | Mock Setup | What to Verify |
|-----|----------|------------|----------------|
| **IndexedDB** | Quota exceeded | `throw new DOMException('QuotaExceededError')` | Fallback to memory/network |
| **IndexedDB** | Open failure | `indexedDB.open` rejects | App still loads |
| **Clipboard** | Permission denied | `throw new DOMException('NotAllowedError')` | Error toast shown |
| **FileReader** | Read error | `reader.onerror` fired | File error shown |
| **localStorage** | Storage full | `throw new DOMException('QuotaExceededError')` | Silent fail or warning |

---

## Phase 3: GENERATE — Write Error Scenario Tests

### Step 3.1: Create or Update Test Files

Test file location follows existing conventions:
- `src/services/cart.ts` → `src/__tests__/services/cart.spec.ts`
- `composables/useAuth.ts` → `__tests__/composables/useAuth.spec.ts`

**If a spec file already exists:** ADD a new `describe('error scenarios')` block — do NOT rewrite existing tests.

**If no spec file exists:** Create a new spec file with both happy-path and error-scenario blocks.

### Step 3.2: Happy Path + Cache + Partial Error Patterns

```typescript
// ─── Happy Path Baseline ──────────────────────────────────────────────────
describe('when API succeeds', () => {
  it('should load data and reset loading state', async () => {
    mockApi.listAddressesByUser.mockResolvedValue([mockAddress]);

    await loadAddresses();

    expect(store.listAddresses).toHaveLength(1);
    expect(isFetchingPage.value).toBe(false);
    expect(isStepError.value).toBe(false);
  });

  it('should handle empty result without crashing', async () => {
    mockApi.listAddressesByUser.mockResolvedValue([]);

    await loadAddresses();

    expect(store.listAddresses).toHaveLength(0);
    expect(isStepError.value).toBe(false);
  });
});

// ─── Cache / Guard Conditions ─────────────────────────────────────────────
describe('cache / guard conditions', () => {
  it('should skip API call when data is already cached', async () => {
    store.listAddresses = [mockAddress]; // pre-populate

    await loadAddresses();

    expect(mockApi.listAddressesByUser).not.toHaveBeenCalled();
    expect(store.listAddresses).toHaveLength(1); // preserved
  });

  it('should call API when cache is empty', async () => {
    store.listAddresses = [];
    mockApi.listAddressesByUser.mockResolvedValue([mockAddress]);

    await loadAddresses();

    expect(mockApi.listAddressesByUser).toHaveBeenCalledOnce();
  });
});

// ─── GraphQL Partial Error (test at GraphQLClient level only) ─────────────
// NOTE: Only generate this block when scanning GraphQLClient.ts itself.
// Composables/stores do NOT need these tests — they see the result as success.
describe('GraphQLClient — partial error with data', () => {
  it('should return data when GraphQL response has errors + valid data', async () => {
    const partialResponse = {
      errors: [{ message: 'non-critical resolver error' }],
      data: { listAddressesByUser: { items: [mockAddress] } },
    };
    vi.mocked(amplifyGenerateClient().graphql).mockRejectedValue(partialResponse);

    const result = await client.fetch(listAddressesByUserQuery, {});

    expect(result).toEqual(partialResponse.data); // data returned
  });

  it('should throw when GraphQL response has errors + null data', async () => {
    const errorResponse = {
      errors: [{ message: 'fatal error' }],
      data: { listAddressesByUser: null },
    };
    vi.mocked(amplifyGenerateClient().graphql).mockRejectedValue(errorResponse);

    await expect(client.fetch(listAddressesByUserQuery, {})).rejects.toThrow();
  });
});
```

### Step 3.3: Error Scenario Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

// --- Mock third-party dependencies BEFORE importing the code under test ---
vi.mock('@/modules/orders/api/orderApi', () => ({
  default: {
    createPreOrder: vi.fn(),
    initiateManualOrder: vi.fn(),
  },
}));

vi.mock('@corjl/plugins/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import orderApi from '@/modules/orders/api/orderApi';
import useCreateOrder from '@/modules/orders/composables/useCreateOrder';

describe('useCreateOrder — error scenarios', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('when createPreOrder API fails', () => {
    it('should handle network error without crashing', async () => {
      vi.mocked(orderApi.createPreOrder).mockRejectedValue(
        new Error('Network Error'),
      );

      const { createDirectOrderLink } = useCreateOrder();

      // Should not throw — error must be caught internally
      await expect(
        createDirectOrderLink({ orgId: 'org-1', designs: [], listings: [] } as any),
      ).resolves.not.toThrow();
    });

    it('should handle server error (500) without crashing', async () => {
      vi.mocked(orderApi.createPreOrder).mockRejectedValue(
        new Error('500 Internal Server Error'),
      );

      const { createDirectOrderLink, isLoading } = useCreateOrder();

      await createDirectOrderLink({ orgId: 'org-1', designs: [], listings: [] } as any).catch(() => {});

      // Loading state must be reset after error
      expect(isLoading?.value).toBe(false);
    });

    it('should handle timeout without crashing', async () => {
      vi.mocked(orderApi.createPreOrder).mockRejectedValue(
        new Error('Request timeout'),
      );

      const { createDirectOrderLink } = useCreateOrder();

      await expect(
        createDirectOrderLink({ orgId: 'org-1', designs: [], listings: [] } as any),
      ).resolves.not.toThrow();
    });
  });

  describe('when API returns partial/null data', () => {
    it('should handle null orderId in response without crashing', async () => {
      vi.mocked(orderApi.createPreOrder).mockResolvedValue(null as any);

      const { createDirectOrderLink } = useCreateOrder();

      await expect(
        createDirectOrderLink({ orgId: 'org-1', designs: [], listings: [] } as any),
      ).resolves.not.toThrow();
    });
  });
});
```

### Step 3.3: External Service Error Test Pattern

```typescript
// Pattern for Smarty or any external SDK
vi.mock('smartystreets-javascript-sdk', () => ({
  core: {
    buildClient: vi.fn(() => ({
      send: vi.fn(),
    })),
    StaticCredentials: vi.fn(),
  },
  usStreet: {
    Batch: vi.fn(() => ({ add: vi.fn(), lookups: [] })),
    Lookup: vi.fn(),
  },
}));

import { SmartyService } from '@/services/smarty.service';
import * as smarty from 'smartystreets-javascript-sdk';

describe('SmartyService — error scenarios', () => {
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSend = vi.fn();
    vi.mocked(smarty.core.buildClient).mockReturnValue({ send: mockSend } as any);
  });

  it('should return null when service is unavailable', async () => {
    mockSend.mockRejectedValue(new Error('Service unavailable'));

    const service = new SmartyService();
    const result = await service.validateAddress({ street: '123 Main St' } as any);

    expect(result).toBeNull(); // Graceful fallback
  });

  it('should return null on malformed response', async () => {
    mockSend.mockResolvedValue(undefined);

    const service = new SmartyService();
    const result = await service.validateAddress({ street: '123 Main St' } as any);

    expect(result).toBeNull();
  });

  it('should not expose raw error to caller', async () => {
    mockSend.mockRejectedValue(new Error('Internal SDK error'));

    const service = new SmartyService();

    // Must resolve (not reject) — error is swallowed gracefully
    await expect(service.validateAddress({ street: '123 Main St' } as any)).resolves.not.toThrow();
  });
});
```

### Step 3.4: Browser API Error Test Pattern

```typescript
// Pattern for IndexedDB failures
describe('when IndexedDB is unavailable', () => {
  it('should fall back to network fetch on QuotaExceededError', async () => {
    const mockIDBOpen = vi.spyOn(window.indexedDB, 'open').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    const { loadCachedData } = useDesignCache();
    const result = await loadCachedData('design-1');

    // Should still return data from network fallback
    expect(result).toBeDefined();
    mockIDBOpen.mockRestore();
  });
});

// Pattern for Clipboard API
describe('when Clipboard API is denied', () => {
  it('should show error toast without crashing', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new DOMException('NotAllowedError', 'NotAllowedError'),
    );

    const mockToast = vi.fn();
    vi.mock('vue-toastification', () => ({ useToast: () => ({ error: mockToast }) }));

    const { copyToClipboard } = useClipboard();
    await copyToClipboard('some text');

    expect(mockToast).toHaveBeenCalled();
  });
});
```

### Step 3.5: Component UI Error Display Test Pattern

When a **Vue component** uses a service/composable that calls a third party, generate tests that verify the **user actually sees the error** — not just that the code doesn't crash.

**How to identify what the UI should show:**
1. Read the component template — find `v-if` conditions tied to error state (`addressValidationError`, `isError`, `errorMessage`, etc.)
2. Read the `handleSubmit` / action handler — trace what happens after a failed call (does it set an error ref? does it return early?)
3. Check if there's a loading/submitting state that must be reset

```typescript
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import MyFormComponent from '@corjl/core/components/MyFormComponent.vue';

// Mock the composable that wraps the third-party call
const mockApiCall = vi.fn();
const mockErrorState = ref(false);
const mockLoadingState = ref(false);

vi.mock('@corjl/core/composables/useMyComposable', () => ({
  useMyComposable: vi.fn(() => ({
    isError: mockErrorState,
    isLoading: mockLoadingState,
    submit: mockApiCall,
  })),
}));

describe('MyFormComponent — UI error display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockErrorState.value = false;
    mockLoadingState.value = false;
    mockApiCall.mockResolvedValue(true);
  });

  it('should show error alert to user after submit with invalid/failed API response', async () => {
    // Simulate composable setting error state after API failure
    mockApiCall.mockImplementation(async () => {
      mockErrorState.value = true;
      return false;
    });

    const wrapper = mount(MyFormComponent, {
      global: { mocks: { $t: (k: string) => k } },
    });

    await (wrapper.vm as any).handleSubmit();
    await wrapper.vm.$nextTick();

    // User MUST see the error — not a silent failure or blank screen
    const errorEl = wrapper.find('[data-testid="error-alert"]');
    expect(errorEl.exists()).toBe(true);

    // Loading state MUST be reset — button not stuck in loading
    expect(mockLoadingState.value).toBe(false);
  });

  it('should NOT show error when API fails gracefully (fail open)', async () => {
    // e.g. Smarty unavailable → composable returns true → user proceeds
    mockApiCall.mockResolvedValue(true);

    const wrapper = mount(MyFormComponent, {
      global: { mocks: { $t: (k: string) => k } },
    });

    await (wrapper.vm as any).handleSubmit();
    await wrapper.vm.$nextTick();

    // No error shown — user can proceed normally
    const errorEl = wrapper.find('[data-testid="error-alert"]');
    expect(errorEl.exists()).toBe(false);
  });

  it('should show confirmation/fallback UI instead of error when API returns partial data', async () => {
    // e.g. address has suggestions, or needs user confirmation
    mockApiCall.mockImplementation(async () => {
      // composable sets a "needs confirmation" state
      return false;
    });

    const wrapper = mount(MyFormComponent, {
      global: { mocks: { $t: (k: string) => k } },
    });

    await (wrapper.vm as any).handleSubmit();
    await wrapper.vm.$nextTick();

    // User sees a confirmation panel, NOT a raw error
    expect(wrapper.text()).toContain('please_confirm'); // or whatever the i18n key is
    const errorEl = wrapper.find('[data-testid="error-alert"]');
    expect(errorEl.exists()).toBe(false);
  });

  it('should not submit data when API returns error', async () => {
    mockApiCall.mockImplementation(async () => {
      mockErrorState.value = true;
      return false;
    });

    const wrapper = mount(MyFormComponent, {
      global: { mocks: { $t: (k: string) => k } },
    });

    await (wrapper.vm as any).handleSubmit();

    // No data emitted to parent — form blocked on error
    expect(wrapper.emitted('submit')).toBeFalsy();
    expect(wrapper.emitted('update')).toBeFalsy();
  });
});
```

**What to look for in the component template to know what to assert:**

| Template pattern | Test assertion |
|-----------------|----------------|
| `v-if="alertVisible && validationAlert"` | After submit with error: `alertVisible = true` AND error state set → alert element exists |
| `v-if="isLoading"` | After API resolves/rejects: loading element gone |
| `v-if="suggestedAddress \|\| candidates.length"` | After API returns suggestion: confirmation panel exists |
| `@click="handleSubmit"` | Trigger via `vm.handleSubmit()` directly (more reliable than DOM click in unit tests) |
| No `data-testid` | Assert on i18n text with `wrapper.text().toContain('i18n_key')` |

---

## Phase 4: RUN & VALIDATE

### Step 4.1: Run Generated Tests

```bash
# Run only the newly created/modified test files
pnpm test -- {test-file-paths}
```

### Step 4.2: Auto-Resolve Failures (max 3 attempts)

For each failing test, apply the Auto-Fix Policy — **fix source code first, fix test only if source is correct**:

| Failure | Root Cause | Auto-Fix Action |
|---------|------------|-----------------|
| `Expected resolved, got rejected` | Source not catching error → UI crashes | Fix source: add try/catch, reset loading state |
| `expected false, received true` on loading state | `finally` block missing | Fix source: add `finally { isLoading.value = false }` |
| `expected element to exist` (error alert missing) | Error state never set on failure | Fix source: set error ref in catch block |
| `mockFn is not a function` | Mock shape wrong | Fix mock factory |
| `Cannot read property of undefined` | Null response not handled | Fix source: add null-guard |
| `Timeout` | Async not awaited properly | Add `await vi.waitFor(...)` |
| `import error` | Wrong mock path | Fix mock path |

**Rule**: A test that reveals UI-breaking behavior = source code bug. Fix the source, not the test.

### Step 4.3: Lint & Typecheck

```bash
pnpm lint:affected --fix
pnpm typecheck:affected
```

---

## Key Rules

1. **Never mock the module under test** — only mock its dependencies
2. **Mock before import** — `vi.mock(...)` hoisted automatically
3. **Reset in `beforeEach`** — `vi.clearAllMocks()` every test
4. **Test the contract, not the implementation** — verify user-visible behavior (error shown, loading reset, no crash)
5. **If source code crashes on error → fix the source first** — tests must pass because code is correct, not because tests are lenient
6. **logger must be mocked** — always mock `@corjl/plugins/logger` to prevent console noise
7. **No `any` in test assertions** — use proper types or `as SomeType`

---

## Checklist: What "Handling an Error" Means

### Phase 2 Blocking Check (fix source before writing tests)
- [ ] **No frozen loading state** — every `isLoading = true` has a `finally { isLoading = false }` or equivalent
- [ ] **No unhandled async** — every `await thirdPartyCall()` is inside try/catch
- [ ] **No stuck UI** — error path does not leave buttons disabled, forms unsubmittable, or page unresponsive

### Phase 4 Test Verification
For each error scenario test, verify ALL of these:

- [ ] **No unhandled promise rejection** — errors caught internally
- [ ] **Loading state reset** — `isLoading` / `isPending` back to `false`
- [ ] **User-visible feedback** — error message shown OR graceful fallback rendered
- [ ] **No raw error exposed** — no stack traces or SDK internals in UI
- [ ] **App still functional** — other features still work after the error

---

## Report

After completion, output a developer-readable report in this format:

```
## Error Guard Report

### Files Scanned: {n}
### Third-party calls found: {n}

---

### 🔧 Auto-Fixed Issues ({n} issues)

> These were UI-breaking bugs found and fixed automatically.
> Read each item to understand what was wrong and why it was fixed.

#### 1. {file} — {function}
**Root Cause:**
`{function}` called `{thirdPartyFn}()` without a try/catch. When the API returns
a network error or timeout, the thrown exception was unhandled — causing Vue's
error boundary to catch it and render a blank screen. `isLoading` was never reset,
leaving the submit button permanently disabled.

**User Impact:**
Any network hiccup (slow connection, Smarty down, rate limit) would freeze the form.
The user could not retry, close, or do anything without refreshing the page.

**Solution Applied:**
- Wrapped `{thirdPartyFn}()` in `try/catch/finally`
- `finally` block resets `isLoading.value = false` unconditionally
- `catch` block logs the error with `logger.warn` and sets `errorMessage.value`
  so the user sees a clear error alert instead of a frozen UI

**Code change:** `{file}` lines {from}–{to}

---

#### 2. {file} — {function}
**Root Cause:** ...
**User Impact:** ...
**Solution Applied:** ...

---

### 🧪 Tests Generated

| File | Call Type | Scenarios Tested |
|------|-----------|-----------------|
| useCreateOrder.ts | GraphQL (orderApi) | **baseline**, network error, 500, timeout, null response |
| smarty.service.ts | External SDK (Smarty) | **baseline**, unavailable, malformed, null |
| useDesignCache.ts | Browser API (IndexedDB) | **baseline**, quota exceeded, **cache hit**, cache miss |
| GraphQLClient.ts | GraphQL framework | partial error + data, partial error + null data |

### Tests Generated: {n} new | {n} updated
### Tests Passing: {n}/{n}

---

### ✅ Summary for Developers

| # | File | Issue | Fixed |
|---|------|-------|-------|
| 1 | {file} | isLoading not reset on API error → form frozen | ✅ Added finally block |
| 2 | {file} | No catch block → unhandled rejection → blank screen | ✅ Added try/catch + error state |
| 3 | {file} | router.push() without error handling → stuck on wrong page | ✅ Wrapped in try/catch |

> **For reviewers:** All fixes follow the project's error handling convention —
> `try/catch/finally` with `logger.warn` for logging and user-visible feedback via error refs.
> No behavioral changes — only error path hardening.
```
