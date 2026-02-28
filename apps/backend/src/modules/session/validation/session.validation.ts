import {
  PAGINATION_MAX_LIMIT,
  PAGINATION_MIN_LIMIT,
  PAGINATION_MIN_PAGE,
  type SessionQueryDTO,
  type UpdateSessionActionDTO,
} from '@halaqa/shared';
import {
  attendanceNotesSchema,
  isoDateOnlySchema,
  nonEmptyIdSchema,
  optionalIsoDateOnlySchema,
  timeMinutesSchema,
} from 'src/utils/validation/fields.schema';
import z, { ZodType } from 'zod';

const attendanceItemSchema = z.object({
  studentId: nonEmptyIdSchema,
  status: z.enum(['ATTENDED', 'MISSED', 'EXCUSED']),
  notes: attendanceNotesSchema.optional(),
});

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
  page: z.coerce.number().min(PAGINATION_MIN_PAGE).optional(),
  limit: z.coerce.number().min(PAGINATION_MIN_LIMIT).max(PAGINATION_MAX_LIMIT).optional(),
  fromDate: optionalIsoDateOnlySchema,
  toDate: optionalIsoDateOnlySchema,
  status: z.enum(['RESCHEDULED', 'COMPLETED', 'CANCELED', 'MISSED']).optional(),
  groupId: z.string().optional(),
}) satisfies ZodType<SessionQueryDTO>;
