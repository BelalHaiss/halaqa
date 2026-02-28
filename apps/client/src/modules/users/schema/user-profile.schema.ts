import { ChangeOwnPasswordDto, UpdateOwnProfileDto } from '@halaqa/shared';
import { timezoneFieldSchema } from '@/lib/validation/timezone.schema';
import { z, ZodType } from 'zod';
import { nameSchema, passwordSchema, usernameAccountSchema } from '@/lib/validation/fields.schema';

const updateOwnProfileBaseSchema = z.object({
  name: nameSchema,
  username: usernameAccountSchema,
});

export const updateOwnProfileSchema = z.intersection(
  updateOwnProfileBaseSchema,
  timezoneFieldSchema
) satisfies ZodType<UpdateOwnProfileDto>;

const changeOwnPasswordBaseSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}) satisfies ZodType<ChangeOwnPasswordDto>;

export const changeOwnPasswordSchema = changeOwnPasswordBaseSchema.refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'كلمة المرور غير متطابقة',
    path: ['confirmPassword'],
  }
);
