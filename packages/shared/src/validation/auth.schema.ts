import z, { ZodType } from 'zod';
import { LoginCredentialsDto } from '../user.types';
import { ValidationLocale } from './messages';
import { passwordSchema, usernameAccountSchema } from './fields.schema';

export const loginSchema = (locale: ValidationLocale = 'ar') =>
  z.object({
    username: usernameAccountSchema(locale),
    password: passwordSchema(locale),
  }) satisfies ZodType<LoginCredentialsDto>;
