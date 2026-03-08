import z, { ZodType } from 'zod';
import {
  AddLearnersToGroupDto,
  CreateGroupDto,
  GroupScheduleDay,
  GroupStatus,
  UpdateGroupDto,
  UpdateGroupSettingsDto,
} from '../group.types';
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

const groupStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'COMPLETED',
]) satisfies ZodType<GroupStatus>;

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
  return z.intersection(
    z.object({
      name: nameSchema(locale),
      description: descriptionSchema(locale).optional(),
      tutorId: tutorIdSchema(locale),
      status: groupStatusSchema.optional(),
      scheduleDays: z
        .array(groupScheduleDaySchema(locale))
        .min(1, m.scheduleDaysMin)
        .refine(uniqueScheduleDays, { message: m.scheduleDaysDuplicate }),
    }),
    timezoneFieldSchema(locale)
  ) satisfies ZodType<CreateGroupDto>;
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
        })
        .refine((value) => Object.keys(value).length > 0, { message: m.atLeastOneField }),
      z.object({ timezone: z.string().trim().min(1).optional() })
    )
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
