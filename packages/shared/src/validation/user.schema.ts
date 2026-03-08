import z, { ZodType } from 'zod';
import {
  ChangeOwnPasswordDto,
  CreateStaffUserDto,
  UpdateOwnProfileDto,
  UpdateStaffUserDto,
  UserAuthRole,
} from '../user.types';
import { getMessages, ValidationLocale } from './messages';
import { nameSchema, passwordSchema, usernameAccountSchema } from './fields.schema';
import { optionalTimezoneFieldSchema, timezoneFieldSchema } from './timezone.schema';

const staffRoleSchema = z.enum(['ADMIN', 'MODERATOR', 'TUTOR']) satisfies ZodType<UserAuthRole>;

export const createStaffSchema = (locale: ValidationLocale = 'ar') =>
  z.intersection(
    z.object({
      username: usernameAccountSchema(locale),
      name: nameSchema(locale),
      role: staffRoleSchema,
      password: passwordSchema(locale),
    }),
    timezoneFieldSchema(locale)
  ) satisfies ZodType<CreateStaffUserDto>;

export const updateStaffSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .intersection(
      z.object({
        username: usernameAccountSchema(locale).optional(),
        name: nameSchema(locale).optional(),
        role: staffRoleSchema.optional(),
      }),
      optionalTimezoneFieldSchema(locale)
    )
    .refine((value) => Object.keys(value).length > 0, {
      message: m.atLeastOneField,
    }) satisfies ZodType<UpdateStaffUserDto>;
};

export const updateOwnProfileSchema = (locale: ValidationLocale = 'ar') =>
  z.intersection(
    z.object({
      name: nameSchema(locale),
      username: usernameAccountSchema(locale),
    }),
    timezoneFieldSchema(locale)
  ) satisfies ZodType<UpdateOwnProfileDto>;

export const changeOwnPasswordSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .object({
      currentPassword: z.string().min(1, m.currentPasswordRequired),
      newPassword: passwordSchema(locale),
      confirmPassword: z.string().min(1, m.confirmPasswordRequired),
    })
    .refine((v) => v.newPassword === v.confirmPassword, {
      message: m.passwordMismatch,
      path: ['confirmPassword'],
    }) satisfies ZodType<ChangeOwnPasswordDto>;
};
