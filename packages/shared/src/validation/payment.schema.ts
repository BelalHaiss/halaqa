import z, { ZodType } from 'zod';
import {
  ApplyLearnerPaymentDto,
  CreateLearnerPaymentDto,
  CreateManualTransactionDto,
  CreateTransactionLabelDto,
  CreateTutorPaymentDto,
  LearnerBillingType,
  LearnerPaymentsSortBy,
  PaymentStatus,
  PreviewTutorPaymentDto,
  QueryLearnerPaymentsDto,
  QueryTransactionLabelsDto,
  QueryTransactionsDto,
  QueryTutorPaymentsDto,
  SortOrder,
  TransactionEntityType,
  TransactionType,
  TransactionsSortBy,
  TutorPaymentsSortBy,
} from '../payment.types';
import {
  PAGINATION_MAX_LIMIT,
  PAGINATION_MIN_LIMIT,
  PAGINATION_MIN_PAGE,
} from './fields.constants';
import { ValidationLocale, getMessages } from './messages';
import { currencyCodeSchema } from './currency.schema';
import {
  nameSchema,
  nonEmptyIdSchema,
  notesSchema,
  optionalIsoDateOnlySchema,
  isoDateOnlySchema,
} from './fields.schema';

const paymentStatusSchema = z.enum(['UNPAID', 'PARTIAL', 'PAID']) satisfies ZodType<PaymentStatus>;
const sortOrderSchema = z.enum(['asc', 'desc']) satisfies ZodType<SortOrder>;
const learnerSortBySchema = z.enum([
  'learnerName',
  'sessionsCount',
  'totalAmount',
  'paidAmount',
  'currency',
  'status',
  'periodFrom',
  'periodTo',
  'createdAt',
]) satisfies ZodType<LearnerPaymentsSortBy>;
const tutorSortBySchema = z.enum([
  'tutorName',
  'sessionsCount',
  'totalAmount',
  'currency',
  'periodFrom',
  'periodTo',
  'createdAt',
]) satisfies ZodType<TutorPaymentsSortBy>;

const positiveAmountSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z.coerce.number().positive(m.amountTooSmall);
};

const learnerBillingTypeSchema = z.enum([
  'SESSION_COUNT_MONTHLY',
]) satisfies ZodType<LearnerBillingType>;

export const createLearnerPaymentSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .object({
      learnerId: nonEmptyIdSchema(locale),
      billingType: learnerBillingTypeSchema,
      sessionsCount: z.coerce.number().int().positive(),
      periodFrom: isoDateOnlySchema(locale),
      periodTo: isoDateOnlySchema(locale),
      totalAmount: positiveAmountSchema(locale),
      currency: currencyCodeSchema(locale),
      initialPaidAmount: z.coerce.number().min(0).optional(),
    })
    .refine((value) => value.periodFrom <= value.periodTo, {
      message: m.periodFromBeforeTo,
      path: ['periodTo'],
    })
    .refine(
      (value) =>
        value.initialPaidAmount === undefined || value.initialPaidAmount <= value.totalAmount,
      {
        message: m.initialPaidExceedsTotal,
        path: ['initialPaidAmount'],
      }
    ) satisfies ZodType<CreateLearnerPaymentDto>;
};

export const applyLearnerPaymentSchema = (locale: ValidationLocale = 'ar') =>
  z.object({
    amount: positiveAmountSchema(locale),
    currency: currencyCodeSchema(locale),
  }) satisfies ZodType<ApplyLearnerPaymentDto>;

export const queryLearnerPaymentsSchema = (locale: ValidationLocale = 'ar') =>
  z.object({
    page: z.coerce.number().min(PAGINATION_MIN_PAGE).optional(),
    limit: z.coerce.number().min(PAGINATION_MIN_LIMIT).max(PAGINATION_MAX_LIMIT).optional(),
    fromDate: optionalIsoDateOnlySchema(locale),
    toDate: optionalIsoDateOnlySchema(locale),
    status: paymentStatusSchema.optional(),
    sessionsCount: z.coerce.number().int().positive().optional(),
    currency: currencyCodeSchema(locale).optional(),
    search: z.string().trim().min(1).optional(),
    sortBy: learnerSortBySchema.optional(),
    sortOrder: sortOrderSchema.optional(),
  }) satisfies ZodType<QueryLearnerPaymentsDto>;

export const previewTutorPaymentSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .object({
      tutorId: nonEmptyIdSchema(locale),
      periodFrom: isoDateOnlySchema(locale),
      periodTo: isoDateOnlySchema(locale),
    })
    .refine((value) => value.periodFrom <= value.periodTo, {
      message: m.periodFromBeforeTo,
      path: ['periodTo'],
    }) satisfies ZodType<PreviewTutorPaymentDto>;
};

export const createTutorPaymentSchema = (locale: ValidationLocale = 'ar') =>
  previewTutorPaymentSchema(locale) satisfies ZodType<CreateTutorPaymentDto>;

export const queryTutorPaymentsSchema = (locale: ValidationLocale = 'ar') =>
  z.object({
    page: z.coerce.number().min(PAGINATION_MIN_PAGE).optional(),
    limit: z.coerce.number().min(PAGINATION_MIN_LIMIT).max(PAGINATION_MAX_LIMIT).optional(),
    fromDate: optionalIsoDateOnlySchema(locale),
    toDate: optionalIsoDateOnlySchema(locale),
    tutorId: z.string().trim().min(1).optional(),
    currency: currencyCodeSchema(locale).optional(),
    search: z.string().trim().min(1).optional(),
    sortBy: tutorSortBySchema.optional(),
    sortOrder: sortOrderSchema.optional(),
  }) satisfies ZodType<QueryTutorPaymentsDto>;

// ─── Transaction Labels ────────────────────────────────────────────────────────

export const createTransactionLabelSchema = (locale: ValidationLocale = 'ar') =>
  z.object({
    name: nameSchema(locale),
  }) satisfies ZodType<CreateTransactionLabelDto>;

export const queryTransactionLabelsSchema = () =>
  z.object({
    page: z.coerce.number().min(PAGINATION_MIN_PAGE).optional(),
    limit: z.coerce.number().min(PAGINATION_MIN_LIMIT).max(PAGINATION_MAX_LIMIT).optional(),
    search: z.string().trim().min(1).optional(),
  }) satisfies ZodType<QueryTransactionLabelsDto>;

// ─── Manual / All Transactions ─────────────────────────────────────────────────

const transactionTypeSchema = z.enum(['INCOME', 'EXPENSE']) satisfies ZodType<TransactionType>;
const transactionEntityTypeSchema = z.enum([
  'LEARNER_PAYMENT',
  'TUTOR_PAYMENT',
  'MANUAL',
]) satisfies ZodType<TransactionEntityType>;
const transactionsSortBySchema = z.enum([
  'createdAt',
  'amount',
  'currency',
]) satisfies ZodType<TransactionsSortBy>;

export const createManualTransactionSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .object({
      type: transactionTypeSchema,
      amount: z.coerce.number().positive(m.amountTooSmall),
      currency: currencyCodeSchema(locale),
      labelId: nonEmptyIdSchema(locale).optional(),
      newLabelName: nameSchema(locale).optional(),
      notes: notesSchema(locale).optional(),
    })
    .refine((v) => !!v.labelId || !!v.newLabelName, {
      message: m.transactionLabelRequired,
      path: ['labelId'],
    })
    .refine((v) => !(v.labelId && v.newLabelName), {
      message: m.transactionLabelConflict,
      path: ['newLabelName'],
    }) satisfies ZodType<CreateManualTransactionDto>;
};

export const queryTransactionsSchema = (locale: ValidationLocale = 'ar') =>
  z.object({
    page: z.coerce.number().min(PAGINATION_MIN_PAGE).optional(),
    limit: z.coerce.number().min(PAGINATION_MIN_LIMIT).max(PAGINATION_MAX_LIMIT).optional(),
    fromDate: optionalIsoDateOnlySchema(locale),
    toDate: optionalIsoDateOnlySchema(locale),
    type: transactionTypeSchema.optional(),
    entityType: transactionEntityTypeSchema.optional(),
    currency: currencyCodeSchema(locale).optional(),
    labelId: z.string().trim().min(1).optional(),
    sortBy: transactionsSortBySchema.optional(),
    sortOrder: sortOrderSchema.optional(),
  }) satisfies ZodType<QueryTransactionsDto>;
