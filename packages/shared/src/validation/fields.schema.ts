import z from 'zod';
import { DATE_ONLY_FORMAT_REGEX } from '../utils/date.constants';
import { ISODateOnlyString, TimeMinutes } from '../types/api.types';
import {
  ATTENDANCE_NOTES_MAX_LENGTH,
  DAY_OF_WEEK_MAX,
  DAY_OF_WEEK_MIN,
  DESCRIPTION_MAX_LENGTH,
  GROUP_DURATION_MINUTES_MAX,
  GROUP_DURATION_MINUTES_MIN,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NON_EMPTY_MIN_LENGTH,
  NOTES_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  TIME_MINUTES_MAX,
  TIME_MINUTES_MIN,
  USERNAME_ACCOUNT_REGEX,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from './fields.constants';
import { getMessages, ValidationLocale } from './messages';

export const nameSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z.string().trim().min(NAME_MIN_LENGTH, m.nameTooShort).max(NAME_MAX_LENGTH, m.nameTooLong);
};

export const usernameSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .string()
    .trim()
    .min(USERNAME_MIN_LENGTH, m.usernameTooShort)
    .max(USERNAME_MAX_LENGTH, m.usernameTooLong);
};

export const usernameAccountSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return usernameSchema(locale).regex(USERNAME_ACCOUNT_REGEX, m.usernameInvalidChars);
};

export const passwordSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .string()
    .min(PASSWORD_MIN_LENGTH, m.passwordTooShort)
    .max(PASSWORD_MAX_LENGTH, m.passwordTooLong);
};

export const notesSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z.string().trim().max(NOTES_MAX_LENGTH, m.notesTooLong);
};

export const attendanceNotesSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z.string().trim().max(ATTENDANCE_NOTES_MAX_LENGTH, m.attendanceNotesTooLong);
};

export const descriptionSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z.string().trim().max(DESCRIPTION_MAX_LENGTH, m.descriptionTooLong);
};

export const nonEmptyIdSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z.string().trim().min(NON_EMPTY_MIN_LENGTH, m.idRequired);
};

export const tutorIdSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z.string().trim().min(NON_EMPTY_MIN_LENGTH, m.tutorRequired);
};

export const dayOfWeekSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .number()
    .int()
    .min(DAY_OF_WEEK_MIN, m.dayOfWeekInvalid)
    .max(DAY_OF_WEEK_MAX, m.dayOfWeekInvalid);
};

export const durationMinutesSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .number()
    .int()
    .min(GROUP_DURATION_MINUTES_MIN, m.durationMinutesInvalid)
    .max(GROUP_DURATION_MINUTES_MAX, m.durationMinutesInvalid);
};

export const isoDateOnlySchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .string()
    .regex(DATE_ONLY_FORMAT_REGEX, m.invalidDate)
    .transform((v) => v as ISODateOnlyString);
};

export const optionalIsoDateOnlySchema = (locale: ValidationLocale = 'ar') =>
  isoDateOnlySchema(locale).optional();

export const timeMinutesSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z.custom<TimeMinutes>(
    (v) =>
      typeof v === 'number' &&
      Number.isInteger(v) &&
      v >= TIME_MINUTES_MIN &&
      v <= TIME_MINUTES_MAX,
    { message: m.invalidTime }
  );
};
