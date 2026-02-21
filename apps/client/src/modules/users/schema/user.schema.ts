import { UserFormDto } from '@halaqa/shared';
import { timezoneFieldSchema } from '@/lib/validation/timezone.schema';
import { z, ZodType } from 'zod';

const userBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جدًا'),

  username: z
    .string()
    .trim()
    .min(3, 'اسم الحساب قصير جدًا')
    .max(50, 'اسم الحساب طويل جدًا')
    .regex(/^[a-zA-Z0-9_]+$/, 'يسمح فقط بالحروف والأرقام و _'),

  role: z.enum(['ADMIN', 'MODERATOR', 'TUTOR']),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .optional()
    .or(z.literal('')),
});

export const userSchema = z.intersection(
  userBaseSchema,
  timezoneFieldSchema
) satisfies ZodType<UserFormDto>;

export type UserFormSchema = UserFormDto;
