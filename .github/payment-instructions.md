Manual payments only; no automated gateway or webhook workflows.
One ledger table (`FinancialTransaction`) for all money movement; `createdById` lives here only.

- `INCOME` for learner payments, `EXPENSE` for tutor payouts.
- Links to `LearnerPayment` or `TutorPayment` via nullable FK.

`LearnerPayment`: stores `sessionsCount`, `attendedCount`, `totalAmount`, `paidAmount`, `currency`, `periodFrom`, `periodTo`.

- Status auto-derived: `UNPAID` → `PARTIAL` → `PAID` based on `paidAmount` vs `totalAmount`.
- `billingType: LearnerBillingType` is explicit on the record; no group join table.
- Paying increments `paidAmount` (partial payments supported).

## Learner Attended Count

`attendedCount` on `LearnerPayment` tracks how many sessions the learner has consumed within this payment record.

**Rules:**

- Only fires for non-FREE groups (`billingType !== FREE`).
- `ATTENDED` and `MISSED` attendance statuses increment `attendedCount` — `EXCUSED` is ignored.
- Lookup: always `findFirst` the learner's **latest** `LearnerPayment` by `createdAt DESC` where `billingType = SESSION_COUNT_MONTHLY`. No period/date filter.
- If no payment found → log a warning with `// TODO: notify admin/moderator`.
- If `attendedCount >= sessionsCount` (exhausted) → log a warning with `// TODO: notify admin/moderator`.
- If capacity remains → `attendedCount` is incremented by 1.
- The increment happens inside the same Prisma transaction as the attendance upserts (atomic).
- Entry point is `LearnerAttendanceCountService.syncAttendedCount(tx, args)` — always pass the tx client.
- Re-recording attendance on the same session may double-increment; this is a known limitation (naive increment). A recalculation approach is a future TODO.

`TutorPayment`: period-based (`periodFrom`/`periodTo`); one record per currency per period.

- Sessions snapshot `tutorId`, `tutorSessionPrice`, `tutorCurrency` at creation time.
- Creating a tutor payment: group sessions by currency → one `TutorPayment` + one `FinancialTransaction` per currency in a single Prisma transaction.
- UI must show the next allowed `periodFrom` (readonly) and block dates already paid.

All date boundaries stored and queried in UTC.
