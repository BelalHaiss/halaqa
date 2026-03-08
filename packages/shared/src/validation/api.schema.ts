import z, { ZodType } from 'zod';
import { PaginationQueryType } from '../types/api.types';
import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_MAX_LIMIT,
  PAGINATION_MIN_LIMIT,
  PAGINATION_MIN_PAGE,
} from './fields.constants';
import { ValidationLocale, getMessages } from './messages';

export const paginationSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z.object({
    page: z.coerce
      .number()
      .min(PAGINATION_MIN_PAGE, m.pageInvalid)
      .default(PAGINATION_DEFAULT_PAGE),
    limit: z.coerce
      .number()
      .min(PAGINATION_MIN_LIMIT, m.limitInvalid)
      .max(PAGINATION_MAX_LIMIT, m.limitInvalid)
      .default(PAGINATION_DEFAULT_LIMIT),
  }) satisfies ZodType<PaginationQueryType>;
};
