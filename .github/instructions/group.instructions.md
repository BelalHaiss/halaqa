---
applyTo: 'apps/backend/**, packages/shared/**'
---

# Group Billing Rules

## Billing Types

| `billingType` | Meaning                                                       |
| -------------- | -------------------------------------------------------------- |
| `FREE`        | No charge to learners; pricing fields must be `null`           |
| `MONTHLY`     | Learner-facing monthly subscription; pricing fields required |

## Group Pricing Fields

- `monthlyPrice` — the monthly subscription price shown to learners (nullable; only set for `MONTHLY`)
- `currency` — currency for that price (nullable; only set for `MONTHLY`)

These fields are purely informational for the learner-payment creation flow: they're shown as a read-only hint (see `.github/payment-instructions.md`) but never bind or auto-fill the actual amount charged, which is always entered manually.

Sessions do not snapshot pricing — `Session` only stores `tutorId`. Tutor payouts are handled entirely outside the group/session pricing model as manual `EXPENSE` transactions (see `.github/payment-instructions.md`).

## Validation

- When `billingType = MONTHLY`: `monthlyPrice` (positive) and `currency` are required.
- When `billingType = FREE`: `monthlyPrice` and `currency` must be absent / `null`.

---

# Session Status & Logic

## Status Overview

| Status        | DB Record? | How Created                                            |
| ------------- | ---------- | ------------------------------------------------------ |
| `SCHEDULED`   | No         | Virtual — computed on-the-fly if now < startedAt + 12h |
| `MISSED`      | No → Yes   | Virtual after 12h; cron (every 2h) persists it to DB   |
| `COMPLETED`   | Yes        | Admin/tutor records attendance                         |
| `CANCELED`    | Yes        | Explicitly canceled before or on the day               |
| `RESCHEDULED` | Yes        | Moved to a new date/time                               |

## Virtual vs Persistent

- `SessionRecordStatus` = the four DB-persisted statuses (`MISSED`, `COMPLETED`, `CANCELED`, `RESCHEDULED`)
- `SessionComputedStatus` = above + `SCHEDULED` (virtual, never stored)
- `resolveSessionStatus()` in `session.util.ts` is the single source of truth for computing status

## Action Rules

Enforced server-side in `session.service.ts` via `canSessionBeRescheduled()` / `canRecordAttendance()` (`session.util.ts`) — not just hidden in the UI.

| Status        | Cancel / Reschedule | Attendance |
| ------------- | -------------------- | ---------- |
| Virtual (no record) | ✅ Allowed      | ✅ Allowed |
| `RESCHEDULED` | ✅ Allowed            | ✅ Allowed |
| `MISSED`      | ✅ Allowed (no time restriction) | ❌ Blocked |
| `COMPLETED`   | ❌ Blocked            | ✅ Allowed |
| `CANCELED`    | ❌ Blocked            | ❌ Blocked |

- `canSessionBeRescheduled` also governs cancel eligibility (same status rules apply to both actions).
- `canRecordAttendance` is `false` only for `MISSED` and `CANCELED`; `true` otherwise, including `COMPLETED` (attendance is editable after completion).

## Today's Session Window

- `getTodaySessions` extends the start of the query backwards by `MISSED_THRESHOLD_HOURS` (12h)
- Sessions from the lookback window (before midnight) are only shown when unresolved (`SCHEDULED` or `MISSED`)
- This prevents late-night sessions from disappearing after midnight before they are actioned

## Missed Sessions Page

- `GET /sessions/missed` (`getMissedSessions`) returns **every** `MISSED` session regardless of age — unpaginated, tutor-scoped via `buildGroupScopeWhere`.
- Distinct from the "Today" window above: this is an all-time list, not bounded by the 12h lookback.
- Rendered as a second section on the Today Sessions page (`TodaySessionsView.tsx`).

## Missed Session Cron

- Runs every 2 hours; persists `MISSED` records for sessions with no action after 12h
- Lookback window: 36h (to cover any cron delays)
- Uses `upsert` to prevent duplicate records on concurrent runs
