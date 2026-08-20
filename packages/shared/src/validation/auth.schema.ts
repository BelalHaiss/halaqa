import z, { ZodType } from 'zod';
import { LoginCredentialsDto } from '../user.types';
import { ValidationLocale } from './messages';
import { passwordSchema, phoneSchema } from './fields.schema';

export const loginSchema = (locale: ValidationLocale = 'ar') =>
  z.object({
    phone: phoneSchema(locale),
    password: passwordSchema(locale),
  }) satisfies ZodType<LoginCredentialsDto>;
