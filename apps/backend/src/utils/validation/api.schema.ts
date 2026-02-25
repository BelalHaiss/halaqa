import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_MAX_LIMIT,
  PAGINATION_MIN_LIMIT,
  PAGINATION_MIN_PAGE,
  PaginationQueryType,
} from '@halaqa/shared';
import z, { ZodType } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .min(PAGINATION_MIN_PAGE)
    .default(PAGINATION_DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .min(PAGINATION_MIN_LIMIT)
    .max(PAGINATION_MAX_LIMIT)
    .default(PAGINATION_DEFAULT_LIMIT),
}) satisfies ZodType<PaginationQueryType>;
