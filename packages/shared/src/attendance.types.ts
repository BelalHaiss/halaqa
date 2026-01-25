import { z } from 'zod';

export const AttendanceStatusSchema = z.enum([
  'attended',
  'missed',
  'late',
  'excused'
]);
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

export const AttendanceRecordSchema = z.object({
  id: z.string().optional(),
  studentId: z.string(),
  sessionId: z.string(),
  status: AttendanceStatusSchema,
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;

export const CreateAttendanceRecordSchema = z.object({
  studentId: z.string(),
  sessionId: z.string(),
  status: AttendanceStatusSchema,
  notes: z.string().optional()
});

export type CreateAttendanceRecord = z.infer<
  typeof CreateAttendanceRecordSchema
>;

export const UpdateAttendanceRecordSchema = z.object({
  id: z.string(),
  status: AttendanceStatusSchema,
  notes: z.string().optional()
});

export type UpdateAttendanceRecord = z.infer<
  typeof UpdateAttendanceRecordSchema
>;

export const BulkAttendanceSchema = z.object({
  sessionId: z.string(),
  records: z.array(CreateAttendanceRecordSchema)
});

export type BulkAttendance = z.infer<typeof BulkAttendanceSchema>;
