import {
  ATTENDANCE_NOTES_MAX_LENGTH,
  DATE_ONLY_FORMAT_REGEX,
  DAY_OF_WEEK_MAX,
  DAY_OF_WEEK_MIN,
  DESCRIPTION_MAX_LENGTH,
  GROUP_DURATION_MINUTES_MAX,
  GROUP_DURATION_MINUTES_MIN,
  ISODateOnlyString,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NON_EMPTY_MIN_LENGTH,
  NOTES_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  TIME_MINUTES_MAX,
  TIME_MINUTES_MIN,
  TimeMinutes,
  USERNAME_ACCOUNT_REGEX,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '@halaqa/shared';
import z from 'zod';

export const nameSchema = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH)
  .max(NAME_MAX_LENGTH);

export const usernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN_LENGTH)
  .max(USERNAME_MAX_LENGTH);

export const usernameAccountSchema = usernameSchema.regex(
  USERNAME_ACCOUNT_REGEX,
  'Username can only contain letters, numbers, and _',
);

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH);

export const notesSchema = z.string().trim().max(NOTES_MAX_LENGTH);

export const attendanceNotesSchema = z
  .string()
  .trim()
  .max(ATTENDANCE_NOTES_MAX_LENGTH);

export const descriptionSchema = z.string().trim().max(DESCRIPTION_MAX_LENGTH);

export const nonEmptyIdSchema = z.string().trim().min(NON_EMPTY_MIN_LENGTH);

export const tutorIdSchema = nonEmptyIdSchema;

export const dayOfWeekSchema = z
  .number()
  .int()
  .min(DAY_OF_WEEK_MIN)
  .max(DAY_OF_WEEK_MAX);

export const durationMinutesSchema = z
  .number()
  .int()
  .min(GROUP_DURATION_MINUTES_MIN)
  .max(GROUP_DURATION_MINUTES_MAX);

export const isoDateOnlySchema = z
  .string()
  .regex(DATE_ONLY_FORMAT_REGEX)
  .transform((value) => value as ISODateOnlyString);

export const optionalIsoDateOnlySchema = isoDateOnlySchema.optional();

export const timeMinutesSchema = z
  .number()
  .int()
  .min(TIME_MINUTES_MIN)
  .max(TIME_MINUTES_MAX)
  .transform((value) => value as TimeMinutes);
