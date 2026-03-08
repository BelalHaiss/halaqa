import z, { ZodType } from 'zod';
import { AttendanceStatus } from '../attendance.types';
import { SessionQueryDTO, UpdateSessionActionDTO } from '../session.types';
import {
  PAGINATION_MAX_LIMIT,
  PAGINATION_MIN_LIMIT,
  PAGINATION_MIN_PAGE,
} from './fields.constants';
import { ValidationLocale } from './messages';
import {
  attendanceNotesSchema,
  isoDateOnlySchema,
  nonEmptyIdSchema,
  optionalIsoDateOnlySchema,
  timeMinutesSchema,
} from './fields.schema';

const attendanceStatusSchema = z.enum([
  'ATTENDED',
  'MISSED',
  'EXCUSED',
]) satisfies ZodType<AttendanceStatus>;

const attendanceItemSchema = (locale: ValidationLocale = 'ar') =>
  z.object({
    studentId: nonEmptyIdSchema(locale),
    status: attendanceStatusSchema,
    notes: attendanceNotesSchema(locale).optional(),
  });

export const updateSessionActionSchema = (locale: ValidationLocale = 'ar') =>
  z.discriminatedUnion('action', [
    z.object({ action: z.literal('CANCEL') }),
    z.object({
      action: z.literal('RESCHEDULE'),
      date: isoDateOnlySchema(locale),
      time: timeMinutesSchema(locale),
    }),
    z.object({
      action: z.literal('ATTENDANCE'),
      attendance: z.array(attendanceItemSchema(locale)).min(1),
    }),
  ]) satisfies ZodType<UpdateSessionActionDTO>;

export const sessionQuerySchema = (locale: ValidationLocale = 'ar') =>
  z.object({
    page: z.coerce.number().min(PAGINATION_MIN_PAGE).optional(),
    limit: z.coerce.number().min(PAGINATION_MIN_LIMIT).max(PAGINATION_MAX_LIMIT).optional(),
    fromDate: optionalIsoDateOnlySchema(locale),
    toDate: optionalIsoDateOnlySchema(locale),
    status: z.enum(['RESCHEDULED', 'COMPLETED', 'CANCELED', 'MISSED']).optional(),
    groupId: z.string().optional(),
  }) satisfies ZodType<SessionQueryDTO>;
