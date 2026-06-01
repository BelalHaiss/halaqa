import { CurrencyCode } from '../currency.types';
import { PaymentStatus, TransactionEntityType, TransactionType } from '../payment.types';

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: 'غير مدفوع',
  PARTIAL: 'مدفوع جزئيا',
  PAID: 'مدفوع',
};

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: 'إيراد',
  EXPENSE: 'مصروف',
};

const TRANSACTION_ENTITY_TYPE_LABELS: Record<TransactionEntityType, string> = {
  LEARNER_PAYMENT: 'دفعة متعلم',
  TUTOR_PAYMENT: 'مستحق معلم',
  MANUAL: 'يدوي',
};

const CURRENCY_LABELS: Partial<Record<CurrencyCode, string>> = {
  USD: 'دول',
  EUR: 'يور',
  GBP: 'ستر',
  JPY: 'ين',
  CNY: 'يون',
  INR: 'روب',
  CAD: 'كند',
  AUD: 'أست',
  CHF: 'فرن',
  TRY: 'ترك',
  SAR: 'رس',
  AED: 'در',
  EGP: 'جم',
  KWD: 'دك',
  QAR: 'رق',
};

export function getPaymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status];
}

export function getTransactionTypeLabel(type: TransactionType): string {
  return TRANSACTION_TYPE_LABELS[type];
}

export function getTransactionEntityTypeLabel(entityType: TransactionEntityType): string {
  return TRANSACTION_ENTITY_TYPE_LABELS[entityType];
}

export function getCurrencyLabel(currency: CurrencyCode): string {
  return CURRENCY_LABELS[currency] ?? currency;
}
