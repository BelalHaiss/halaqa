import { z } from 'zod';

// ============================================================================
// DTOs (Public Types)
// ============================================================================

export type GroupStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED';

export interface ScheduleDay {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  time: string; // HH:mm format
  durationMinutes: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  tutorId: string;
  status: GroupStatus;
  scheduleDays: ScheduleDay[];
  students: string[]; // user IDs with STUDENT role
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
  tutorId: string;
  status?: GroupStatus;
  scheduleDays: ScheduleDay[];
}

export interface UpdateGroupDto {
  id: string;
  name?: string;
  description?: string;
  tutorId?: string;
  status?: GroupStatus;
  scheduleDays?: ScheduleDay[];
}

export interface AddStudentToGroupDto {
  groupId: string;
  userId: string;
}

export interface RemoveStudentFromGroupDto {
  groupId: string;
  userId: string;
}

export interface GroupFilterDto {
  status?: GroupStatus;
  tutorId?: string;
  search?: string;
}

// ============================================================================
// Zod Schemas
// ============================================================================

export const GroupStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'COMPLETED'
]) satisfies z.ZodType<GroupStatus>;

export const ScheduleDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'صيغة الوقت غير صحيحة'),
  durationMinutes: z.number().int().positive().min(15).max(480)
}) satisfies z.ZodType<ScheduleDay>;

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  tutorId: z.string(),
  status: GroupStatusSchema,
  scheduleDays: z.array(ScheduleDaySchema),
  students: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}) satisfies z.ZodType<Group>;

export const CreateGroupSchema = z.object({
  name: z.string().min(2, 'اسم الحلقة يجب أن يكون حرفين على الأقل').max(100),
  description: z.string().max(500).optional(),
  tutorId: z.string(),
  status: GroupStatusSchema.optional(),
  scheduleDays: z
    .array(ScheduleDaySchema)
    .min(1, 'يجب إضافة يوم واحد على الأقل')
}) satisfies z.ZodType<CreateGroupDto>;

export const UpdateGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  tutorId: z.string().optional(),
  status: GroupStatusSchema.optional(),
  scheduleDays: z.array(ScheduleDaySchema).optional()
}) satisfies z.ZodType<UpdateGroupDto>;

export const AddStudentToGroupSchema = z.object({
  groupId: z.string(),
  userId: z.string()
}) satisfies z.ZodType<AddStudentToGroupDto>;

export const RemoveStudentFromGroupSchema = z.object({
  groupId: z.string(),
  userId: z.string()
}) satisfies z.ZodType<RemoveStudentFromGroupDto>;

export const GroupFilterSchema = z.object({
  status: GroupStatusSchema.optional(),
  tutorId: z.string().optional(),
  search: z.string().optional()
}) satisfies z.ZodType<GroupFilterDto>;
