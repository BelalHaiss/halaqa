import { z } from 'zod';

// ============================================================================
// DTOs (Public Types)
// ============================================================================

export type AttendanceStatus = 'ATTENDED' | 'MISSED' | 'EXCUSED';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  userId: string;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceRecordDto {
  sessionId: string;
  userId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface UpdateAttendanceRecordDto {
  id: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface BulkAttendanceDto {
  sessionId: string;
  records: CreateAttendanceRecordDto[];
}

export interface AttendanceFilterDto {
  sessionId?: string;
  userId?: string;
  status?: AttendanceStatus;
}

// ============================================================================
// Zod Schemas
// ============================================================================

export const AttendanceStatusSchema = z.enum([
  'ATTENDED',
  'MISSED',
  'EXCUSED'
]) satisfies z.ZodType<AttendanceStatus>;

export const AttendanceRecordSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  userId: z.string(),
  status: AttendanceStatusSchema,
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}) satisfies z.ZodType<AttendanceRecord>;

export const CreateAttendanceRecordSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  status: AttendanceStatusSchema,
  notes: z.string().optional()
}) satisfies z.ZodType<CreateAttendanceRecordDto>;

export const UpdateAttendanceRecordSchema = z.object({
  id: z.string().uuid(),
  status: AttendanceStatusSchema,
  notes: z.string().optional()
}) satisfies z.ZodType<UpdateAttendanceRecordDto>;

export const BulkAttendanceSchema = z.object({
  sessionId: z.string().uuid('معرف الجلسة غير صحيح'),
  records: z
    .array(CreateAttendanceRecordSchema)
    .min(1, 'يجب إضافة سجل حضور واحد على الأقل')
}) satisfies z.ZodType<BulkAttendanceDto>;

export const AttendanceFilterSchema = z.object({
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  status: AttendanceStatusSchema.optional()
}) satisfies z.ZodType<AttendanceFilterDto>;
