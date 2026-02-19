import { z } from 'zod';
import { timezoneFieldSchema } from '@/lib/validation/timezone.schema';

const studentMainInfoBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جدًا'),
  notes: z.string().trim().max(2000, 'الملاحظات طويلة جدًا').default(''),
});

export const studentMainInfoFormSchema = z.intersection(
  studentMainInfoBaseSchema,
  timezoneFieldSchema
);

export type StudentMainInfoFormValues = z.infer<typeof studentMainInfoFormSchema>;
