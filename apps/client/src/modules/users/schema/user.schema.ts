import {
  CreateStaffUserDto,
  isSupportedTimezone,
  UpdateStaffUserDto,
  UserAuthRole
} from '@halaqa/shared';
import {
  optionalTimezoneSchema,
  timezoneMessage
} from '@/lib/validation/timezone.schema';
import { z, ZodType } from 'zod';
import {
  nameSchema,
  passwordSchema,
  usernameAccountSchema
} from '@/lib/validation/fields.schema';

const roleSchema = z.enum([
  'ADMIN',
  'MODERATOR',
  'TUTOR'
]) satisfies ZodType<UserAuthRole>;

const requiredTimezoneSchema = z.string().trim().refine(isSupportedTimezone, {
  message: timezoneMessage
});

export const createStaffUserSchema = z.object({
  name: nameSchema,
  username: usernameAccountSchema,
  role: roleSchema,
  timezone: requiredTimezoneSchema,
  password: passwordSchema
}) satisfies ZodType<CreateStaffUserDto>;

export const updateStaffUserSchema = z.object({
  name: nameSchema.optional(),
  username: usernameAccountSchema.optional(),
  role: roleSchema.optional(),
  timezone: optionalTimezoneSchema
}) satisfies ZodType<UpdateStaffUserDto>;
