import { type ClientErrorLogDto } from '@halaqa/shared';
import { z, type ZodType } from 'zod';

const clientErrorMetadataValueSchema = z.union([
  z.string().max(500),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const clientErrorLogSchema = z.object({
  message: z.string().trim().min(1).max(3000),
  name: z.string().trim().min(1).max(255).optional(),
  stack: z.string().trim().min(1).max(8000).optional(),
  path: z.string().trim().min(1).max(1000),
  url: z.string().trim().min(1).max(2000),
  captureChannel: z.enum(['router_error_element', 'window_error', 'unhandled_rejection']),
  userAgent: z.string().trim().min(1).max(1000),
  timestamp: z.string().datetime(),
  metadata: z.record(z.string(), clientErrorMetadataValueSchema).optional(),
}) satisfies ZodType<ClientErrorLogDto>;
