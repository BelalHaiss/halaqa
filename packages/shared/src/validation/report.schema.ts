import z, { ZodType } from 'zod';
import { ReportQueryDTO } from '../report.types';
import { getMessages, ValidationLocale } from './messages';
import { isoDateOnlySchema, nonEmptyIdSchema } from './fields.schema';

export const reportQuerySchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .object({
      groupId: nonEmptyIdSchema(locale),
      fromDate: isoDateOnlySchema(locale),
      toDate: isoDateOnlySchema(locale),
    })
    .refine((value) => value.fromDate <= value.toDate, {
      message: m.periodFromBeforeTo,
      path: ['toDate'],
    }) satisfies ZodType<ReportQueryDTO>;
};
