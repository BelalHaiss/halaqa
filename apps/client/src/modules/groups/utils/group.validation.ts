import { GroupStatus } from '@halaqa/shared';
import { z, type ZodType } from 'zod';
import {
  GROUP_DURATION_MINUTES_MAX,
  GROUP_DURATION_MINUTES_MIN,
  TIME_HHMM_FORMAT_REGEX,
} from '@halaqa/shared';
import { dayOfWeekSchema, descriptionSchema, nameSchema, tutorIdSchema } from '@halaqa/shared';

export type GroupFormValues = {
  name: string;
  description: string;
  tutorId: string;
  timezone: string;
  status: GroupStatus;
  sameTimeForAllDays: boolean;
  time: string;
  dayTimes: string[];
  durationMinutes: string;
  selectedDays: number[];
};

const groupStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'COMPLETED',
]) satisfies ZodType<GroupStatus>;

const groupTimeSchema = z.string().trim().regex(TIME_HHMM_FORMAT_REGEX, 'تنسيق الوقت غير صحيح');

const durationMinutesStringSchema = z
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

export const groupFormSchema = z.object({
  name: nameSchema(),
  description: descriptionSchema(),
  tutorId: tutorIdSchema(),
  timezone: z.string().trim().min(1, 'المنطقة الزمنية مطلوبة'),
  status: groupStatusSchema,
  sameTimeForAllDays: z.boolean(),
  time: groupTimeSchema,
  dayTimes: z.array(groupTimeSchema).length(7),
  durationMinutes: durationMinutesStringSchema,
  selectedDays: z
    .array(dayOfWeekSchema())
    .min(1, 'يجب اختيار يوم واحد على الأقل')
    .refine((days) => new Set(days).size === days.length, 'لا يمكن تكرار نفس اليوم'),
}) satisfies ZodType<GroupFormValues>;
