Manual payments only; no automated gateway or webhook workflows.
One ledger table (`FinancialTransaction`) for all money movement; `createdById` lives here only.
- `INCOME` for learner payments, `EXPENSE` for tutor payouts.
- Links to `LearnerPayment` or `TutorPayment` via nullable FK.

`LearnerPayment`: stores `sessionsCount`, `totalAmount`, `paidAmount`, `currency`, `periodFrom`, `periodTo`.
- Status auto-derived: `UNPAID` → `PARTIAL` → `PAID` based on `paidAmount` vs `totalAmount`.
- `billingType: LearnerBillingType` is explicit on the record; no group join table.
- Paying increments `paidAmount` (partial payments supported).

`TutorPayment`: period-based (`periodFrom`/`periodTo`); one record per currency per period.
- Sessions snapshot `tutorId`, `tutorSessionPrice`, `tutorCurrency` at creation time.
- Creating a tutor payment: group sessions by currency → one `TutorPayment` + one `FinancialTransaction` per currency in a single Prisma transaction.
- UI must show the next allowed `periodFrom` (readonly) and block dates already paid.

All date boundaries stored and queried in UTC.
