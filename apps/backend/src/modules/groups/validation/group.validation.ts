import {
  CreateLearnerDto,
  CreateGroupDto,
  GroupScheduleDay,
  GroupStatus,
  UpdateGroupDto,
  UpdateGroupSettingsDto,
} from '@halaqa/shared';
import z, { ZodType } from 'zod';
import { timezoneFieldSchema } from 'src/utils/validation/timezone.schema';

const groupStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'COMPLETED',
]) satisfies ZodType<GroupStatus>;

const groupScheduleDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startMinutes: z.number().int().min(0).max(1439),
  durationMinutes: z.number().int().min(15).max(720),
}) satisfies ZodType<GroupScheduleDay>;

const uniqueScheduleDays = (value: GroupScheduleDay[]) => {
  const days = new Set(value.map((schedule) => schedule.dayOfWeek));
  return days.size === value.length;
};

const createGroupBaseSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(1).max(500).optional(),
  tutorId: z.string().trim().min(1),
  status: groupStatusSchema.optional(),
  scheduleDays: z
    .array(groupScheduleDaySchema)
    .min(1)
    .refine(uniqueScheduleDays, {
      message: 'Schedule days must be unique',
    }),
});

export const createGroupSchema = z.intersection(
  createGroupBaseSchema,
  timezoneFieldSchema,
) satisfies ZodType<CreateGroupDto>;

const updateGroupBaseSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().min(1).max(500).optional(),
    tutorId: z.string().trim().min(1).optional(),
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
    }),
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
  name: z.string().trim().min(2).max(100),
  contact: z
    .object({
      notes: z.string().trim().max(2000).optional(),
    })
    .optional(),
});

export const createLearnerForGroupSchema = z.intersection(
  createLearnerBaseSchema,
  timezoneFieldSchema,
) satisfies ZodType<CreateLearnerDto>;
