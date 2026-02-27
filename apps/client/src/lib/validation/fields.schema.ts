import {
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
  TIME_HHMM_FORMAT_REGEX,
  TIME_MINUTES_MAX,
  TIME_MINUTES_MIN,
  TimeMinutes,
  USERNAME_ACCOUNT_REGEX,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH
} from '@halaqa/shared';
import { z } from 'zod';

export const nameSchema = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH, 'الاسم يجب أن يكون حرفين على الأقل')
  .max(NAME_MAX_LENGTH, 'الاسم طويل جدًا');

export const usernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN_LENGTH, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
  .max(USERNAME_MAX_LENGTH, 'اسم المستخدم طويل جدًا');

export const usernameAccountSchema = usernameSchema.regex(
  USERNAME_ACCOUNT_REGEX,
  'يسمح فقط بالحروف الانجليزية والأرقام و _'
);

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .max(PASSWORD_MAX_LENGTH, 'كلمة المرور طويلة جدًا');

export const notesSchema = z
  .string()
  .trim()
  .max(NOTES_MAX_LENGTH, 'الملاحظات طويلة جدًا');

export const descriptionSchema = z.string().trim().max(DESCRIPTION_MAX_LENGTH);

export const tutorIdSchema = z.string().trim().min(1, 'اختر المعلم');

export const groupTimeSchema = z
  .string()
  .trim()
  .regex(TIME_HHMM_FORMAT_REGEX, 'تنسيق الوقت غير صحيح');

export const durationMinutesStringSchema = z
  .string()
  .trim()
  .refine((value) => {
    const minutes = Number(value);
    return (
      Number.isFinite(minutes) &&
      minutes >= GROUP_DURATION_MINUTES_MIN &&
      minutes <= GROUP_DURATION_MINUTES_MAX
    );
  }, 'المدة يجب أن تكون بين 15 و 720 دقيقة');

export const dayOfWeekSchema = z
  .number()
  .int()
  .min(DAY_OF_WEEK_MIN)
  .max(DAY_OF_WEEK_MAX);

export const timeMinutesSchema = z.custom<TimeMinutes>(
  (value) =>
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= TIME_MINUTES_MIN &&
    value <= TIME_MINUTES_MAX,
  { message: 'الوقت مطلوب' }
);

export const isoDateOnlySchema = z
  .string()
  .regex(DATE_ONLY_FORMAT_REGEX, 'تنسيق التاريخ غير صحيح')
  .transform((value) => value as ISODateOnlyString);

export const nonEmptyIdSchema = z
  .string()
  .trim()
  .min(NON_EMPTY_MIN_LENGTH, 'المعرّف مطلوب');
