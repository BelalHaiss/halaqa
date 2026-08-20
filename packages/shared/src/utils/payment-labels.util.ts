import { CurrencyCode } from '../currency.types';
import { PaymentStatus, TransactionEntityType, TransactionType } from '../payment.types';

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: 'غير مدفوع',
  PAID: 'مدفوع',
};

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: 'إيراد',
  EXPENSE: 'مصروف',
};

const TRANSACTION_ENTITY_TYPE_LABELS: Record<TransactionEntityType, string> = {
  LEARNER_PAYMENT: 'دفعة متعلم',
  MANUAL: 'يدوي',
};

const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  EGP: 'ج.م',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  TRY: '₺',
  SAR: 'ر.س',
  AED: 'د.إ',
  KWD: 'د.ك',
  QAR: 'ر.ق',
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
