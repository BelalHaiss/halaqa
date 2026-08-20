import z, { ZodType } from 'zod';
import {
  CreateLearnerPaymentDto,
  CreateManualTransactionDto,
  CreateTransactionLabelDto,
  LearnerPaymentsSortBy,
  PaymentStatus,
  QueryLearnerPaymentsDto,
  QueryTransactionLabelsDto,
  QueryTransactionsDto,
  SortOrder,
  TransactionEntityType,
  TransactionType,
  TransactionsSortBy,
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

const paymentStatusSchema = z.enum(['UNPAID', 'PAID']) satisfies ZodType<PaymentStatus>;
const sortOrderSchema = z.enum(['asc', 'desc']) satisfies ZodType<SortOrder>;
const learnerSortBySchema = z.enum([
  'learnerName',
  'groupName',
  'totalAmount',
  'currency',
  'status',
  'periodFrom',
  'periodTo',
  'createdAt',
]) satisfies ZodType<LearnerPaymentsSortBy>;

const positiveAmountSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z.coerce.number().positive(m.amountTooSmall);
};

export const createLearnerPaymentSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .object({
      learnerId: nonEmptyIdSchema(locale),
      groupId: nonEmptyIdSchema(locale),
      periodFrom: isoDateOnlySchema(locale),
      periodTo: isoDateOnlySchema(locale),
      totalAmount: positiveAmountSchema(locale),
      currency: currencyCodeSchema(locale),
    })
    .refine((value) => value.periodFrom <= value.periodTo, {
      message: m.periodFromBeforeTo,
      path: ['periodTo'],
    }) satisfies ZodType<CreateLearnerPaymentDto>;
};

export const queryLearnerPaymentsSchema = (locale: ValidationLocale = 'ar') =>
  z.object({
    page: z.coerce.number().min(PAGINATION_MIN_PAGE).optional(),
    limit: z.coerce.number().min(PAGINATION_MIN_LIMIT).max(PAGINATION_MAX_LIMIT).optional(),
    fromDate: optionalIsoDateOnlySchema(locale),
    toDate: optionalIsoDateOnlySchema(locale),
    learnerId: z.string().trim().min(1).optional(),
    groupId: z.string().trim().min(1).optional(),
    status: paymentStatusSchema.optional(),
    currency: currencyCodeSchema(locale).optional(),
    sortBy: learnerSortBySchema.optional(),
    sortOrder: sortOrderSchema.optional(),
  }) satisfies ZodType<QueryLearnerPaymentsDto>;

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
