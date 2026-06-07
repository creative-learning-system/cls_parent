# Parent Dashboard — Backend Handoff & Integration Status

**Platform:** Next.js 15 (App Router) · TypeScript · Tailwind CSS  
**API Base URL:** `NEXT_PUBLIC_API_URL` env var (fallback: `https://api.creativelearningsystem.com`)  
**Auth:** Bearer token in `Authorization` header. Token stored in `localStorage` as `access_token`.

---

## 1. Endpoint Implementation Status

### ✅ Fully Implemented (UI + API wired)

| # | Method | Endpoint | Component |
|---|--------|----------|-----------|
| 1 | GET | `/api/parent/dashboard` | Dashboard overview page |
| 2 | GET | `/api/parent/child/{id}/reasoning-subsections` | Home → Drill categories |
| 3 | GET | `/api/parent/child/{id}/reading-reflections` | Home → Reading activity, Reading tab |
| 4 | GET | `/api/parent/child/{id}/suspension-status` | Home → Profile card badge |
| 5 | POST | `/api/parent/child/{id}/suspend` | Home → Suspend modal |
| 6 | POST | `/api/parent/child/{id}/unsuspend` | Home → Suspend modal |
| 7 | POST | `/api/parent/child/{id}/resend-onboarding` | Home → Resend button |
| 8 | GET | `/api/parent/child/{id}/mental-drills?timeframe=...` | Mental Drill tab |
| 9 | GET | `/api/parent/child/{id}/weekly-compliance` | Progress → Weekly tab |
| 10 | GET | `/api/parent/child/{id}/academic-profile` | Progress → Academic tab |
| 11 | GET | `/api/parent/child/{id}/curriculum-checklist` | Progress → Curriculum tab |
| 12 | GET | `/api/parent/child/{id}/reasoning-analytics` | Progress → Analytics tab |
| 13 | GET | `/api/parent/child/{id}/compliance-history` | Progress → History tab |
| 14 | GET | `/api/parent/child/{id}/pretests` | Progress → Pretests tab |
| 15 | GET | `/api/parent/child/{id}/activity-log` | Home → Activity Log card |
| 16 | GET | `/api/parent/child/{id}/reading-interests` | Reading → Career Paths tab |
| 17 | GET | `/api/parent/notifications` | Navbar bell |
| 18 | GET | `/api/parent/profile` | Profile page |
| 19 | PUT | `/api/parent/profile` | Profile page → Edit fields |
| 20 | POST | `/api/auth/login` | Login page |
| 21 | POST | `/api/auth/change-password` | Change Password page |

---

### ⚠️ Defined in Frontend but NOT Used in Any UI

These API functions are wired in `lib/api.ts` but no component calls them yet.

| Method | Endpoint | Frontend Function | Reason Not Used |
|--------|----------|-------------------|-----------------|
| GET | `/api/parent/children` | `getChildren()` | `getDashboard()` already returns children list — not needed separately |
| GET | `/api/parent/child/{id}/overview` | `getChildOverview()` | No dedicated overview UI built; dashboard + section tabs cover this |

> **Note for backend:** These endpoints can still be tested independently. `getChildOverview` also has an **untyped response** on the frontend (`Record<string, unknown>`) — we need the actual response schema before building a UI for it.

---

### ❌ Not Implemented — No Frontend UI Exists

| Feature | What's Missing | Notes |
|---------|---------------|-------|
| **Messaging** | Full teacher–parent chat feature has zero API integration | See Section 4 for details |
| **Token Refresh** | Refresh token is stored but the refresh endpoint is never called | See Section 6 |

---

## 2. Response Shape Issues / Type Mismatches

The following endpoints caused **runtime crashes in production** because the API returned `null` or omitted fields instead of empty arrays. These have been patched on the frontend with `?? []` guards, but the backend should return consistent shapes.

| Endpoint | Field | Expected | Actual (caused crash) |
|----------|-------|----------|-----------------------|
| `/api/parent/child/{id}/reading-interests` | `career_paths` | `CareerPath[]` | `undefined` / `null` |
| `/api/parent/child/{id}/reading-interests` | `reflections` | `StoryReflection[]` | `undefined` / `null` |
| `/api/parent/child/{id}/reasoning-analytics` | `accuracy_trends` | `AccuracyDataPoint[]` | `undefined` / `null` |
| `/api/parent/child/{id}/reasoning-analytics` | `level_history` | `LevelHistoryEntry[]` | `undefined` / `null` |

**Rule of thumb:** All array fields in any response should return `[]` (empty array), not `null` or a missing key. The frontend is now guarded, but it's better practice to standardise this at the API level.

---

## 3. Expected API Response Shapes (Frontend TypeScript Contracts)

These are the exact interfaces the frontend is typed against. Deviations from these shapes will cause UI breakage.

### `GET /api/parent/dashboard`
```json
{
  "status": "success",
  "data": {
    "total_children": 1,
    "children": [
      {
        "student_id": 12,
        "full_name": "John Doe",
        "class_info": "JSS 2B",
        "reasoning_levels": [
          { "TypeName": "Logical", "CurrentLevel": 3, "LevelName": "Bronze" }
        ],
        "today_compliance": {
          "LogicalTargetMet": true,
          "LinguisticTargetMet": false,
          "ReadingReflectionCompleted": false
        },
        "recent_achievements": [
          { "ChangeType": "Promotion", "DrillTypeID": 1, "NewLevel": 4, "ChangedAt": "2026-06-05T10:00:00Z" }
        ]
      }
    ]
  }
}
```

### `GET /api/parent/child/{id}/activity-log`
The frontend has a **best-guess type** for this endpoint since no schema was provided. The current assumed shape is:
```json
{
  "status": "success",
  "data": {
    "student_id": 12,
    "activities": [
      {
        "id": 1,
        "type": "drill",
        "title": "Order of Operations",
        "description": "Logical Reasoning",
        "timestamp": "2026-06-05T10:30:00Z",
        "score": "8/10",
        "accuracy": 80
      }
    ]
  }
}
```
`type` values recognised: `"drill"` | `"reflection"` | `"pretest"`. Any other string will render with a generic icon.

> **Action needed:** Confirm or correct this shape. If different, we need to update the `ActivityEntry` interface in `lib/api.ts`.

### `GET /api/parent/child/{id}/overview`
This endpoint's response shape is **completely unknown** on the frontend (`Record<string, unknown>`). No UI has been built for it yet. Please provide the response schema so we can add a proper typed interface and UI.

### `GET /api/parent/child/{id}/reasoning-analytics`
```json
{
  "data": {
    "student_id": 12,
    "accuracy_trends": [
      { "date": "2026-06-01", "logical_accuracy": 75, "linguistic_accuracy": 60 }
    ],
    "level_history": [
      { "DrillTypeID": 1, "ChangeType": "Promotion", "OldLevel": 2, "NewLevel": 3, "ChangedAt": "2026-06-03T09:00:00Z" }
    ]
  }
}
```
`logical_accuracy` and `linguistic_accuracy` can be `null` for days with no activity.

### `GET /api/parent/child/{id}/compliance-history`
```json
{
  "data": {
    "compliance": [
      {
        "date": "2026-05-07",
        "LogicalTargetMet": true,
        "LinguisticTargetMet": true,
        "ReadingReflectionCompleted": false
      }
    ]
  }
}
```
Returns last 30 days. The frontend calendar renders them in the array order — please return oldest first.

### `GET /api/parent/child/{id}/mental-drills`
Query param: `timeframe` = `today` | `this_week` | `this_month` | `all_time`
```json
{
  "data": {
    "student_id": 12,
    "timeframe": "this_week",
    "alerts": [
      {
        "change_type": "Promotion",
        "category": "Logical Reasoning",
        "subsection_name": "Order of Operations",
        "subsection_code": "OO",
        "previous_level": 2,
        "new_level": 3,
        "timestamp": "2026-06-04T14:00:00Z",
        "message": "Promoted to Level 3",
        "subtext": "Keep up the great work!",
        "status": "success"
      }
    ],
    "today_activity": {
      "logical_drills": [ { "attempt_id": 1, "subsection_name": "...", "subsection_code": "OO", "score": "8/10", "accuracy": 80, "completed_at": "2026-06-05T09:00:00Z" } ],
      "linguistic_reasoning": []
    },
    "past_activity": [
      {
        "date": "2026-06-04",
        "display_date": "4 June 2026",
        "day_label": "Wednesday",
        "logical_drills": [],
        "linguistic_reasoning": []
      }
    ]
  }
}
```

### `GET /api/parent/profile` + `PUT /api/parent/profile`
```json
{
  "data": {
    "full_name": "Samuel Okafor",
    "email": "samuel@example.com",
    "phone_number": "+2348012345678"
  }
}
```
PUT body: `{ "full_name": "...", "phone_number": "..." }`. Email is display-only on the frontend.

---

## 4. Messages Feature — Fully Missing

**Current state:** The Messages tab has a complete UI (teacher list + chat panel) but **zero backend integration**. In the live app, all users see an empty teacher list because `child.teachers` is always `[]`.

**What needs to be built:**

### Required Endpoints

```
GET  /api/parent/child/{student_id}/teachers
GET  /api/parent/child/{student_id}/messages/{teacher_id}
POST /api/parent/child/{student_id}/messages/{teacher_id}
```

### Expected Response Shapes

#### `GET /api/parent/child/{id}/teachers`
```json
{
  "data": {
    "teachers": [
      {
        "id": "t1",
        "full_name": "Mrs. Adebayo",
        "initials": "AA",
        "role": "Class Teacher",
        "subject": "Mathematics",
        "unread_count": 2,
        "last_message": "John did well in today's quiz!",
        "last_message_time": "2026-06-05T10:30:00Z"
      }
    ]
  }
}
```

#### `GET /api/parent/child/{id}/messages/{teacher_id}`
```json
{
  "data": {
    "messages": [
      {
        "id": "m1",
        "from": "teacher",
        "sender_name": "Mrs. Adebayo",
        "sender_initials": "AA",
        "text": "John did well today.",
        "timestamp": "2026-06-05T10:30:00Z"
      }
    ]
  }
}
```
`from` values: `"teacher"` or `"parent"`.

#### `POST /api/parent/child/{id}/messages/{teacher_id}`
Request body:
```json
{ "text": "Thank you for letting me know." }
```
Response: the created message object (same shape as above).

> **Frontend note:** Once these endpoints exist, `MessagesSection` needs to be updated to call them and wire the send button. Currently the send button clears the input but does nothing else.

---

## 5. Mock / Placeholder Data Still in Codebase

### `lib/dashboard-data.ts` — Mock Child objects

This file contains two fully detailed mock children ("Chidera Okafor" and "Victor Okafor") used during development. They are **not shown to real users** because the app now calls `getDashboard()` and maps real API data.

However, these fields are set to **empty in `mapApiChild()`** (in `app/(dashboard)/page.tsx`) because no API provides them yet:

| Field on `Child` object | Set to | Should come from |
|-------------------------|--------|-----------------|
| `subjects` | `[]` | Not available in any current API response |
| `progress.summary` | `""` | Not available; could come from `/overview` endpoint |
| `progress.metrics` | `[]` | Not available |
| `drillCategories` | `[]` | Filled by `getReasoningSubsections()` via `HomeSection` |
| `drillActivity` | `[]` | Filled by `getMentalDrills()` via `MentalDrillSection` |
| `reading` | `[]` | Filled by `getReadingReflections()` via sections |
| `teachers` | `[]` | No endpoint yet — needed for Messages |
| `messages` | `{}` | No endpoint yet — needed for Messages |
| `tagColor` | `"brand"` (hardcoded) | Could be driven by student type/level |

> `drillCategories`, `drillActivity`, and `reading` being empty in the `Child` object is **fine** — they are populated independently by each section component via their own API calls. Only `subjects`, `teachers`, `messages`, and `progress.metrics` are genuinely missing data.

### `lib/dashboard-data.ts` — Can be deleted?

The mock data file is only imported for its **TypeScript types** (`Child`, `Drill`, `ReadingEntry`, etc.) — not for the mock data arrays themselves. The types are still in use. The mock `children` export at the bottom is not used anywhere in the app.

---

## 6. Auth & Token Refresh Gap

**Critical issue:** The refresh token is stored in `localStorage` as `refresh_token` but is never used.

When an access token expires, `apiFetch()` (in `lib/api.ts`) detects the 401 and immediately:
1. Calls `clearSession()` — wipes all tokens
2. Redirects to `/login`

The user is logged out with no attempt to refresh.

### What's needed from the backend

Confirm if a refresh token endpoint exists:
```
POST /api/auth/refresh
Body: { "refresh_token": "..." }
Response: { "data": { "access_token": "...", "refresh_token": "..." } }
```

### What needs to be added on the frontend (once endpoint confirmed)

In `lib/api.ts`, the 401 handler should attempt a refresh before logging out:
```typescript
if (res.status === 401) {
  const refreshed = await tryRefreshToken();  // new function needed
  if (refreshed) {
    return apiFetch<T>(path, options);  // retry original request
  }
  clearSession();
  window.location.href = "/login";
}
```

---

## 7. Cache Strategy Notes

The frontend uses a simple in-memory Map cache (`lib/cache.ts`) with **no TTL (time-to-live)**.

- Cache is keyed as `c{studentId}:{endpoint}` e.g. `c12:reasoning-subsections`
- Cache is invalidated correctly after suspend/unsuspend actions
- Cache **never expires automatically** — data stays until page refresh or navigation
- Notification data in the navbar is **not cached** (re-fetched on each mount) — this is intentional

**Implication:** If backend data changes mid-session (e.g. a teacher updates a grade), the parent won't see it until they refresh the page. This is acceptable for now but worth discussing if real-time updates become a requirement.

---

## 8. Error Handling — Current State

Most section components swallow errors silently (`.catch(() => {})`). The following components need improved error handling:

| Component | Current Behaviour on API Failure |
|-----------|----------------------------------|
| `HomeSection` — drills | Loading spinner stays or disappears, no error message |
| `HomeSection` — reading | Same |
| `MentalDrillSection` | Falls back to dashboard-level notifications; no error shown |
| `ProgressSection` — weekly | Shows "Could not load" empty state ✓ |
| `AcademicProfileCard` | Shows "Could not load" + retry button ✓ |
| `CurriculumChecklistCard` | Shows "Could not load" + retry button ✓ |
| `ReasoningAnalyticsCard` | Shows "Could not load" + retry button ✓ |
| `ComplianceHistoryCard` | Shows "Could not load" + retry button ✓ |
| `PretestsCard` | Shows "Could not load" + retry button ✓ |
| `ActivityLogCard` | Shows "Could not load" + retry button ✓ |

The newer components all handle errors well. The older ones (Home, Reading, Mental Drill) need updating.

---

## 9. Outstanding Questions for Backend

1. **`/api/parent/child/{id}/activity-log`** — Please confirm the exact response shape. The frontend has a best-guess interface. Specifically: what values can `type` be? What fields are always present?

2. **`/api/parent/child/{id}/overview`** — What does this endpoint actually return? It's the only endpoint with no typed interface on the frontend and no UI built for it.

3. **Subjects field** — Is there any endpoint that returns a student's subject list? The profile card has a `subjects` display area that currently shows nothing.

4. **Messages** — Does a messaging API exist or need to be built? See Section 4 for the full spec the frontend expects.

5. **Token refresh** — Does `/api/auth/refresh` exist? If so, please share the request/response shape.

6. **`today_activity` in mental-drills** — When `timeframe=this_week`, does the response still include `today_activity`? Or only when `timeframe=today`?

7. **Compliance history order** — Are days returned oldest-first or newest-first? The frontend renders them in array order into a calendar grid.

8. **Reading reflections `parts`** — Are `parts` always present on every reflection? Some reflections might have 0 parts (e.g. older submissions). The frontend handles an empty `parts` array fine.

9. **Pagination** — No endpoint currently supports pagination on the frontend. If any endpoint (notifications, activity log, reflections) returns large datasets, please let us know and we'll add pagination support.

---

## 10. Admin Endpoints (Frontend-Defined, No Admin UI)

The following admin endpoints are defined in `lib/api.ts` but have **no frontend UI**. They were likely added for future use:

| Function | Method | Endpoint |
|----------|--------|----------|
| `adminSuspendStudent()` | POST | `/api/users/students/{id}/suspend` |
| `adminUnsuspendStudent()` | POST | `/api/users/students/{id}/unsuspend` |
| `adminGetStudentSuspensionStatus()` | GET | `/api/users/students/{id}/suspension-status` |
| `adminResendParentCredentials()` | POST | `/api/users/parents/{id}/resend-onboarding` |
| `adminResendStudentOnboarding()` | POST | `/api/users/students/{id}/resend-onboarding` |

These are separate from the parent-facing endpoints. If an admin dashboard is being built in a different app, these can be removed from this codebase.

---

## Summary

| Area | Status |
|------|--------|
| Core dashboard (children, compliance, drills) | ✅ Complete |
| Reasoning analytics, compliance history, pretests | ✅ Complete |
| Reading reflections + career paths | ✅ Complete |
| Academic profile + curriculum checklist | ✅ Complete |
| Suspension / unsuspend / resend onboarding | ✅ Complete |
| Notifications | ✅ Complete |
| Parent profile (view + edit) | ✅ Complete |
| Auth (login, change password, forgot/reset) | ✅ Complete |
| Messages / teacher chat | ❌ No backend endpoints — UI exists but non-functional |
| Token refresh on 401 | ❌ Not implemented — immediate logout on token expiry |
| `getChildOverview` UI | ⚠️ No UI (endpoint exists, shape unknown) |
| Array fields returning null instead of `[]` | ⚠️ Patched on frontend — please fix at API level |
| Subjects data for student profile | ⚠️ No API source — displays blank |
