---
applyTo: 'apps/backend/src/seed/**'
---

# Seed

## Entry point

`src/seed/seed.ts` → `seedData()` runs in order: `cleanUpDatabase` → `seedUsers` → `seedGroups` → `seedSessionsAndAttendance` → `seedDemoMultiCurrencySessions` → `seedPayments` → `bootstrapAdmin`.

## Constants (`seed.constants.ts`)

| Constant                   | Purpose                             |
| -------------------------- | ----------------------------------- |
| `SEED_NUMBER`              | Faker deterministic seed            |
| `TOTAL_TUTORS / LEARNERS / GROUPS` | Dataset size              |
| `MAX_SESSION_DAYS_LOOKBACK`| Lookback window for session seeding |
| `SESSION_STATUS_WEIGHTS`   | Weighted random session statuses    |
| `ATTENDANCE_STATUS_WEIGHTS`| Weighted random attendance statuses |

## File responsibilities

| File                  | What it seeds                                          |
| --------------------- | ------------------------------------------------------ |
| `user.seed.ts`        | Tutors and learners                                    |
| `group.seed.ts`       | Groups with schedule days, assigns tutors and students |
| `session.seed.ts`     | Past sessions + attendance from group schedule; `seedDemoMultiCurrencySessions` adds 4 COMPLETED sessions (EGP × 2, SAR × 2) within last 6 days on the primary group's tutor for manual multi-currency payment testing |
| `payment.seed.ts`     | All payment scenarios (see below)                      |
| `bootstrap-admin.ts`  | Single admin user from env vars                        |
| `cleanup.seed.ts`     | Truncates all tables before re-seeding                 |

## Payment scenarios (`payment.seed.ts`)

| Scenario | Description                                              |
| -------- | -------------------------------------------------------- |
| S1       | UNPAID learner payment                                   |
| S2       | PARTIAL learner payment (1 income transaction)           |
| S3       | PAID learner payment (1 income transaction)              |
| S4       | Second period payment for learnerA                       |
| S5       | Tutor payout from COMPLETED sessions (70–36 days ago)    |
| S6       | Second non-overlapping tutor payout (35–8 days ago)      |

## Conventions

- Always call `faker.seed(SEED_NUMBER)` before seeding for determinism.
- Use `utcDayStart` / `utcDayEnd` helpers for all date boundaries — never pass raw strings to Prisma date fields.
- Session records must include `groupId`, `tutorId`, `tutorSessionPrice`, `tutorCurrency`, `startedAt`, `status`.
- Use `prisma.$transaction` when inserting multiple related records (e.g., payment + transaction).
- New seed scenarios go in the relevant seed file; add a row to the table above.
