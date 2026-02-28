import { CreateStaffUserDto, UpdateStaffUserDto } from '@halaqa/shared';
import {
  optionalTimezoneFieldSchema,
  timezoneFieldSchema,
} from 'src/utils/validation/timezone.schema';
import {
  nameSchema,
  passwordSchema,
  usernameAccountSchema,
} from 'src/utils/validation/fields.schema';
import z, { ZodType } from 'zod';

const staffRoleSchema = z.enum(['ADMIN', 'MODERATOR', 'TUTOR']);

const createStaffBaseSchema = z.object({
  username: usernameAccountSchema,
  name: nameSchema,
  role: staffRoleSchema,
  password: passwordSchema,
});

export const createStaffSchema = z.intersection(
  createStaffBaseSchema,
  timezoneFieldSchema
) satisfies ZodType<CreateStaffUserDto>;

const updateStaffBaseSchema = z.object({
  username: usernameAccountSchema.optional(),
  name: nameSchema.optional(),
  role: staffRoleSchema.optional(),
});

export const updateStaffSchema = z
  .intersection(updateStaffBaseSchema, optionalTimezoneFieldSchema)
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  }) satisfies ZodType<UpdateStaffUserDto>;
