import { isSupportedTimezone } from '@halaqa/shared';
import { z } from 'zod';

export const timezoneMessage = 'يرجى اختيار منطقة زمنية صحيحة';

const baseTimezoneSchema = z.string().trim().refine(isSupportedTimezone, {
  message: timezoneMessage
});

export const timezoneSchema = baseTimezoneSchema;
export const optionalTimezoneSchema = baseTimezoneSchema.optional();
export const timezoneFieldSchema = z.object({
  timezone: timezoneSchema
});
export const optionalTimezoneFieldSchema = z.object({
  timezone: optionalTimezoneSchema
});
