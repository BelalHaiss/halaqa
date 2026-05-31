---
applyTo: 'apps/backend/**, packages/shared/**'
---

# Group Billing Rules

## Billing Types

| `billingType`           | Meaning                                      |
| ----------------------- | -------------------------------------------- |
| `FREE`                  | No tutor payout; rate fields must be `null`  |
| `SESSION_COUNT_MONTHLY` | Tutor paid per session; rate fields required |

## Group Rate Fields

- `tutorHourlyRate` — hourly rate for the tutor (nullable; only set for `SESSION_COUNT_MONTHLY`)
- `tutorCurrency` — currency for that rate (nullable; only set for `SESSION_COUNT_MONTHLY`)

## Session Snapshot Fields

Every session record snapshots the tutor pricing **at creation time** so future group changes don't affect historical payouts.

| Session field       | How it is set                                             |
| ------------------- | --------------------------------------------------------- |
| `tutorId`           | Copied from `Group.tutorId`                               |
| `tutorSessionPrice` | `tutorHourlyRate × durationMinutes / 60`; `null` for FREE |
| `tutorCurrency`     | Copied from `Group.tutorCurrency`; `null` for FREE        |

### Duration lookup

`durationMinutes` comes from the `GroupScheduleDay` whose `dayOfWeek` matches the session's `startedAt` converted to `Group.timezone`.

## Tutor Payout

- Only sessions with `tutorSessionPrice IS NOT NULL` count toward tutor payments.
- Payout sums `session.tutorSessionPrice` directly — do **not** recalculate from the current group rate.

## Validation

- When `billingType = SESSION_COUNT_MONTHLY`: `tutorHourlyRate` (positive) and `tutorCurrency` are required.
- When `billingType = FREE`: `tutorHourlyRate` and `tutorCurrency` must be absent / `null`.

## Learner Billing Type

- `LearnerBillingType` is a separate enum from `GroupBillingType` — it lives on `LearnerPayment`, not on `Group`.
- Currently only `SESSION_COUNT_MONTHLY` is supported. Do not infer the learner billing type from the group; store it explicitly on the payment.

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

- `canBeRescheduled` is `true` for: virtual sessions, `RESCHEDULED`, and `MISSED` (no time restriction)
- `COMPLETED` and `CANCELED` sessions are immutable — no further actions
- Attendance can be recorded on `SCHEDULED`, `RESCHEDULED`, and `MISSED` sessions

## Today's Session Window

- `getTodaySessions` extends the start of the query backwards by `MISSED_THRESHOLD_HOURS` (12h)
- Sessions from the lookback window (before midnight) are only shown when unresolved (`SCHEDULED` or `MISSED`)
- This prevents late-night sessions from disappearing after midnight before they are actioned

## Missed Session Cron

- Runs every 2 hours; persists `MISSED` records for sessions with no action after 12h
- Lookback window: 36h (to cover any cron delays)
- Uses `upsert` to prevent duplicate records on concurrent runs
