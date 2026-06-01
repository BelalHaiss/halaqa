import {
  ISODateOnlyString,
  ISODateString,
  PaginationQueryType,
  PaginationResponseMeta,
  DateRangeQueryType,
} from './types/api.types';
import { CurrencyCode } from './currency.types';

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionEntityType = 'LEARNER_PAYMENT' | 'TUTOR_PAYMENT' | 'MANUAL';
export type LearnerBillingType = 'SESSION_COUNT_MONTHLY';
export type SortOrder = 'asc' | 'desc';
export type LearnerPaymentsSortBy =
  | 'learnerName'
  | 'sessionsCount'
  | 'totalAmount'
  | 'paidAmount'
  | 'currency'
  | 'status'
  | 'periodFrom'
  | 'periodTo'
  | 'createdAt';
export type TutorPaymentsSortBy =
  | 'tutorName'
  | 'sessionsCount'
  | 'totalAmount'
  | 'currency'
  | 'periodFrom'
  | 'periodTo'
  | 'createdAt';

export interface FinancialTransactionDto {
  id: string;
  type: TransactionType;
  entityType: TransactionEntityType;
  amount: number;
  currency: CurrencyCode;
  createdById: string;
  learnerPaymentId?: string;
  tutorPaymentId?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface LearnerPaymentSummaryDto {
  id: string;
  learnerId: string;
  learnerName: string;
  billingType: LearnerBillingType;
  sessionsCount: number;
  periodFrom: ISODateString;
  periodTo: ISODateString;
  totalAmount: number;
  paidAmount: number;
  currency: CurrencyCode;
  status: PaymentStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  transactions: FinancialTransactionDto[];
}

export type QueryLearnerPaymentsDto = PaginationQueryType &
  DateRangeQueryType & {
    status?: PaymentStatus;
    currency?: CurrencyCode;
    sortBy?: LearnerPaymentsSortBy;
    sortOrder?: SortOrder;
  };

export type QueryLearnerPaymentsResponseDto = {
  data: LearnerPaymentSummaryDto[];
} & PaginationResponseMeta;

export interface CreateLearnerPaymentDto {
  learnerId: string;
  billingType: LearnerBillingType;
  sessionsCount: number;
  periodFrom: ISODateOnlyString;
  periodTo: ISODateOnlyString;
  totalAmount: number;
  currency: CurrencyCode;
  initialPaidAmount?: number;
}

export interface ApplyLearnerPaymentDto {
  amount: number;
  currency: CurrencyCode;
}

export interface TutorPaymentSummaryDto {
  id: string;
  tutorId: string;
  tutorName: string;
  periodFrom: ISODateString;
  periodTo: ISODateString;
  sessionsCount: number;
  totalAmount: number;
  currency: CurrencyCode;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  transactions: FinancialTransactionDto[];
}

export type QueryTutorPaymentsDto = PaginationQueryType &
  DateRangeQueryType & {
    tutorId?: string;
    currency?: CurrencyCode;
    sortBy?: TutorPaymentsSortBy;
    sortOrder?: SortOrder;
  };

export type QueryTutorPaymentsResponseDto = {
  data: TutorPaymentSummaryDto[];
} & PaginationResponseMeta;

export interface TutorLatestAllowedDateDto {
  tutorId: string;
  latestPaidTo?: ISODateOnlyString;
  nextAllowedFrom?: ISODateOnlyString;
}

export interface PreviewTutorPaymentDto {
  tutorId: string;
  periodFrom: ISODateOnlyString;
  periodTo: ISODateOnlyString;
}

export interface TutorPaymentBreakdown {
  currency: CurrencyCode;
  sessionsCount: number;
  totalAmount: number;
}

export interface TutorPaymentPreviewDto {
  tutorId: string;
  periodFrom: ISODateOnlyString;
  periodTo: ISODateOnlyString;
  breakdowns: TutorPaymentBreakdown[];
}

export interface CreateTutorPaymentDto {
  tutorId: string;
  periodFrom: ISODateOnlyString;
  periodTo: ISODateOnlyString;
}

// ─── Transaction Labels ────────────────────────────────────────────────────────

export interface TransactionLabelDto {
  id: string;
  name: string;
  createdAt: ISODateString;
}

export interface CreateTransactionLabelDto {
  name: string;
}

export type QueryTransactionLabelsDto = PaginationQueryType & {
  search?: string;
};

export type QueryTransactionLabelsResponseDto = {
  data: TransactionLabelDto[];
} & PaginationResponseMeta;

// ─── Manual / All Transactions ─────────────────────────────────────────────────

export type TransactionsSortBy = 'createdAt' | 'amount' | 'currency';

export interface FinancialTransactionSummaryDto {
  id: string;
  type: TransactionType;
  entityType: TransactionEntityType;
  amount: number;
  currency: CurrencyCode;
  labelId?: string;
  label?: TransactionLabelDto;
  notes?: string;
  learnerPaymentId?: string;
  tutorPaymentId?: string;
  createdById: string;
  createdByName: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateManualTransactionDto {
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  labelId?: string;
  newLabelName?: string;
  notes?: string;
}

export type QueryTransactionsDto = PaginationQueryType &
  DateRangeQueryType & {
    type?: TransactionType;
    entityType?: TransactionEntityType;
    currency?: CurrencyCode;
    labelId?: string;
    sortBy?: TransactionsSortBy;
    sortOrder?: SortOrder;
  };

export type QueryTransactionsResponseDto = {
  data: FinancialTransactionSummaryDto[];
} & PaginationResponseMeta;
