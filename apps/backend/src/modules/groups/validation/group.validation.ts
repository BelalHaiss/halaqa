import {
  AddLearnersToGroupDto,
  CreateLearnerDto,
  CreateGroupDto,
  GroupScheduleDay,
  GroupStatus,
  UpdateGroupDto,
  UpdateGroupSettingsDto,
} from '@halaqa/shared';
import z, { ZodType } from 'zod';
import {
  dayOfWeekSchema,
  descriptionSchema,
  durationMinutesSchema,
  nameSchema,
  nonEmptyIdSchema,
  notesSchema,
  timeMinutesSchema,
  tutorIdSchema,
} from 'src/utils/validation/fields.schema';
import { timezoneFieldSchema } from 'src/utils/validation/timezone.schema';

const groupStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'COMPLETED',
]) satisfies ZodType<GroupStatus>;

const groupScheduleDaySchema = z.object({
  dayOfWeek: dayOfWeekSchema,
  startMinutes: timeMinutesSchema,
  durationMinutes: durationMinutesSchema,
}) satisfies ZodType<GroupScheduleDay>;

const uniqueScheduleDays = (value: GroupScheduleDay[]) => {
  const days = new Set(value.map((schedule) => schedule.dayOfWeek));
  return days.size === value.length;
};

const createGroupBaseSchema = z.object({
  name: nameSchema,
  description: descriptionSchema.optional(),
  tutorId: tutorIdSchema,
  status: groupStatusSchema.optional(),
  scheduleDays: z.array(groupScheduleDaySchema).min(1).refine(uniqueScheduleDays, {
    message: 'Schedule days must be unique',
  }),
});

export const createGroupSchema = z.intersection(
  createGroupBaseSchema,
  timezoneFieldSchema
) satisfies ZodType<CreateGroupDto>;

const updateGroupBaseSchema = z
  .object({
    name: nameSchema.optional(),
    description: descriptionSchema.optional(),
    tutorId: tutorIdSchema.optional(),
    status: groupStatusSchema.optional(),
    scheduleDays: z
      .array(groupScheduleDaySchema)
      .min(1)
      .refine(uniqueScheduleDays, {
        message: 'Schedule days must be unique',
      })
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const updateGroupSchema = z
  .intersection(
    updateGroupBaseSchema,
    z.object({
      timezone: z.string().trim().min(1).optional(),
    })
  )
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  }) satisfies ZodType<UpdateGroupDto>;

export const updateGroupSettingsSchema = z
  .object({
    status: groupStatusSchema.optional(),
    scheduleDays: z
      .array(groupScheduleDaySchema)
      .min(1)
      .refine(uniqueScheduleDays, {
        message: 'Schedule days must be unique',
      })
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  }) satisfies ZodType<UpdateGroupSettingsDto>;

const createLearnerBaseSchema = z.object({
  name: nameSchema,
  contact: z
    .object({
      notes: notesSchema.optional(),
    })
    .optional(),
});

export const createLearnerForGroupSchema = z.intersection(
  createLearnerBaseSchema,
  timezoneFieldSchema
) satisfies ZodType<CreateLearnerDto>;

export const addLearnersToGroupSchema = z.object({
  learnerIds: z.array(nonEmptyIdSchema).min(1),
}) satisfies ZodType<AddLearnersToGroupDto>;
