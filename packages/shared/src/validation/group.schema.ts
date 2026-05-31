import z, { ZodType } from 'zod';
import {
  AddLearnersToGroupDto,
  CreateGroupDto,
  CreateLearnersDto,
  GroupBillingType,
  GroupScheduleDay,
  GroupStatus,
  UpdateGroupDto,
  UpdateGroupSettingsDto,
} from '../group.types';
import { createLearnerSchema } from './learner.schema';
import { getMessages, ValidationLocale } from './messages';
import {
  dayOfWeekSchema,
  descriptionSchema,
  durationMinutesSchema,
  nameSchema,
  nonEmptyIdSchema,
  timeMinutesSchema,
  tutorIdSchema,
} from './fields.schema';
import { timezoneFieldSchema } from './timezone.schema';
import { currencyCodeSchema } from './currency.schema';

const groupStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'COMPLETED',
]) satisfies ZodType<GroupStatus>;

const groupBillingTypeSchema = z.enum([
  'FREE',
  'SESSION_COUNT_MONTHLY',
]) satisfies ZodType<GroupBillingType>;

const groupScheduleDaySchema = (locale: ValidationLocale = 'ar') =>
  z.object({
    dayOfWeek: dayOfWeekSchema(locale),
    startMinutes: timeMinutesSchema(locale),
    durationMinutes: durationMinutesSchema(locale),
  }) satisfies ZodType<GroupScheduleDay>;

const uniqueScheduleDays = (value: GroupScheduleDay[]) => {
  const days = new Set(value.map((s) => s.dayOfWeek));
  return days.size === value.length;
};

export const createGroupSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .intersection(
      z.object({
        name: nameSchema(locale),
        description: descriptionSchema(locale).optional(),
        tutorId: tutorIdSchema(locale),
        status: groupStatusSchema.optional(),
        scheduleDays: z
          .array(groupScheduleDaySchema(locale))
          .min(1, m.scheduleDaysMin)
          .refine(uniqueScheduleDays, { message: m.scheduleDaysDuplicate }),
        billingType: groupBillingTypeSchema.optional(),
        tutorHourlyRate: z.number().positive(m.hourlyRateTooSmall).optional(),
        tutorCurrency: currencyCodeSchema(locale).optional(),
      }),
      timezoneFieldSchema(locale)
    )
    .superRefine((data, ctx) => {
      if (data.billingType === 'SESSION_COUNT_MONTHLY') {
        if (data.tutorHourlyRate == null) {
          ctx.addIssue({
            code: 'custom',
            path: ['tutorHourlyRate'],
            message: m.hourlyRateRequired,
          });
        }
        if (!data.tutorCurrency) {
          ctx.addIssue({
            code: 'custom',
            path: ['tutorCurrency'],
            message: m.billingCurrencyRequired,
          });
        }
      }
    }) satisfies ZodType<CreateGroupDto>;
};

export const updateGroupSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .intersection(
      z
        .object({
          name: nameSchema(locale).optional(),
          description: descriptionSchema(locale).optional(),
          tutorId: tutorIdSchema(locale).optional(),
          status: groupStatusSchema.optional(),
          scheduleDays: z
            .array(groupScheduleDaySchema(locale))
            .min(1, m.scheduleDaysMin)
            .refine(uniqueScheduleDays, { message: m.scheduleDaysDuplicate })
            .optional(),
          billingType: groupBillingTypeSchema.optional(),
          tutorHourlyRate: z.number().positive(m.hourlyRateTooSmall).nullish(),
          tutorCurrency: currencyCodeSchema(locale).nullish(),
        })
        .refine((value) => Object.keys(value).length > 0, { message: m.atLeastOneField }),
      z.object({ timezone: z.string().trim().min(1).optional() })
    )
    .superRefine((data, ctx) => {
      if (data.billingType === 'SESSION_COUNT_MONTHLY') {
        if (data.tutorHourlyRate == null) {
          ctx.addIssue({
            code: 'custom',
            path: ['tutorHourlyRate'],
            message: m.hourlyRateRequired,
          });
        }
        if (!data.tutorCurrency) {
          ctx.addIssue({
            code: 'custom',
            path: ['tutorCurrency'],
            message: m.billingCurrencyRequired,
          });
        }
      }
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: m.atLeastOneField,
    }) satisfies ZodType<UpdateGroupDto>;
};

export const updateGroupSettingsSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .object({
      status: groupStatusSchema.optional(),
      scheduleDays: z
        .array(groupScheduleDaySchema(locale))
        .min(1, m.scheduleDaysMin)
        .refine(uniqueScheduleDays, { message: m.scheduleDaysDuplicate })
        .optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: m.atLeastOneField,
    }) satisfies ZodType<UpdateGroupSettingsDto>;
};

export const addLearnersToGroupSchema = (locale: ValidationLocale = 'ar') =>
  z.object({
    learnerIds: z.array(nonEmptyIdSchema(locale)).min(1),
  }) satisfies ZodType<AddLearnersToGroupDto>;

export const createLearnersSchema = (locale: ValidationLocale = 'ar') =>
  z.object({
    learners: z.array(createLearnerSchema(locale)).min(1),
  }) satisfies ZodType<CreateLearnersDto>;
