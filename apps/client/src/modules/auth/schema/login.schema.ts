import { LoginCredentialsDto } from '@halaqa/shared';
import { z, ZodType } from 'zod';
import { passwordSchema, usernameAccountSchema } from '@/lib/validation/fields.schema';

export const loginSchema = z.object({
  username: usernameAccountSchema,
  password: passwordSchema,
}) satisfies ZodType<LoginCredentialsDto>;
