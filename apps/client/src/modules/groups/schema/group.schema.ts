import { z, ZodType } from 'zod';
import {
  CreateGroupDto,
  GroupScheduleDay,
  GroupStatus,
  UpdateGroupDto,
  UpdateGroupSettingsDto
} from '@halaqa/shared';
import { timezoneFieldSchema } from '@/lib/validation/timezone.schema';
import {
  dayOfWeekSchema,
  descriptionSchema,
  nameSchema,
  tutorIdSchema
} from '@/lib/validation/fields.schema';

const groupStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'COMPLETED'
]) satisfies ZodType<GroupStatus>;

const groupScheduleDaySchema = z.object({
  dayOfWeek: dayOfWeekSchema,
  startMinutes: z.number().int().min(0).max(1439),
  durationMinutes: z.number().int().min(15).max(720)
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
  scheduleDays: z
    .array(groupScheduleDaySchema)
    .min(1, 'يجب اختيار يوم واحد على الأقل')
    .refine(uniqueScheduleDays, { message: 'لا يمكن تكرار نفس اليوم' })
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
      .min(1, 'يجب اختيار يوم واحد على الأقل')
      .refine(uniqueScheduleDays, { message: 'لا يمكن تكرار نفس اليوم' })
      .optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'قم بتعديل حقل واحد على الأقل'
  });

export const updateGroupSchema = z
  .intersection(
    updateGroupBaseSchema,
    z.object({
      timezone: z.string().trim().min(1).optional()
    })
  )
  .refine((value) => Object.keys(value).length > 0, {
    message: 'قم بتعديل حقل واحد على الأقل'
  }) satisfies ZodType<UpdateGroupDto>;

export const updateGroupSettingsSchema = z
  .object({
    status: groupStatusSchema.optional(),
    scheduleDays: z
      .array(groupScheduleDaySchema)
      .min(1, 'يجب اختيار يوم واحد على الأقل')
      .refine(uniqueScheduleDays, { message: 'لا يمكن تكرار نفس اليوم' })
      .optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'قم بتعديل حقل واحد على الأقل'
  }) satisfies ZodType<UpdateGroupSettingsDto>;
