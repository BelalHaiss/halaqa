import { GroupBillingType, GroupStatus } from '@halaqa/shared';
import { z, type ZodType } from 'zod';
import {
  GROUP_DURATION_MINUTES_MAX,
  GROUP_DURATION_MINUTES_MIN,
  TIME_HHMM_FORMAT_REGEX,
  SUPPORTED_CURRENCIES,
} from '@halaqa/shared';
import { dayOfWeekSchema, descriptionSchema, nameSchema, tutorIdSchema } from '@halaqa/shared';

export type GroupFormValues = {
  name: string;
  description: string;
  tutorId: string;
  timezone: string;
  status: GroupStatus;
  billingType: GroupBillingType;
  monthlyPrice?: number;
  currency: string;
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

const groupBillingTypeSchema = z.enum(['FREE', 'MONTHLY']) satisfies ZodType<GroupBillingType>;

export const groupFormSchema = z
  .object({
    name: nameSchema(),
    description: descriptionSchema(),
    tutorId: tutorIdSchema(),
    timezone: z.string().trim().min(1, 'المنطقة الزمنية مطلوبة'),
    status: groupStatusSchema,
    billingType: groupBillingTypeSchema,
    monthlyPrice: z.number().optional(),
    currency: z.string().trim(),
    sameTimeForAllDays: z.boolean(),
    time: groupTimeSchema,
    dayTimes: z.array(groupTimeSchema).length(7),
    durationMinutes: durationMinutesStringSchema,
    selectedDays: z
      .array(dayOfWeekSchema())
      .min(1, 'يجب اختيار يوم واحد على الأقل')
      .refine((days) => new Set(days).size === days.length, 'لا يمكن تكرار نفس اليوم'),
  })
  .superRefine((data, ctx) => {
    if (data.billingType === 'MONTHLY') {
      if (data.monthlyPrice === undefined || data.monthlyPrice <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['monthlyPrice'],
          message: 'السعر الشهري مطلوب ويجب أن يكون أكبر من الصفر',
        });
      }
      if (
        !data.currency ||
        !SUPPORTED_CURRENCIES.includes(data.currency as (typeof SUPPORTED_CURRENCIES)[number])
      ) {
        ctx.addIssue({ code: 'custom', path: ['currency'], message: 'اختر عملة الاشتراك الشهري' });
      }
    }
  }) satisfies ZodType<GroupFormValues>;
