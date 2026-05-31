import z, { ZodType } from 'zod';
import {
  ApplyLearnerPaymentDto,
  CreateLearnerPaymentDto,
  CreateTutorPaymentDto,
  LearnerBillingType,
  LearnerPaymentsSortBy,
  PaymentStatus,
  PreviewTutorPaymentDto,
  QueryLearnerPaymentsDto,
  QueryTutorPaymentsDto,
  SortOrder,
  TutorPaymentsSortBy,
} from '../payment.types';
import {
  PAGINATION_MAX_LIMIT,
  PAGINATION_MIN_LIMIT,
  PAGINATION_MIN_PAGE,
} from './fields.constants';
import { ValidationLocale, getMessages } from './messages';
import { currencyCodeSchema } from './currency.schema';
import { nonEmptyIdSchema, optionalIsoDateOnlySchema, isoDateOnlySchema } from './fields.schema';

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

export const createLearnerPaymentSchema = (locale: ValidationLocale = 'ar') =>
  z
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
      message: 'تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية',
      path: ['periodTo'],
    })
    .refine(
      (value) =>
        value.initialPaidAmount === undefined || value.initialPaidAmount <= value.totalAmount,
      {
        message: 'المبلغ المدفوع  لا يمكن أن يكون أكبر من المبلغ الإجمالي',
        path: ['initialPaidAmount'],
      }
    ) satisfies ZodType<CreateLearnerPaymentDto>;

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

export const previewTutorPaymentSchema = (locale: ValidationLocale = 'ar') =>
  z
    .object({
      tutorId: nonEmptyIdSchema(locale),
      periodFrom: isoDateOnlySchema(locale),
      periodTo: isoDateOnlySchema(locale),
    })
    .refine((value) => value.periodFrom <= value.periodTo, {
      message: 'periodFrom must be before or equal to periodTo',
      path: ['periodTo'],
    }) satisfies ZodType<PreviewTutorPaymentDto>;

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
