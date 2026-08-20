import {
  ISODateOnlyString,
  ISODateString,
  PaginationQueryType,
  PaginationResponseMeta,
  DateRangeQueryType,
} from './types/api.types';
import { CurrencyCode } from './currency.types';

export type PaymentStatus = 'UNPAID' | 'PAID';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionEntityType = 'LEARNER_PAYMENT' | 'MANUAL';
export type SortOrder = 'asc' | 'desc';
export type LearnerPaymentsSortBy =
  | 'learnerName'
  | 'groupName'
  | 'totalAmount'
  | 'currency'
  | 'status'
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
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface LearnerPaymentSummaryDto {
  id: string;
  learnerId: string;
  learnerName: string;
  groupId: string;
  groupName: string;
  periodFrom: ISODateString;
  periodTo: ISODateString;
  totalAmount: number;
  currency: CurrencyCode;
  status: PaymentStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  transactions: FinancialTransactionDto[];
}

export type QueryLearnerPaymentsDto = PaginationQueryType &
  DateRangeQueryType & {
    learnerId?: string;
    groupId?: string;
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
  groupId: string;
  periodFrom: ISODateOnlyString;
  periodTo: ISODateOnlyString;
  totalAmount: number;
  currency: CurrencyCode;
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
