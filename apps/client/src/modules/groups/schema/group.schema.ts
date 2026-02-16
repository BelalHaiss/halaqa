import { z, ZodType } from 'zod';
import {
  CreateGroupDto,
  GroupScheduleDay,
  GroupStatus,
  UpdateGroupDto,
  UpdateGroupSettingsDto
} from '@halaqa/shared';
import { timezoneFieldSchema } from '@/lib/validation/timezone.schema';

const groupStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'COMPLETED'
]) satisfies ZodType<GroupStatus>;

const groupScheduleDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startMinutes: z.number().int().min(0).max(1439),
  durationMinutes: z.number().int().min(15).max(720)
}) satisfies ZodType<GroupScheduleDay>;

const uniqueScheduleDays = (value: GroupScheduleDay[]) => {
  const days = new Set(value.map((schedule) => schedule.dayOfWeek));
  return days.size === value.length;
};

const createGroupBaseSchema = z.object({
  name: z.string().trim().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  description: z.string().trim().max(500).optional(),
  tutorId: z.string().trim().min(1, 'اختر المعلم'),
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
    name: z
      .string()
      .trim()
      .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
      .max(100)
      .optional(),
    description: z.string().trim().max(500).optional(),
    tutorId: z.string().trim().min(1, 'اختر المعلم').optional(),
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

export type CreateGroupFormValues = z.infer<typeof createGroupSchema>;
export type UpdateGroupFormValues = z.infer<typeof updateGroupSchema>;
export type UpdateGroupSettingsFormValues = z.infer<
  typeof updateGroupSettingsSchema
>;
