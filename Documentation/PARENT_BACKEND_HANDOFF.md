# Parent App — Backend Handoff Document

> Generated: 2026-06-05
> Audience: Backend developer
> Scope: All API endpoints consumed by the cls_parent Next.js frontend

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Endpoint Inventory](#2-endpoint-inventory)
3. [Response Shape Contracts](#3-response-shape-contracts)
4. [What We Need From Backend](#4-what-we-need-from-backend)
5. [Dummy / Mock Data Still In Frontend](#5-dummy--mock-data-still-in-frontend)
6. [Error Handling Contract](#6-error-handling-contract)

---

## 1. Authentication

All requests (except `/api/auth/login`) must include:

```
Authorization: Bearer <access_token>
```

Token is stored client-side in `localStorage` as `access_token`.
Refresh token is stored as `refresh_token`.

On any **401** response the frontend clears the session and redirects to `/login`.

**Current gap:** There is no refresh flow implemented. If the access token expires the user is simply logged out. See [Section 4](#4-what-we-need-from-backend).

---

## 2. Endpoint Inventory

### Auth

| Method | Path | Used In | Status |
|--------|------|---------|--------|
| POST | `/api/auth/login` | Login page | ✅ Implemented |
| POST | `/api/auth/refresh` | (not yet) | ❌ Missing — see §4 |

### Parent / Children

| Method | Path | Used In | Status |
|--------|------|---------|--------|
| GET | `/api/parent/children` | Dashboard page | ✅ Implemented |

### Child Dashboard

| Method | Path | Used In | Status |
|--------|------|---------|--------|
| GET | `/api/parent/child/{id}/dashboard` | Home section | ✅ Implemented |
| GET | `/api/parent/child/{id}/overview` | Home section | ✅ Implemented |
| GET | `/api/parent/child/{id}/mental-drills?timeframe=` | Mental Drill section | ✅ Implemented |
| GET | `/api/parent/child/{id}/reading` | Reading section | ✅ Implemented |
| GET | `/api/parent/child/{id}/reading-interests` | Reading → Career Paths tab | ✅ Implemented |
| GET | `/api/parent/child/{id}/schedule` | Progress → Schedule tab | ✅ Implemented |
| GET | `/api/parent/child/{id}/performance` | Progress → Performance tab | ✅ Implemented |
| GET | `/api/parent/child/{id}/reasoning-analytics` | Progress → Analytics tab | ✅ Implemented |
| GET | `/api/parent/child/{id}/compliance-history` | Progress → History tab | ✅ Implemented |
| GET | `/api/parent/child/{id}/pretests` | Progress → Pretests tab | ✅ Implemented |
| GET | `/api/parent/child/{id}/activity-log` | Home section (bottom) | ✅ Implemented |
| GET | `/api/parent/child/{id}/notifications` | (notifications page) | ✅ Implemented |

### Messages (not yet available)

| Method | Path | Used In | Status |
|--------|------|---------|--------|
| GET | `/api/parent/child/{id}/teachers` | Messages section | ❌ Missing — see §4 |
| GET | `/api/messages/{teacher_id}` | Messages section | ❌ Missing — see §4 |
| POST | `/api/messages/{teacher_id}` | Messages section | ❌ Missing — see §4 |

### Profile

| Method | Path | Used In | Status |
|--------|------|---------|--------|
| GET | `/api/parent/profile` | Profile page | ✅ Implemented |
| PUT | `/api/parent/profile` | Profile page | ✅ Implemented |

---

## 3. Response Shape Contracts

### `GET /api/parent/children`

```json
[
  {
    "id": 1,
    "name": "Chidera Okafor",
    "grade": "Grade 5",
    "school": "Greenfield Academy",
    "avatar_url": "https://..."
  }
]
```

### `GET /api/parent/child/{id}/dashboard`

```json
{
  "summary": {
    "drills_completed_today": 3,
    "reading_streak": 5,
    "pending_tasks": 2
  },
  "recent_activity": [
    {
      "type": "drill",
      "title": "Logical Reasoning — Set A",
      "time": "10:30 AM",
      "score": "85%"
    }
  ]
}
```

### `GET /api/parent/child/{id}/overview`

```json
{
  "attendance": "92%",
  "overall_score": "78%",
  "rank": 4,
  "subjects": [
    { "name": "Mathematics", "score": 82, "trend": "up" }
  ],
  "tags": [
    { "label": "Consistent", "color": "brand" }
  ]
}
```

**Note:** `tags[].color` must be one of: `brand | success | warning | info`. Currently the frontend defaults all tags to `"brand"` because the API field is unspecified.

### `GET /api/parent/child/{id}/mental-drills?timeframe=today|this_week|this_month|all_time`

```json
{
  "alerts": [
    {
      "subsection_name": "Number Patterns",
      "change_type": "Promotion",
      "message": "Promoted to Level 3",
      "subtext": "Scored above 85% three times in a row"
    }
  ],
  "today_activity": {
    "logical_drills": [
      {
        "attempt_id": "a1",
        "subsection_name": "Number Patterns",
        "score": "9/10",
        "accuracy": 90,
        "completed_at": "9:15 AM",
        "time_label": "9:15 AM"
      }
    ],
    "linguistic_reasoning": []
  },
  "past_activity": [
    {
      "date": "2026-06-04",
      "display_date": "June 4, 2026",
      "day_label": "Yesterday",
      "logical_drills": [],
      "linguistic_reasoning": []
    }
  ]
}
```

**Important:** `alerts`, `today_activity.logical_drills`, `today_activity.linguistic_reasoning`, and `past_activity` must all be **arrays** (never `null`). Frontend guards with `?? []` but an explicit empty array is preferred.

### `GET /api/parent/child/{id}/reading`

```json
{
  "reflections": [
    {
      "id": "r1",
      "title": "The Magic School Bus",
      "date": "June 3, 2026",
      "summary": "...",
      "score": 88,
      "tags": ["Science", "Adventure"]
    }
  ],
  "career_paths": []
}
```

**Important:** Both `reflections` and `career_paths` must be **arrays** (never `null`).

### `GET /api/parent/child/{id}/reading-interests`

```json
{
  "career_paths": [
    {
      "id": "cp1",
      "title": "Marine Biologist",
      "interest_score": 92,
      "related_books": ["Ocean Life", "Blue Planet"]
    }
  ]
}
```

### `GET /api/parent/child/{id}/schedule`

```json
{
  "days": [
    {
      "day": "Monday",
      "sessions": [
        {
          "time": "9:00 AM",
          "subject": "Mathematics",
          "type": "drill",
          "duration_minutes": 30
        }
      ]
    }
  ]
}
```

### `GET /api/parent/child/{id}/performance`

```json
{
  "subjects": [
    {
      "name": "Mathematics",
      "score": 82,
      "max_score": 100,
      "trend": "up",
      "last_updated": "2026-06-04"
    }
  ],
  "overall": {
    "score": 78,
    "rank": 4,
    "percentile": 72
  }
}
```

### `GET /api/parent/child/{id}/reasoning-analytics`

```json
{
  "accuracy_trends": [
    {
      "subsection": "Number Patterns",
      "week": "Week 1",
      "accuracy": 72
    }
  ],
  "level_history": [
    {
      "subsection": "Analogies",
      "from_level": 2,
      "to_level": 3,
      "change_type": "Promotion",
      "date": "2026-05-28"
    }
  ]
}
```

**Important:** Both arrays must never be `null`.

### `GET /api/parent/child/{id}/compliance-history`

```json
{
  "days": [
    {
      "date": "2026-06-01",
      "status": "full",
      "drills_completed": 3,
      "drills_assigned": 3
    }
  ]
}
```

`status` must be one of: `"full" | "partial" | "none"`

### `GET /api/parent/child/{id}/pretests`

```json
{
  "subjects": [
    {
      "name": "Mathematics",
      "score": 74,
      "max_score": 100,
      "date_taken": "2026-05-15",
      "topics": [
        { "name": "Fractions", "score": 60, "max_score": 20 }
      ]
    }
  ]
}
```

### `GET /api/parent/child/{id}/activity-log`

```json
{
  "entries": [
    {
      "id": "e1",
      "type": "drill",
      "title": "Logical Reasoning — Set B",
      "description": "Completed 10 questions",
      "score": "8/10",
      "timestamp": "2026-06-05T09:15:00Z"
    }
  ]
}
```

`type` must be one of: `"drill" | "reflection" | "pretest"` — see §4 for confirmation request.

### `GET /api/parent/child/{id}/notifications`

```json
{
  "notifications": [
    {
      "id": "n1",
      "title": "Drill Completed",
      "body": "Chidera completed Number Patterns",
      "timestamp": "2026-06-05T09:20:00Z",
      "read": false
    }
  ]
}
```

### `GET /api/parent/profile`

```json
{
  "full_name": "Jane Okafor",
  "email": "jane@example.com",
  "phone_number": "+2348012345678"
}
```

### `PUT /api/parent/profile`

Request body:
```json
{
  "full_name": "Jane Okafor",
  "phone_number": "+2348012345678"
}
```

Response: same shape as GET, or `{ "success": true }`.

---

## 4. What We Need From Backend

### 4.1 — Token Refresh Endpoint

**What:** `POST /api/auth/refresh`

**Why:** The frontend currently has no token refresh logic. When `access_token` expires, users get logged out silently (401 → clearSession → /login). This is bad UX.

**Request body:**
```json
{ "refresh_token": "<token>" }
```

**Response:**
```json
{
  "access_token": "<new_token>",
  "refresh_token": "<new_token>"
}
```

Once this endpoint exists, the frontend will intercept 401s, attempt a silent refresh, and retry the original request before logging the user out.

---

### 4.2 — Messages / Teacher Communication Endpoints

**What:** 3 endpoints needed to power the Messages section (currently shows "Coming Soon")

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/parent/child/{id}/teachers` | List teachers for this child |
| GET | `/api/messages/{teacher_id}?child_id={id}` | Get message thread |
| POST | `/api/messages/{teacher_id}` | Send a message |

**Teacher list response shape:**
```json
[
  {
    "id": 12,
    "name": "Mrs. Adeyemi",
    "subject": "Mathematics",
    "avatar_url": "https://..."
  }
]
```

**Message thread response shape:**
```json
{
  "messages": [
    {
      "id": "m1",
      "sender": "teacher",
      "body": "Chidera did well today.",
      "timestamp": "2026-06-05T14:00:00Z"
    }
  ]
}
```

**Send message request body:**
```json
{
  "child_id": 1,
  "body": "Thank you for the update!"
}
```

---

### 4.3 — Student Subjects List

**What:** The overview/dashboard response should include a `subjects` array so the frontend can display the child's enrolled subjects.

**Where it's needed:** The child overview card on the dashboard home section and profile.

**Proposed addition to** `GET /api/parent/child/{id}/overview`:
```json
{
  "subjects": ["Mathematics", "English", "Basic Science", "Social Studies"]
}
```

Alternatively, a dedicated endpoint:
```
GET /api/parent/child/{id}/subjects
→ { "subjects": ["Mathematics", "English", ...] }
```

---

### 4.4 — Activity Log Shape Confirmation

**What:** Please confirm the exact shape of entries returned by `GET /api/parent/child/{id}/activity-log`.

**Frontend currently expects:**
```json
{
  "entries": [
    {
      "id": "string",
      "type": "drill | reflection | pretest",
      "title": "string",
      "description": "string",
      "score": "string (e.g. '8/10' or '85%')",
      "timestamp": "ISO 8601 string"
    }
  ]
}
```

If `score` is absent for some types (e.g. reflections with no score), please send `null` rather than omitting the field, so the frontend can render a consistent empty state.

---

## 5. Dummy / Mock Data Still In Frontend

The following mock data still exists in the frontend and should be removed once real API data is confirmed working:

| File | Mock Data | Notes |
|------|-----------|-------|
| `lib/dashboard-data.ts` | `children` array with 2 hardcoded children (Chidera & Victor Okafor) | Used as fallback if `/api/parent/children` is unavailable. Safe to remove once API is stable. |
| `app/(dashboard)/page.tsx` | `tagColor` always defaults to `"brand"` | Waiting for `tags[].color` field from overview endpoint (§3 above). |

---

## 6. Error Handling Contract

The frontend expects standard HTTP error codes:

| Code | Meaning | Frontend Behaviour |
|------|---------|-------------------|
| 200 | OK | Render data |
| 400 | Bad request | Show error message |
| 401 | Unauthorized | Clear session → redirect to /login |
| 403 | Forbidden | Show "You don't have access" message |
| 404 | Not found | Show empty state |
| 422 | Validation error | Show field-level errors (profile form) |
| 500 | Server error | Show "Something went wrong" + retry button |

All error responses should include a human-readable message:
```json
{ "detail": "Token has expired." }
```

---

*End of document. Questions? Ping the frontend team.*
