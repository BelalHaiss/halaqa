import { UserFormDto } from '@halaqa/shared';
import { timezoneFieldSchema } from '@/lib/validation/timezone.schema';
import { z, ZodType } from 'zod';

const userBaseSchema = z.object({
  name: z
    .string()
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
    .max(50, 'الاسم طويل جدًا'),

  username: z
    .string()
    .min(3, 'اسم الحساب قصير جدًا')
    .regex(/^[a-zA-Z0-9_]+$/, 'يسمح فقط بالحروف والأرقام و _'),

  role: z.enum(['ADMIN', 'MODERATOR', 'TUTOR', 'STUDENT']),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .optional()
    .or(z.literal('')), // allow empty on edit
});

export const userSchema = z.intersection(
  userBaseSchema,
  timezoneFieldSchema
) satisfies ZodType<UserFormDto>;

export type UserFormSchema = UserFormDto;
