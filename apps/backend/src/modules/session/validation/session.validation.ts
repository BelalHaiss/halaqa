import { DATE_ONLY_FORMAT_REGEX, TIME_HHMM_FORMAT_REGEX } from '@halaqa/shared';
import type {
  ISODateOnlyString,
  TimeHHMMString,
  UpdateSessionActionDTO,
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

const timeHHMMSchema = z
  .string()
  .regex(TIME_HHMM_FORMAT_REGEX)
  .transform((value) => value as TimeHHMMString);

export const updateSessionActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('CANCEL'),
  }),
  z.object({
    action: z.literal('RESCHEDULE'),
    date: isoDateOnlySchema,
    time: timeHHMMSchema,
  }),
  z.object({
    action: z.literal('ATTENDANCE'),
    attendance: z.array(attendanceItemSchema).min(1),
  }),
]) satisfies ZodType<UpdateSessionActionDTO>;
