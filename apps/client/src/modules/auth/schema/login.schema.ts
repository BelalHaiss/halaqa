import { LoginCredentialsDto } from '@halaqa/shared';
import { z, ZodType } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'اسم المستخدم مطلوب')
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
}) satisfies ZodType<LoginCredentialsDto>;

// Infer TypeScript type from schema
export type LoginFormData = LoginCredentialsDto;
