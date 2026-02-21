import { z } from 'zod';
import type {
  UpdateSessionActionDTO,
  SessionAttendanceUpdateDTO,
  AttendanceStatus,
  ISODateOnlyString,
  TimeMinutes
} from '@halaqa/shared';

const attendanceStatusSchema = z.enum([
  'ATTENDED',
  'MISSED',
  'EXCUSED'
] satisfies [AttendanceStatus, ...AttendanceStatus[]]);

const sessionAttendanceSchema = z.object({
  studentId: z.string().min(1, 'معرف الطالب مطلوب'),
  status: attendanceStatusSchema,
  notes: z.string().optional()
}) satisfies z.ZodType<SessionAttendanceUpdateDTO>;

const attendanceEditItemSchema = z.object({
  studentId: z.string().min(1, 'معرف الطالب مطلوب'),
  studentName: z.string().min(1, 'اسم الطالب مطلوب'),
  status: attendanceStatusSchema.nullable(),
  notes: z.string().optional()
});

export const attendanceEditSchema = z
  .object({
    attendance: z.array(attendanceEditItemSchema).min(1)
  })
  .superRefine((data, ctx) => {
    data.attendance.forEach((item, index) => {
      if (!item.status) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['attendance', index, 'status'],
          message: 'يرجى تحديد حالة الحضور'
        });
      }
    });
  });

export const updateSessionSchema = z.object({
  action: z.enum(['CANCEL', 'RESCHEDULE', 'ATTENDANCE']),
  date: z
    .custom<ISODateOnlyString>(
      (value) => typeof value === 'string' && value.length > 0
    )
    .optional(),
  time: z
    .custom<TimeMinutes>(
      (value) =>
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= 0 &&
        value <= 1439
    )
    .optional(),
  attendance: z.array(sessionAttendanceSchema).optional()
}) satisfies z.ZodType<UpdateSessionActionDTO>;

export type UpdateSessionFormData = z.infer<typeof updateSessionSchema>;
export type AttendanceEditFormData = z.infer<typeof attendanceEditSchema>;
