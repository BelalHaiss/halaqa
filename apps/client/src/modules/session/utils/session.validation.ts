import {
  AttendanceStatus,
  formatDate,
  getNowAsUTC,
  UpdateSessionActionDTO,
  nameSchema,
  nonEmptyIdSchema,
  notesSchema,
  isoDateOnlySchema,
  timeMinutesSchema,
} from '@halaqa/shared';
import { z } from 'zod';

// ─── Attendance Edit (client-only: includes studentName for display) ──────────

const attendanceStatusSchema = z.enum(['ATTENDED', 'MISSED', 'EXCUSED'] satisfies [
  AttendanceStatus,
  ...AttendanceStatus[],
]);

const attendanceEditItemSchema = z.object({
  studentId: nonEmptyIdSchema(),
  studentName: nameSchema(),
  status: attendanceStatusSchema.nullable(),
  notes: notesSchema().optional(),
});

export type AttendanceEditItem = {
  studentId: string;
  studentName: string;
  status: AttendanceStatus | null;
  notes?: string;
};

export type AttendanceEditFormData = {
  attendance: AttendanceEditItem[];
};

export const attendanceEditSchema = z
  .object({
    attendance: z.array(attendanceEditItemSchema).min(1),
  })
  .superRefine((data, ctx) => {
    data.attendance.forEach((item, index) => {
      if (!item.status) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['attendance', index, 'status'],
          message: 'يرجى تحديد حالة الحضور',
        });
      }
    });
  });

// ─── Reschedule (client-only: validates date is not in the past) ──────────────

export type RescheduleFormData = Omit<
  Required<Pick<UpdateSessionActionDTO, 'date' | 'time'>>,
  'date'
> & {
  date: string;
};

const baseRescheduleSchema = z.object({
  date: isoDateOnlySchema(),
  time: timeMinutesSchema(),
}) satisfies z.ZodType<RescheduleFormData>;

export const createRescheduleSchema = (timezone: string) =>
  baseRescheduleSchema.superRefine((data, ctx) => {
    const todayDate = formatDate({ date: getNowAsUTC(), token: 'yyyy-LL-dd', timezone });
    if (data.date < todayDate) {
      ctx.addIssue({ code: 'custom', path: ['date'], message: 'لا يمكن اختيار تاريخ سابق' });
    }
  });
