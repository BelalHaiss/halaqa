import { GroupStatus } from '@halaqa/shared';
import { z, type ZodType } from 'zod';
import {
  dayOfWeekSchema,
  descriptionSchema,
  durationMinutesStringSchema,
  groupTimeSchema,
  nameSchema,
  tutorIdSchema,
} from '@/lib/validation/fields.schema';

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

export const groupFormSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  tutorId: tutorIdSchema,
  timezone: z.string().trim().min(1, 'المنطقة الزمنية مطلوبة'),
  status: groupStatusSchema,
  sameTimeForAllDays: z.boolean(),
  time: groupTimeSchema,
  dayTimes: z.array(groupTimeSchema).length(7),
  durationMinutes: durationMinutesStringSchema,
  selectedDays: z
    .array(dayOfWeekSchema)
    .min(1, 'يجب اختيار يوم واحد على الأقل')
    .refine((days) => new Set(days).size === days.length, 'لا يمكن تكرار نفس اليوم'),
}) satisfies ZodType<GroupFormValues>;
