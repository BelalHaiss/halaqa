Manual payments only; no automated gateway or webhook workflows.

One ledger table (`FinancialTransaction`) for all money movement; `createdById` lives here only.

- `INCOME` for learner payments, `EXPENSE` for everything else (including tutor payouts).
- `entityType` is `LEARNER_PAYMENT` (linked via nullable `learnerPaymentId`) or `MANUAL`.
- There is no dedicated tutor-payment entity. Tutor payouts are recorded as ordinary manual `EXPENSE` transactions (`entityType: MANUAL`) via the standard manual-transaction flow — admin or moderator enters the amount, currency, label, and notes by hand.

## Learner Payments

`LearnerPayment`: stores `learnerId`, `groupId`, `totalAmount`, `currency`, `periodFrom`, `periodTo`, `status`.

- `groupId` is a required FK (`onDelete: Restrict`) — every learner payment is tied to the specific group it was charged for. Used for filtering (`GET /payments/learner?groupId=`) and shown in the payment summary/details.
- Full-payment-only — there is no partial payment support. Creating a learner payment immediately records it as `PAID` in full, in the same transaction as the one `INCOME` `FinancialTransaction` it creates. There is no "apply payment" / incremental pay step.
- Create-only — there is no update/edit endpoint. Fixing a mistake means deleting and recreating the payment.
- `status: PaymentStatus` is `UNPAID | PAID`.
- On create, the service re-validates server-side that `dto.groupId` has `billingType = MONTHLY` and that the learner is currently enrolled in it (`GroupStudent` row with `leftAt: null`) before persisting. This exists so the read-only group price hint shown in the UI can't be bypassed by a stale/forged request.
- The learner-payment creation UI: select the learner first, then a group select restricted to groups the learner is enrolled in with `billingType = MONTHLY` (fetched via `GET /groups/options?learnerId=`). Once a group is picked, its `monthlyPrice`/`currency` are shown as read-only hint text only — the actual `amount`/`currency` charged and the `periodFrom`/`periodTo` dates are always entered manually by the admin and are not bound to the group's price.
- The learner-payments tab also has a plain group filter (independent of any learner selection), fetched via `GET /groups/options?paidOnly=true` — shows only `MONTHLY` groups, unfiltered by enrollment.

## Group Pricing

`GroupBillingType` is `FREE | MONTHLY`. `Group.monthlyPrice` + `Group.currency` are the learner-facing monthly subscription price shown as a hint during learner-payment creation — see `.github/instructions/group.instructions.md` for full field rules.

All date boundaries stored and queried in UTC.
