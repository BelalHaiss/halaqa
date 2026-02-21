import { ChangeOwnPasswordDto, UpdateOwnProfileDto } from '@halaqa/shared';
import { timezoneFieldSchema } from '@/lib/validation/timezone.schema';
import { z, ZodType } from 'zod';

/**
 * Schema for updating user profile
 */
const profileBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جدًا'),
  username: z
    .string()
    .trim()
    .min(1, 'اسم المستخدم مطلوب')
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .max(50, 'اسم المستخدم طويل جدًا'),
});

export const profileSchema = z.intersection(
  profileBaseSchema,
  timezoneFieldSchema
) satisfies ZodType<UpdateOwnProfileDto>;

/**
 * Schema for changing password
 */
const changePasswordBaseSchema = z
  .object({
    currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: z
      .string()
      .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'),
  }) satisfies ZodType<ChangeOwnPasswordDto>;

export const changePasswordSchema = changePasswordBaseSchema
  .extend({
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمة المرور غير متطابقة',
    path: ['confirmPassword'],
  });

export type ProfileFormData = UpdateOwnProfileDto;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
