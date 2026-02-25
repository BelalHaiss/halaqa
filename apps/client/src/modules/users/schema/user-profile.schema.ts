import { ChangeOwnPasswordDto, UpdateOwnProfileDto } from '@halaqa/shared';
import { timezoneFieldSchema } from '@/lib/validation/timezone.schema';
import { z, ZodType } from 'zod';
import {
  nameSchema,
  passwordSchema,
  usernameAccountSchema
} from '@/lib/validation/fields.schema';

/**
 * Schema for updating user profile
 */
const profileBaseSchema = z.object({
  name: nameSchema,
  username: usernameAccountSchema
});

export const profileSchema = z.intersection(
  profileBaseSchema,
  timezoneFieldSchema
) satisfies ZodType<UpdateOwnProfileDto>;

/**
 * Schema for changing password
 */
const changePasswordBaseSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: passwordSchema
}) satisfies ZodType<ChangeOwnPasswordDto>;

export const changePasswordSchema = changePasswordBaseSchema
  .extend({
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمة المرور غير متطابقة',
    path: ['confirmPassword']
  });
