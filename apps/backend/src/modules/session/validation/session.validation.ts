import { DATE_ONLY_FORMAT_REGEX } from '@halaqa/shared';
import type {
  ISODateOnlyString,
  TimeMinutes,
  UpdateSessionActionDTO,
  SessionQueryDTO,
} from '@halaqa/shared';
import z, { ZodType } from 'zod';

const attendanceItemSchema = z.object({
  studentId: z.string().min(1),
  status: z.enum(['ATTENDED', 'MISSED', 'EXCUSED']),
  notes: z.string().trim().max(1000).optional(),
});

const isoDateOnlySchema = z
  .string()
  .regex(DATE_ONLY_FORMAT_REGEX)
  .transform((value) => value as ISODateOnlyString);

const timeMinutesSchema = z
  .number()
  .int()
  .min(0)
  .max(1439)
  .transform((value) => value as TimeMinutes);

export const updateSessionActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('CANCEL'),
  }),
  z.object({
    action: z.literal('RESCHEDULE'),
    date: isoDateOnlySchema,
    time: timeMinutesSchema,
  }),
  z.object({
    action: z.literal('ATTENDANCE'),
    attendance: z.array(attendanceItemSchema).min(1),
  }),
]) satisfies ZodType<UpdateSessionActionDTO>;

export const sessionQuerySchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  fromDate: z.string().regex(DATE_ONLY_FORMAT_REGEX).optional(),
  toDate: z.string().regex(DATE_ONLY_FORMAT_REGEX).optional(),
  status: z.enum(['RESCHEDULED', 'COMPLETED', 'CANCELED', 'MISSED']).optional(),
  groupId: z.string().optional(),
}) satisfies ZodType<SessionQueryDTO>;
