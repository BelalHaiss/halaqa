import {
  DATE_ONLY_FORMAT_REGEX,
  ISODateOnlyString,
  PaginationQueryType,
  TimeMinutes,
} from '@halaqa/shared';
import z, { ZodType } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
}) satisfies ZodType<PaginationQueryType>;

export const isoDateOnlySchema = z
  .string()
  .regex(DATE_ONLY_FORMAT_REGEX)
  .transform((value) => value as ISODateOnlyString);

export const optionalIsoDateOnlySchema = z
  .string()
  .regex(DATE_ONLY_FORMAT_REGEX)
  .transform((value) => value as ISODateOnlyString);

export const timeMinutesSchema = z
  .number()
  .int()
  .min(0)
  .max(1439)
  .transform((value) => value as TimeMinutes);
