import {
  DEFAULT_TIMEZONE,
  isSupportedTimezone,
} from '@halaqa/shared';
import { z } from 'zod';

export const timezoneMessage = 'يرجى اختيار منطقة زمنية صحيحة';

const baseTimezoneSchema = z.string().trim().refine(isSupportedTimezone, {
  message: timezoneMessage,
});

export const timezoneSchema = baseTimezoneSchema.default(DEFAULT_TIMEZONE);
export const optionalTimezoneSchema = baseTimezoneSchema.optional();
export const timezoneFieldSchema = z.object({
  timezone: timezoneSchema,
});
export const optionalTimezoneFieldSchema = z.object({
  timezone: optionalTimezoneSchema,
});
