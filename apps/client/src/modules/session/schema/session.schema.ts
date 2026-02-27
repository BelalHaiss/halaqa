import { z } from 'zod';
import type {
  UpdateSessionActionDTO,
  SessionAttendanceUpdateDTO,
  AttendanceStatus
} from '@halaqa/shared';
import {
  isoDateOnlySchema,
  nameSchema,
  nonEmptyIdSchema,
  notesSchema,
  timeMinutesSchema
} from '@/lib/validation/fields.schema';

const attendanceStatusSchema = z.enum([
  'ATTENDED',
  'MISSED',
  'EXCUSED'
] satisfies [AttendanceStatus, ...AttendanceStatus[]]);

const sessionAttendanceSchema = z.object({
  studentId: nonEmptyIdSchema,
  status: attendanceStatusSchema,
  notes: notesSchema.optional()
}) satisfies z.ZodType<SessionAttendanceUpdateDTO>;

const attendanceEditItemSchema = z.object({
  studentId: nonEmptyIdSchema,
  studentName: nameSchema,
  status: attendanceStatusSchema.nullable(),
  notes: notesSchema.optional()
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
  date: isoDateOnlySchema.optional(),
  time: timeMinutesSchema.optional(),
  attendance: z.array(sessionAttendanceSchema).optional()
}) satisfies z.ZodType<UpdateSessionActionDTO>;

export type UpdateSessionFormData = UpdateSessionActionDTO;

export type AttendanceEditItem = {
  studentId: string;
  studentName: string;
  status: AttendanceStatus | null;
  notes?: string;
};

export type AttendanceEditFormData = {
  attendance: AttendanceEditItem[];
};
