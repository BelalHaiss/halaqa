import { ChangePasswordDto, UpdateProfileDto } from '@halaqa/shared';
import { timezoneFieldSchema } from '@/lib/validation/timezone.schema';
import { z, ZodType } from 'zod';

/**
 * Schema for updating user profile
 */
const profileBaseSchema = z.object({
  username: z
    .string()
    .min(1, 'اسم المستخدم مطلوب')
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
});

export const profileSchema = z.intersection(
  profileBaseSchema,
  timezoneFieldSchema
) satisfies ZodType<UpdateProfileDto>;

/**
 * Schema for changing password
 */
const changePasswordBaseSchema = z
  .object({
    currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: z
      .string()
      .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'),
  }) satisfies ZodType<ChangePasswordDto>;

export const changePasswordSchema = changePasswordBaseSchema
  .extend({
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمة المرور غير متطابقة',
    path: ['confirmPassword'],
  });

export type ProfileFormData = UpdateProfileDto;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
