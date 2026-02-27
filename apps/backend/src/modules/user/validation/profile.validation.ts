import { ChangeOwnPasswordDto, UpdateOwnProfileDto } from '@halaqa/shared';
import { timezoneFieldSchema } from 'src/utils/validation/timezone.schema';
import {
  nameSchema,
  passwordSchema,
  usernameAccountSchema,
} from 'src/utils/validation/fields.schema';
import z, { ZodType } from 'zod';

const updateOwnProfileBaseSchema = z.object({
  name: nameSchema,
  username: usernameAccountSchema,
});

export const updateOwnProfileSchema = z.intersection(
  updateOwnProfileBaseSchema,
  timezoneFieldSchema,
) satisfies ZodType<UpdateOwnProfileDto>;

export const changeOwnPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'Password confirmation does not match',
    path: ['confirmPassword'],
  }) satisfies ZodType<ChangeOwnPasswordDto>;
