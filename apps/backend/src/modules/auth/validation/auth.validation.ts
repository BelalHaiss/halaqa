import { LoginCredentialsDto } from '@halaqa/shared';
import z, { ZodType } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters');

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters'),
  password: passwordSchema,
}) satisfies ZodType<LoginCredentialsDto>;
