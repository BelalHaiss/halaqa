import { z } from 'zod';

export const ScheduleSchema = z.object({
  days: z.array(z.number().min(0).max(6)), // 0 = Sunday, 6 = Saturday
  time: z.string(), // HH:mm format
  duration: z.number().positive() // in minutes
});

export type Schedule = z.infer<typeof ScheduleSchema>;

export const GroupStatusSchema = z.enum(['active', 'inactive', 'suspended', 'completed']);
export type GroupStatus = z.infer<typeof GroupStatusSchema>;

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  tutorId: z.string(),
  schedule: ScheduleSchema,
  students: z.array(z.string()), // student IDs
  status: GroupStatusSchema.default('active'),
  description: z.string().optional(),
  createdAt: z.string().optional()
});

export type Group = z.infer<typeof GroupSchema>;

export const CreateGroupSchema = z.object({
  name: z.string().min(2, 'اسم الحلقة يجب أن يكون حرفين على الأقل'),
  tutorId: z.string(),
  schedule: ScheduleSchema,
  status: GroupStatusSchema.default('active'),
  description: z.string().optional()
});

export type CreateGroup = z.infer<typeof CreateGroupSchema>;

export const UpdateGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  tutorId: z.string(),
  schedule: ScheduleSchema,
  students: z.array(z.string()),
  status: GroupStatusSchema,
  description: z.string().optional()
});

export type UpdateGroup = z.infer<typeof UpdateGroupSchema>;
