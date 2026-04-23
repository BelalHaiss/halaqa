Manual payments only; no automated gateway or webhook workflows.
Use one ledger table (FinancialTransaction) for all money movement; createdById lives here only.
Transaction type is INCOME for learner payments and EXPENSE for tutor payouts.
FinancialTransaction links to LearnerPayment or TutorPayment via nullable FK, not join tables.
LearnerPayment stores sessionsCount, totalAmount, paidAmount, currency, periodFrom, and periodTo.
LearnerPayment status is auto-derived from paidAmount vs totalAmount: UNPAID, PARTIAL, PAID.
Use LearnerPaymentGroup join table and keep exactly one active group per learner subscription.
Session must snapshot tutorId, tutorSessionPrice, and tutorCurrency at creation time.
TutorPayment is period-based (periodFrom/periodTo); no per-session join table is needed.
All date boundaries for payout and payment range filtering are stored and queried in UTC.
we need to increment the paid amount for learnerPayment when he pay because we have partial payment
when we pay a tutor we should show in ui a period and disable any date that he already receive money in
