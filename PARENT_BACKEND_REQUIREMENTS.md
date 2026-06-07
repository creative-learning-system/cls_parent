# CLS Parent Dashboard — Backend API Requirements

**Date:** 2026-06-07  
**Frontend repo:** `cls_parent` (Next.js)  
**Base URL:** `https://api.creativelearningsystem.com`  
**Auth:** Bearer token in `Authorization` header  
**Response unwrap:** Frontend reads `response.data` — so top-level object must have a `data` key, or just return the payload directly (both handled)

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Working |
| ⚠️ | Endpoint exists but missing fields or broken |
| ❌ | Not implemented — UI shows empty/error state |
| 🚧 | UI is a placeholder — needs both backend + UI work |

---

## 1. Authentication

### 1.1 Login

```
POST /api/auth/login
```

**Status:** ✅  
**Body:**
```json
{ "email": "parent@example.com", "password": "password123" }
```
**Response:**
```json
{
  "data": {
    "access_token": "jwt...",
    "refresh_token": "jwt...",
    "user": {
      "id": 1,
      "full_name": "Mr. Okafor",
      "email": "parent@example.com",
      "role": "parent",
      "require_password_change": false
    }
  }
}
```

> `require_password_change: true` redirects the user to `/change-password` after login.

---

### 1.2 Change Password (first login)

```
POST /api/auth/change-password
```

**Status:** ✅  
**Body:**
```json
{ "current_password": "old", "new_password": "new123" }
```

---

### 1.3 Forgot Password

```
POST /api/auth/forgot-password
```

**Status:** ❌ Not wired up — UI page exists at `/forgot-password` but the form fakes a `setTimeout` delay and shows a "sent" confirmation without calling any real API.  

**What needs doing:** Wire the form to this endpoint.  
**Body:**
```json
{ "email": "parent@example.com" }
```
**Response:**
```json
{ "data": { "message": "Reset link sent if email exists." } }
```

---

### 1.4 Reset Password (via email link)

```
POST /api/auth/reset-password
```

**Status:** 🚧 UI page exists at `/reset-password` but currently has NO API call — just a static form shell. Needs both the backend endpoint and frontend wiring.

**Body:**
```json
{ "token": "reset_token_from_email", "new_password": "newpass123" }
```

---

## 2. Dashboard Home

```
GET /api/parent/dashboard
```

**Status:** ⚠️ Endpoint exists — verify all fields are present  
**Response:**
```json
{
  "data": {
    "total_children": 2,
    "children": [
      {
        "student_id": 84,
        "full_name": "Chidera Okafor",
        "class_info": "JSS 2B",
        "reasoning_levels": [
          { "TypeName": "LogicalReasoning",   "CurrentLevel": 2, "LevelName": "Silver" },
          { "TypeName": "LinguisticReasoning", "CurrentLevel": 1, "LevelName": "Bronze" }
        ],
        "today_compliance": {
          "LogicalTargetMet": true,
          "LinguisticTargetMet": false,
          "ReadingReflectionCompleted": true
        },
        "recent_achievements": [
          {
            "ChangeType": "Promotion",
            "DrillTypeID": 1,
            "NewLevel": 2,
            "ChangedAt": "2026-06-07T10:00:00Z"
          }
        ]
      }
    ]
  }
}
```

---

## 3. Home Section — per child

All of these are called when the parent views a child's **Home** tab.

### 3.1 Reasoning Subsections (Drill Cards)

```
GET /api/parent/child/:studentId/reasoning-subsections
```

**Status:** ⚠️ Called — verify response shape  
**Response:**
```json
{
  "data": {
    "student_id": 84,
    "logical_reasoning": [
      {
        "subsection_id": 1,
        "subsection_name": "Order of Operations",
        "subsection_code": "ORDER_OF_OPERATIONS",
        "current_level": 2,
        "medal": "SILVER",
        "label": "Silver"
      }
    ],
    "linguistic_reasoning": [
      {
        "subsection_id": 10,
        "subsection_name": "Grammar & Syntax",
        "subsection_code": "GRAMMAR_SYNTAX",
        "current_level": 1,
        "medal": "BRONZE",
        "label": "Bronze"
      }
    ]
  }
}
```

> `subsection_code` is displayed as the drill name after formatting (underscores → spaces, Title Case). Use human-readable names like `ORDER_OF_OPERATIONS` → displayed as "Order Of Operations".

---

### 3.2 Reading Reflections

```
GET /api/parent/child/:studentId/reading-reflections
```

**Status:** ⚠️ Called — verify response  
**Response:**
```json
{
  "data": {
    "student_id": 84,
    "count": 3,
    "reflections": [
      {
        "reflection_id": 1,
        "content_id": 12,
        "topic_title": "The Water Cycle",
        "star_rating": 4,
        "what_liked": "The story part was interesting",
        "what_missing": "More pictures",
        "submitted_at": "2026-06-07T09:00:00Z",
        "parts": [
          { "part_number": 1, "question": "What is the water cycle?", "answer": "It is the way water moves..." }
        ]
      }
    ]
  }
}
```

---

### 3.3 Suspension Status

```
GET /api/parent/child/:studentId/suspension-status
```

**Status:** ⚠️ Called from Home section  
**Response:**
```json
{
  "data": {
    "student_id": 84,
    "full_name": "Chidera Okafor",
    "status": "Active",
    "is_suspended": false
  }
}
```

---

### 3.4 Suspend / Unsuspend Child

```
POST /api/parent/child/:studentId/suspend
POST /api/parent/child/:studentId/unsuspend
```

**Status:** ⚠️ Called — verify working. No body required.  
> Parent can suspend/unsuspend their child's account (e.g. as a discipline measure). UI has confirm modal + loading state.

---

### 3.5 Resend Onboarding

```
POST /api/parent/child/:studentId/resend-onboarding
```

**Status:** ❌ Probably not implemented  
> Resends the child's app login credentials. No body required.

---

### 3.6 Activity Log

```
GET /api/parent/child/:studentId/activity-log
```

**Status:** ❌ Returns 500 — currently `return null` on error so no UI shown  
**Response:**
```json
{
  "data": {
    "student_id": 84,
    "activities": [
      {
        "id": 1,
        "type": "drill",
        "title": "Order of Operations",
        "description": "Logical Reasoning · Level 2",
        "timestamp": "2026-06-07T14:30:00Z",
        "score": "7/10",
        "accuracy": 70
      },
      {
        "id": 2,
        "type": "reflection",
        "title": "The Water Cycle",
        "description": "Reading reflection submitted",
        "timestamp": "2026-06-07T13:00:00Z"
      },
      {
        "id": 3,
        "type": "pretest",
        "title": "Mathematics Pretest",
        "description": "Score: 18/25",
        "timestamp": "2026-06-06T10:00:00Z",
        "score": "18/25"
      }
    ]
  }
}
```

> `type` — `"drill" | "reflection" | "pretest"` — determines icon and badge colour in the UI.  
> **This endpoint is returning 500 in production. Fix this first — it logs spam in the console.**

---

## 4. Mental Drill Section

```
GET /api/parent/child/:studentId/mental-drills?timeframe=this_week
```

**Status:** ⚠️ Called — verify all fields  
**Query:** `timeframe` = `today | this_week | this_month | all_time`  
**Response:**
```json
{
  "data": {
    "student_id": 84,
    "timeframe": "this_week",
    "alerts": [
      {
        "change_type": "Promotion",
        "category": "Logical Reasoning",
        "subsection_name": "Order of Operations",
        "subsection_code": "ORDER_OF_OPERATIONS",
        "previous_level": 1,
        "new_level": 2,
        "timestamp": "2026-06-06T15:00:00Z",
        "message": "Chidera was promoted!",
        "subtext": "Keep up the encouragement",
        "status": "success"
      }
    ],
    "today_activity": {
      "logical_drills": [
        {
          "attempt_id": 1,
          "subsection_name": "Order of Operations",
          "subsection_code": "ORDER_OF_OPERATIONS",
          "score": "7/10",
          "accuracy": 70,
          "completed_at": "2:30 PM",
          "time_label": "2:30 PM"
        }
      ],
      "linguistic_reasoning": []
    },
    "past_activity": [
      {
        "date": "2026-06-06",
        "display_date": "Yesterday",
        "day_label": "Yesterday",
        "logical_drills": [],
        "linguistic_reasoning": []
      }
    ]
  }
}
```

---

## 5. Reading Section

### 5.1 Reading Reflections (same as §3.2)

```
GET /api/parent/child/:studentId/reading-reflections
```

Shared between Home and Reading tabs. See §3.2 for shape.

---

### 5.2 Reading Interests / Career Paths

```
GET /api/parent/child/:studentId/reading-interests
```

**Status:** ⚠️ Called  
**Response:**
```json
{
  "data": {
    "student_id": 84,
    "career_paths": [
      {
        "CareerName": "Botanist",
        "StoriesRead": 5,
        "LastReadAt": "2026-06-07T08:00:00Z"
      }
    ],
    "reflections": [
      {
        "StoryTitle": "Photosynthesis",
        "CareerName": "Botanist",
        "ReflectionText": "I found this very interesting...",
        "SubmittedAt": "2026-06-07T08:00:00Z"
      }
    ]
  }
}
```

---

## 6. Progress Section

The Progress section has 6 sub-tabs: **Weekly**, **Academic**, **Curriculum**, **Analytics**, **History**, **Pretests**.

### 6.1 Weekly Compliance

```
GET /api/parent/child/:studentId/weekly-compliance
```

**Status:** ⚠️ Called  
**Response:**
```json
{
  "data": {
    "student_id": 84,
    "days_fully_compliant": 4,
    "total_days_logged": 7,
    "compliance_consistency_percentage": 57,
    "weekly_daily_breakdown": [
      {
        "date": "2026-06-01",
        "day_name": "Monday",
        "logical_target_met": true,
        "logical_time_spent_mins": 20,
        "linguistic_target_met": true,
        "linguistic_time_spent_mins": 18,
        "reading_reflection_completed": true,
        "is_fully_compliant": true
      }
    ]
  }
}
```

---

### 6.2 Academic Profile

```
GET /api/parent/child/:studentId/academic-profile
```

**Status:** ⚠️ Called  
**Response:**
```json
{
  "data": {
    "student_id": 84,
    "strengths": [
      { "area": "Order of Operations", "score": 88, "type": "Logical", "details": "Consistently performs above average" }
    ],
    "growth_areas": [
      { "area": "Sentence Analysis", "score": 42, "type": "Linguistic", "details": "Needs more practice" }
    ],
    "recommendations": [
      "Encourage 10 minutes of daily linguistic drill practice",
      "Review reading reflections together each evening"
    ],
    "total_reflections": 12,
    "average_reflection_rating": 3.8
  }
}
```

---

### 6.3 Curriculum Checklist

```
GET /api/parent/child/:studentId/curriculum-checklist
```

**Status:** ⚠️ Called  
**Response:**
```json
{
  "data": {
    "student_id": 84,
    "subject_progress": [
      {
        "subject_id": 1,
        "subject_name": "Mathematics",
        "mastery_count": 3,
        "topics": [
          {
            "topic_id": 101,
            "topic_name": "Algebraic Equations",
            "topic_code": "MATH-001",
            "status": "Mastered",
            "score": "92%"
          },
          {
            "topic_id": 102,
            "topic_name": "Fractions",
            "topic_code": "MATH-002",
            "status": "Passed",
            "score": "74%"
          },
          {
            "topic_id": 103,
            "topic_name": "Geometry",
            "topic_code": "MATH-003",
            "status": "Not Started",
            "score": ""
          }
        ]
      }
    ]
  }
}
```

> `status` — `"Mastered" | "Passed" | "Not Started"`

---

### 6.4 Reasoning Analytics

```
GET /api/parent/child/:studentId/reasoning-analytics
```

**Status:** ⚠️ Called  
**Response:**
```json
{
  "data": {
    "student_id": 84,
    "accuracy_trends": [
      {
        "date": "2026-06-01",
        "logical_accuracy": 72,
        "linguistic_accuracy": 58
      }
    ],
    "level_history": [
      {
        "DrillTypeID": 1,
        "ChangeType": "Promotion",
        "OldLevel": 1,
        "NewLevel": 2,
        "ChangedAt": "2026-06-05T14:00:00Z"
      }
    ]
  }
}
```

---

### 6.5 Compliance History (30-day calendar)

```
GET /api/parent/child/:studentId/compliance-history
```

**Status:** ⚠️ Called  
**Response:**
```json
{
  "data": {
    "compliance": [
      {
        "date": "2026-06-07",
        "LogicalTargetMet": true,
        "LinguisticTargetMet": false,
        "ReadingReflectionCompleted": true
      }
    ]
  }
}
```

---

### 6.6 Pretests

```
GET /api/parent/child/:studentId/pretests
```

**Status:** ⚠️ Called  
**Response:**
```json
{
  "data": {
    "pretests": [
      {
        "subject": "Mathematics",
        "score": 18,
        "total": 25,
        "topics": [
          { "name": "Algebraic Equations", "correct": true },
          { "name": "Fractions", "correct": false }
        ],
        "taken_at": "2026-06-01T10:00:00Z"
      }
    ]
  }
}
```

---

## 7. Messages Section

**Status:** 🚧 Full backend + UI work required

Currently shows a "Messaging Coming Soon" placeholder. The `dashboard-data.ts` file already has full mock data structures for messaging — the UI design is defined. Needs real implementation.

### 7.1 Get Conversations (teacher list for a child)

```
GET /api/parent/child/:studentId/teachers
```

**❌ Endpoint does not exist**  
**Response needed:**
```json
{
  "data": {
    "teachers": [
      {
        "teacher_id": "t1",
        "full_name": "Mrs. Adebayo",
        "role": "Class Teacher",
        "subject": "Mathematics",
        "last_message": "Chidera did well in today's quiz!",
        "last_message_at": "2026-06-07T10:30:00Z",
        "unread_count": 2
      }
    ]
  }
}
```

---

### 7.2 Get Messages in a Conversation

```
GET /api/parent/child/:studentId/messages/:teacherId
```

**❌ Endpoint does not exist**  
**Response needed:**
```json
{
  "data": {
    "messages": [
      {
        "id": "m1",
        "from": "teacher",
        "sender_name": "Mrs. Adebayo",
        "text": "Good morning! Chidera did very well today.",
        "sent_at": "2026-06-07T10:15:00Z",
        "read": true
      },
      {
        "id": "m2",
        "from": "parent",
        "sender_name": "Mr. Okafor",
        "text": "That's wonderful to hear!",
        "sent_at": "2026-06-07T10:22:00Z",
        "read": true
      }
    ]
  }
}
```

---

### 7.3 Send a Message

```
POST /api/parent/child/:studentId/messages/:teacherId
```

**❌ Endpoint does not exist**  
**Body:**
```json
{ "text": "Thank you for the update, Mrs. Adebayo." }
```

---

### 7.4 Mark Messages as Read

```
PATCH /api/parent/child/:studentId/messages/:teacherId/read
```

**❌ Endpoint does not exist**  
No body required.

---

## 8. Notifications

```
GET /api/parent/notifications
```

**Status:** ⚠️ Called from navbar — verify response  
**Response:**
```json
{
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "InApp",
        "message": "Chidera was promoted in Order of Operations!",
        "sent_at": "2026-06-07T10:00:00Z",
        "read": false
      },
      {
        "id": 2,
        "type": "WhatsApp",
        "message": "Daily drill reminder sent via WhatsApp",
        "sent_at": "2026-06-06T08:00:00Z",
        "read": true
      }
    ]
  }
}
```

> `type` — `"WhatsApp" | "InApp"` — determines the icon shown in the notification panel  

### Mark notification as read

```
PATCH /api/parent/notifications/:id/read
```

**Status:** ❌ Not implemented — unread dot never clears  
No body required.

---

## 9. Profile Page

```
GET /api/parent/profile
PUT /api/parent/profile
```

**Status:** ⚠️ Both called — verify working  

**GET response:**
```json
{
  "data": {
    "full_name": "Mr. Emmanuel Okafor",
    "email": "parent@example.com",
    "phone_number": "+2348012345678"
  }
}
```

**PUT body** (partial update — only send changed fields):
```json
{ "full_name": "Mr. Emmanuel Okafor" }
```
or
```json
{ "phone_number": "+2348087654321" }
```

> Email is read-only in the UI — no edit button shown for email field.

---

## 10. Children List

```
GET /api/parent/children
```

**Status:** ⚠️ Called  
**Response:**
```json
{
  "data": {
    "children": [
      {
        "student_id": 84,
        "full_name": "Chidera Okafor",
        "class_info": "JSS 2B",
        "relationship": "Child"
      }
    ]
  }
}
```

---

## 11. Child Overview (unused / for future)

```
GET /api/parent/child/:studentId/overview
```

**Status:** ❌ Called in code but result is unused in current UI (typed as `Record<string, unknown>`)  
This is a placeholder — no UI currently reads from it.

---

## Summary — Priority Order

| Priority | Endpoint | Why |
|----------|----------|-----|
| 🔴 P0 | `GET /api/parent/child/:id/activity-log` | Returns 500 — spamming console with errors |
| 🔴 P0 | `GET /api/parent/dashboard` | Must be correct — entire app breaks without it |
| 🟠 P1 | `GET /api/parent/child/:id/reasoning-subsections` | Home drill cards show nothing without it |
| 🟠 P1 | `GET /api/parent/child/:id/mental-drills` | Mental Drill section empty |
| 🟠 P1 | `GET /api/parent/child/:id/reading-reflections` | Reading section empty |
| 🟠 P1 | `GET /api/parent/notifications` | Notification bell empty |
| 🟡 P2 | `GET/PUT /api/parent/profile` | Profile page broken |
| 🟡 P2 | `GET /api/parent/child/:id/weekly-compliance` | Progress → Weekly tab empty |
| 🟡 P2 | `GET /api/parent/child/:id/academic-profile` | Progress → Academic tab empty |
| 🟡 P2 | `GET /api/parent/child/:id/curriculum-checklist` | Progress → Curriculum tab empty |
| 🟡 P2 | `GET /api/parent/child/:id/reasoning-analytics` | Progress → Analytics tab empty |
| 🟡 P2 | `GET /api/parent/child/:id/compliance-history` | Progress → History tab empty |
| 🟡 P2 | `GET /api/parent/child/:id/pretests` | Progress → Pretests tab empty |
| 🟢 P3 | `POST /api/auth/forgot-password` | Forgot password page fakes the API call |
| 🟢 P3 | `POST /api/auth/reset-password` | Reset password page has no API call at all |
| 🟢 P3 | `PATCH /api/parent/notifications/:id/read` | Unread dots never clear |
| 🔵 P4 | Messages CRUD (4 endpoints) | Full feature — needs backend + UI work |

---

## Sections Needing UI Work (not just backend)

| Section | Status | What's needed |
|---------|--------|---------------|
| **Messages** | `MessagesSection` shows "Coming Soon" placeholder | Full chat UI: teacher list, message thread, send box, unread badges. Mock data structure already exists in `lib/dashboard-data.ts` — use it as the UI spec. |
| **Reset Password** | `/reset-password` page is a static form shell | Wire `POST /api/auth/reset-password` — accept `?token=` from URL, submit new password |
| **Forgot Password** | `/forgot-password` — fakes the call with `setTimeout` | Replace with real `POST /api/auth/forgot-password` call |
| **Notifications mark-read** | Bell shows unread count but never clears | Add `PATCH /api/parent/notifications/:id/read` call when panel opens or user taps a notification |
