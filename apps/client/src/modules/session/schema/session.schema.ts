import { z } from 'zod';
import type {
  UpdateSessionActionDTO,
  SessionAttendanceUpdateDTO
} from '@halaqa/shared';

const sessionAttendanceSchema = z.object({
  studentId: z.string().min(1, 'معرف الطالب مطلوب'),
  status: z.enum(['ATTENDED', 'MISSED', 'EXCUSED']),
  notes: z.string().optional()
}) satisfies z.ZodType<SessionAttendanceUpdateDTO>;

export const updateSessionSchema = z.object({
  action: z.enum(['CANCEL', 'RESCHEDULE', 'ATTENDANCE']),
  date: z.string().optional(),
  time: z.string().optional(),
  attendance: z.array(sessionAttendanceSchema).optional()
}) satisfies z.ZodType<UpdateSessionActionDTO>;

export type UpdateSessionFormData = z.infer<typeof updateSessionSchema>;
