import z, { ZodType } from 'zod';
import { CurrencyAmountDto, CurrencyCode } from '../currency.types';
import { CURRENCY_AMOUNT_MAX, CURRENCY_AMOUNT_MIN, SUPPORTED_CURRENCIES } from './fields.constants';
import { getMessages, ValidationLocale } from './messages';

export const currencyCodeSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z.custom<CurrencyCode>(
    (value) => typeof value === 'string' && SUPPORTED_CURRENCIES.includes(value as CurrencyCode),
    { message: m.invalidCurrency }
  );
};

export const currencyAmountSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z.object({
    amount: z
      .number()
      .min(CURRENCY_AMOUNT_MIN, m.amountTooSmall)
      .max(CURRENCY_AMOUNT_MAX, m.amountTooLarge),
    currency: currencyCodeSchema(locale),
  }) satisfies ZodType<CurrencyAmountDto>;
};
