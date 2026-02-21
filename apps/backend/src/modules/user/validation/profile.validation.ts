import { ChangeOwnPasswordDto, UpdateOwnProfileDto } from '@halaqa/shared';
import { timezoneFieldSchema } from 'src/utils/validation/timezone.schema';
import z, { ZodType } from 'zod';

const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be less than 50 characters');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters');

const updateOwnProfileBaseSchema = z.object({
  name: z.string().trim().min(2).max(100),
  username: usernameSchema,
});

export const updateOwnProfileSchema = z.intersection(
  updateOwnProfileBaseSchema,
  timezoneFieldSchema,
) satisfies ZodType<UpdateOwnProfileDto>;

export const changeOwnPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().optional(),
  })
  .refine(
    (value) =>
      value.confirmPassword === undefined ||
      value.newPassword === value.confirmPassword,
    {
      message: 'Password confirmation does not match',
      path: ['confirmPassword'],
    },
  ) satisfies ZodType<ChangeOwnPasswordDto>;
