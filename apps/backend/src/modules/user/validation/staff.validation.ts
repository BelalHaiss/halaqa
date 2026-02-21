import { CreateStaffUserDto, UpdateStaffUserDto } from '@halaqa/shared';
import {
  optionalTimezoneFieldSchema,
  timezoneFieldSchema,
} from 'src/utils/validation/timezone.schema';
import z, { ZodType } from 'zod';

const staffRoleSchema = z.enum(['ADMIN', 'MODERATOR', 'TUTOR']);

const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be less than 50 characters');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters');

const createStaffBaseSchema = z.object({
  username: usernameSchema,
  name: z.string().trim().min(2).max(100),
  role: staffRoleSchema,
  password: passwordSchema,
});

export const createStaffSchema = z.intersection(
  createStaffBaseSchema,
  timezoneFieldSchema,
) satisfies ZodType<CreateStaffUserDto>;

const updateStaffBaseSchema = z.object({
  username: usernameSchema.optional(),
  name: z.string().trim().min(2).max(100).optional(),
  role: staffRoleSchema.optional(),
  password: passwordSchema.optional().or(z.literal('')),
});

export const updateStaffSchema = z
  .intersection(updateStaffBaseSchema, optionalTimezoneFieldSchema)
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  }) satisfies ZodType<UpdateStaffUserDto>;
