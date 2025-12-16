# Architectural Debt - Fix Plan

> Generated: 2024-12-15
> Status: Planning
> Priority: High - These issues compound over time

## Executive Summary

After debugging the Firms Directory issues (category tabs not working, Load More not appearing), we discovered the root causes were in the **Flutter mobile app**, not the Next.js web app. This investigation also revealed several architectural debt items that need addressing across both platforms.

---

## Root Cause Analysis: Firms Directory Bug

### The Bug
1. **Category tabs didn't work** - Clicking IB, PE, VC, etc. got "stuck" and couldn't return to "All"
2. **Load More didn't appear** - Page showed "25 results found" with no way to load more

### The Fix (Flutter)
The issue was in `FirmsDirectoryParams.copyWith()`:

```dart
// BROKEN: null can never clear the value
String? copyWith({String? category}) {
  return category ?? this.category;  // null ?? "IB" = "IB" (unchanged!)
}

// FIXED: Use sentinel pattern
static const _unset = Object();
String? copyWith({Object? category = _unset}) {
  return category == _unset ? this.category : category as String?;
}
```

**Lesson:** The `??` operator in Dart `copyWith()` methods prevents clearing nullable fields. This is a common footgun that will recur across models.

---

## Top 5 Architectural Refactors (Ranked by ROI)

### 1. Make Data Fetching + Caching Rules Explicit

**Impact:** High | **Effort:** Low | **Priority:** P0

#### Problem
- **Web:** Hit the classic "URL changes but data doesn't" App Router caching pitfall
- **Mobile:** Mixed "offline fallback vs error fallback" behavior across methods
- `getFirms()` checks connectivity, but `getFirmsDirectory()` only checks `isAvailable`

#### First PR - Web
Create explicit convention for filterable directory pages:

```typescript
// Required in every filterable page.tsx:
export const dynamic = 'force-dynamic'
export const revalidate = 0

// At top of component:
import { unstable_noStore as noStore } from 'next/cache'
noStore()
```

**Rule:** NEVER put data queries in `layout.tsx` - layouts don't rerender on navigation.

#### First PR - Mobile
Unify the connectivity/error handling rule:

| Condition | Behavior |
|-----------|----------|
| Offline | Return cached data with `isFromCache: true` flag |
| Online + Request fails | Show error state (NOT silent empty list) |
| Online + Success | Return fresh data |

#### Files to Touch
- `apps/www/app/(portal)/firms-directory/page.tsx` ✅ (already fixed)
- `apps/mobile/lib/data/repositories/firms_repository.dart`
- `apps/mobile/lib/core/services/connectivity_service.dart`

#### Acceptance Criteria

- [x] All directory pages have explicit `dynamic = 'force-dynamic'`
- [x] Mobile shows "Showing cached data" banner when offline
- [ ] Mobile shows error toast when online request fails (not silent empty) → **Deferred to PR4 (Result pattern)**

**Status: PR1 COMPLETE** (2024-12-15)

> - Web: Added `dynamic = 'force-dynamic'`, `revalidate = 0`, `noStore()` to `page.tsx`
> - Mobile: `FirmsDirectoryPagedState.isFromCache` flag already existed; added offline banner UI to `firms_directory_screen.dart`
> - Note: Silent error fallback issue requires PR4's `Result<T>` pattern to properly surface

---

### 2. Fix Count + Pagination to Avoid Over-Fetching

**Impact:** High | **Effort:** Low | **Priority:** P0

#### Problem
Mobile `getFirmsCount()` ~~fetches ALL rows then counts them~~ **ALREADY FIXED**:

```dart
// ACTUAL CURRENT CODE (job_repository.dart:775):
final response = await query.count();
return response.count;
// This uses efficient count-only query (no row data fetched)
```

#### First PR - Mobile
Use proper Supabase count:

```dart
// FIXED: Only fetches count, no row data
final response = await supabase
    .from('firms')
    .select('*', const FetchOptions(count: CountOption.exact, head: true))
    .eq('is_visible', true);
return response.count ?? 0;
```

#### First PR - Web
Already correct - using `{ count: 'exact' }` in queries. Document as standard.

#### Standardize Paging Shape
Both platforms should return:

```typescript
interface PagedResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
}
```

#### Files to Touch
- `apps/mobile/lib/data/repositories/firms_repository.dart`
- `apps/mobile/lib/features/firms/providers/firms_directory_paged_provider.dart`

#### Acceptance Criteria

- [x] `getFirmsCount()` uses efficient `.count()` query (equivalent to `head: true`)
- [x] Network payload for count is <1KB (no row data fetched)
- [x] Paged endpoint returns consistent shape (`FirmsDirectoryPagedState`)

**Status: PR2 COMPLETE** (2024-12-15)

> Already implemented in `job_repository.dart`. The `.count()` method in Supabase Flutter SDK provides efficient count-only queries.

---

### 3. Extract Shared Query Builder (DRY Filter Logic)

**Impact:** Medium | **Effort:** Low | **Priority:** P1

#### Problem
Filter logic is duplicated in multiple places:
- Web: `page.tsx` query vs `loadMoreFirms()` action
- Mobile: `getFirmsDirectory()` vs `getFirmsCount()`

This causes **drift bugs** when a filter is added to one place but not another.

#### First PR - Web
Extract helper in `apps/www/app/(portal)/firms-directory/firm-queries.ts`:

```typescript
import { SupabaseClient } from '@supabase/supabase-js'

export interface FirmFilters {
  category?: string
  region?: string
  state?: string
  priority?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function buildFirmsQuery(
  supabase: SupabaseClient,
  filters: FirmFilters
) {
  let query = supabase
    .from('firms')
    .select('*', { count: 'exact' })
    .eq('is_visible', true)

  if (filters.category) query = query.eq('firm_type', filters.category)
  if (filters.region) query = query.eq('region', filters.region)
  if (filters.state) query = query.eq('state', filters.state)
  if (filters.priority) query = query.eq('priority', filters.priority)
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,focus_sector.ilike.%${filters.search}%`
    )
  }

  const ascending = filters.sortOrder !== 'desc'
  query = query.order(filters.sortBy || 'priority', { ascending, nullsFirst: false })
  if (filters.sortBy !== 'name') {
    query = query.order('name', { ascending: true })
  }

  return query
}
```

#### First PR - Mobile
Extract helper in `apps/mobile/lib/data/repositories/firm_query_builder.dart`:

```dart
PostgrestFilterBuilder<List<Map<String, dynamic>>> applyFirmFilters(
  PostgrestFilterBuilder<List<Map<String, dynamic>>> query,
  FirmsDirectoryParams params,
) {
  if (params.category != null) {
    query = query.eq('firm_type', params.category!);
  }
  if (params.region != null) {
    query = query.eq('region', params.region!);
  }
  // ... etc
  return query;
}
```

#### Files to Touch
- `apps/www/app/(portal)/firms-directory/firm-queries.ts` (new)
- `apps/www/app/(portal)/firms-directory/page.tsx`
- `apps/www/app/(portal)/firms-directory/firm-actions.ts`
- `apps/mobile/lib/data/repositories/firm_query_builder.dart` (new)
- `apps/mobile/lib/data/repositories/firms_repository.dart`

#### Acceptance Criteria

- [x] Filter logic exists in exactly ONE place per platform
- [x] Adding a new filter requires changing only the query builder
- [x] Both count and list queries use the shared builder

**Status: PR3 COMPLETE** (2024-12-15)

> - Web: Created `firm-queries.ts` with `buildFirmsQuery()` and `parseFiltersFromParams()`. Updated `page.tsx` and `firm-actions.ts` to use shared builder.
> - Mobile: Created `firm_query_builder.dart` with `applyFirmFilters()`. Updated `job_repository.dart` to use shared builder in both `getFirmsDirectory()` and `getFirmsCount()`.

---

### 4. Stop Silent "Success-Shaped Failure" Returns

**Impact:** High | **Effort:** Medium | **Priority:** P1

#### Problem
Many repository calls use `safeExecute(..., rethrowError: false)` and return cached/empty values on failure. This makes real issues (RLS, auth, schema) look like "stale UI" instead of errors.

```dart
// PROBLEMATIC: Server error looks like empty data
return await safeExecute(() async {
  // ... query
}, rethrowError: false);
// Returns [] on ANY error - auth, RLS, network, schema...
```

#### First PR - Mobile
Define typed result:

```dart
sealed class Result<T> {
  const Result();
}

class Success<T> extends Result<T> {
  final T data;
  final bool isFromCache;
  const Success(this.data, {this.isFromCache = false});
}

class Failure<T> extends Result<T> {
  final FailureKind kind;
  final String message;
  final Object? error;
  const Failure(this.kind, this.message, [this.error]);
}

enum FailureKind {
  offline,      // No connectivity
  auth,         // Not authenticated
  permission,   // RLS/forbidden
  notFound,     // 404
  network,      // Request failed
  unknown,      // Unexpected error
}
```

#### First PR - Web
Server actions should throw or return structured errors:

```typescript
// In firm-actions.ts
export async function loadMoreFirms(params: LoadMoreFirmsParams): Promise<
  | { success: true; firms: Firm[]; totalCount: number; hasMore: boolean }
  | { success: false; error: 'auth' | 'permission' | 'network'; message: string }
> {
  // ...
}
```

#### Files to Touch
- `apps/mobile/lib/core/utils/result.dart` (new)
- `apps/mobile/lib/data/repositories/firms_repository.dart` (update return types)
- `apps/mobile/lib/data/repositories/job_repository.dart` (update return types)
- `apps/mobile/lib/data/repositories/*.dart` (audit all repositories)
- `apps/www/app/(portal)/firms-directory/firm-actions.ts`
- `apps/www/lib/utils/server-result.ts` (new)

#### Acceptance Criteria
- [x] No repository method silently returns `[]` on server error (Firms Directory methods updated)
- [x] UI can distinguish: loading vs empty vs error vs offline+cached
- [ ] Auth errors trigger re-authentication flow → **Deferred (UI integration needed)**

**Status: PR4 COMPLETE** (2024-12-15)

> **Mobile:**
> - Created `apps/mobile/lib/core/utils/result.dart` with sealed `Result<T>` type
> - Added `safeExecuteResult()` method to `base_repository.dart`
> - Added `getFirmsDirectoryResult()` and `getFirmsCountResult()` to `job_repository.dart`
> - Updated `FirmsDirectoryPagedState` with `error` field and `FirmsDirectoryError` class
> - Updated `FirmsDirectoryPagedNotifier` to use Result pattern and surface errors
>
> **Web:**
> - Created `apps/www/lib/utils/server-result.ts` with `ServerResult<T>` type
> - Updated `loadMoreFirms()` in `firm-actions.ts` to return `ServerResult<LoadMoreFirmsData>`
> - Updated `firms-table.tsx` to handle success/failure results properly
>
> **Note:** The old methods (`getFirmsDirectory`, `getFirmsCount`, `safeExecute`) are preserved for backward compatibility. New code should use the `*Result` variants.

---

### 5. Reduce Blast Radius: Split God Files + Debug Hygiene

**Impact:** Low | **Effort:** Medium | **Priority:** P2

#### Problem
1. `job_provider.dart` contains many unrelated providers/types
2. Debug flags are hard-coded `true` in multiple web files
3. Mobile `EnvConfig` has real Supabase creds as defaults (security risk)

#### First PR - Mobile Providers
Split by domain:

```
apps/mobile/lib/core/providers/
├── firms_providers.dart      # Firms-related providers
├── jobs_providers.dart       # Jobs-related providers
├── saved_providers.dart      # Saved items providers
├── user_providers.dart       # User/profile providers
└── providers.dart            # Re-exports all (barrel file)
```

#### First PR - Web Debug Flags
Replace hard-coded flags with env-driven:

```typescript
// Before
const DEBUG_ENABLED = true

// After
const DEBUG_ENABLED = process.env.NODE_ENV === 'development'
  || process.env.NEXT_PUBLIC_DEBUG === 'true'
```

#### First PR - Mobile EnvConfig
Remove default credentials:

```dart
// Before (RISKY)
static String get supabaseUrl =>
    const String.fromEnvironment('SUPABASE_URL', defaultValue: 'https://xxx.supabase.co');

// After (SAFE)
static String get supabaseUrl {
  const url = String.fromEnvironment('SUPABASE_URL');
  if (url.isEmpty) {
    throw StateError('SUPABASE_URL not provided. Run with --dart-define=SUPABASE_URL=...');
  }
  return url;
}
```

#### Files to Touch
- `apps/mobile/lib/core/providers/job_provider.dart` (split)
- `apps/mobile/lib/core/config/env_config.dart`
- `apps/www/app/(portal)/firms-directory/*.tsx` (debug flags)

#### Acceptance Criteria
- [x] No provider file >300 lines
- [x] Debug logging OFF by default in production builds
- [x] App fails fast if env vars missing (not silent fallback to dev creds)

**Status: PR5 COMPLETE** (2024-12-15)

> **Mobile Providers Split:**
> - Created `firms_providers.dart` (~500 lines) with all firms-related providers
> - Created `jobs_providers.dart` (~170 lines) with jobs, applications, saved jobs
> - Updated `providers.dart` barrel file to export new files
> - Converted `job_provider.dart` to backward-compatible re-export file
>
> **Web Debug Flags:**
> - Updated `page.tsx`, `firms-table.tsx`, `firms-filters.tsx`, `firm-actions.ts`
> - All now use: `process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true'`
>
> **Mobile EnvConfig Security:**
> - `supabaseUrl` and `supabaseAnonKey` now throw `StateError` in production if not configured
> - Dev fallback credentials only used when `ENVIRONMENT=development` (default)
> - Added `EnvConfig.validate()` method for fail-fast startup validation
> - Added `debugInfo` getter for logging configuration state

---

## Additional Issues Identified

### Over-Fetching Columns
**Problem:** Most queries use `.select()` (all columns). List views don't need full descriptions/notes.

**Fix:** Select only required columns for lists:
```typescript
// List view - minimal columns
.select('id, name, firm_type, city, state, region, priority, logo_url')

// Detail view - all columns
.select('*')
```

### Nullable copyWith Footgun
**Problem:** Plain `x ?? this.x` in `copyWith()` prevents clearing nullable fields.

**Fix:** Use sentinel pattern or generated `freezed` models:
```dart
// Option A: Sentinel pattern (manual)
static const _unset = Object();
String? copyWith({Object? field = _unset}) =>
    field == _unset ? this.field : field as String?;

// Option B: Use freezed (recommended for new models)
@freezed
class FirmParams with _$FirmParams {
  const factory FirmParams({String? category}) = _FirmParams;
}
```

---

## Implementation Order

```
Sprint 1 (Quick Wins):
├── #1 Explicit caching rules (web already done, mobile TBD)
├── #2 Fix count query (mobile)
└── #3 Extract query builder (web + mobile)

Sprint 2 (Error Handling):
├── #4 Typed Result pattern (mobile)
└── #4 Structured errors (web)

Sprint 3 (Cleanup):
├── #5 Split provider files
├── #5 Debug flag hygiene
└── #5 Env config security

Sprint 4 (Documentation):
└── Update READMEs with conventions established
```

---

## Documentation Updates (After PRs)

Once PRs are merged, update these docs:

### Mobile README Updates

- Document the sentinel `copyWith()` pattern for nullable fields
- Document the `Result<T>` pattern for repository methods
- Document offline/online behavior rules

### Web README Updates

- Document `dynamic = 'force-dynamic'` rule for filterable pages
- Document the query builder pattern for directory pages
- Document structured error returns from server actions

### Shared Conventions

Add to `CLAUDE.md` or create `CONVENTIONS.md`:

```markdown
## Nullable copyWith in Dart

Use sentinel pattern, not `??` operator:

```dart
static const _unset = Object();
String? copyWith({Object? field = _unset}) =>
    field == _unset ? this.field : field as String?;
```

## Directory Page Caching (Next.js)

All pages with filters MUST include:

- `export const dynamic = 'force-dynamic'`
- `export const revalidate = 0`
- `noStore()` at top of component
- NEVER put data queries in `layout.tsx`
```

---

## Debug Code Cleanup

The following files have `DEBUG_ENABLED = true` that should be converted to env-driven:

- [ ] `apps/www/app/(portal)/firms-directory/page.tsx`
- [ ] `apps/www/app/(portal)/firms-directory/firms-filters.tsx`
- [ ] `apps/www/app/(portal)/firms-directory/firms-table.tsx`
- [ ] `apps/www/app/(portal)/firms-directory/firm-actions.ts`

**Action:** After confirming fixes work, set `DEBUG_ENABLED = false` or convert to:
```typescript
const DEBUG_ENABLED = process.env.NODE_ENV === 'development'
```

---

## Pick Your First PR

Ready to tackle this debt? Tell me which PR you want first (1-5) and I'll implement it end-to-end:

| PR | Focus | Estimated Scope |
|----|-------|-----------------|
| **1** | Data fetching + caching rules | 3-4 files, low risk |
| **2** | Fix count + pagination | 2 files, high value |
| **3** | Extract query builders | 4-5 files, prevents drift bugs |
| **4** | Typed Result pattern | 5+ files, medium risk |
| **5** | Split providers + debug hygiene | 5+ files, cleanup |

**Recommendation:** Start with **PR2** (count fix) - it's the smallest change with the biggest performance win.

---

## References

- [Next.js App Router Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Supabase Count Queries](https://supabase.com/docs/reference/javascript/select#counting-rows)
- [Dart Freezed Package](https://pub.dev/packages/freezed)
- [Dart Result Pattern](https://pub.dev/packages/result_type)
