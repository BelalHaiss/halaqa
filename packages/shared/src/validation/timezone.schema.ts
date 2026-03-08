import z from 'zod';
import { isSupportedTimezone } from '../utils/timezones.util';
import { getMessages, ValidationLocale } from './messages';

const baseTimezone = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z.string().trim().refine(isSupportedTimezone, { message: m.invalidTimezone });
};

export const timezoneSchema = (locale: ValidationLocale = 'ar') => baseTimezone(locale);

export const optionalTimezoneSchema = (locale: ValidationLocale = 'ar') =>
  baseTimezone(locale).optional();

export const timezoneFieldSchema = (locale: ValidationLocale = 'ar') =>
  z.object({ timezone: timezoneSchema(locale) });

export const optionalTimezoneFieldSchema = (locale: ValidationLocale = 'ar') =>
  z.object({ timezone: optionalTimezoneSchema(locale) });
