import { z } from 'zod';

export const StudentSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),
  groupId: z.string(),
  joinDate: z.string().optional(),
  notes: z.string().optional()
});

export type Student = z.infer<typeof StudentSchema>;

export const CreateStudentSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),
  groupId: z.string(),
  notes: z.string().optional()
});

export type CreateStudent = z.infer<typeof CreateStudentSchema>;

export const UpdateStudentSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),
  groupId: z.string(),
  notes: z.string().optional()
});

export type UpdateStudent = z.infer<typeof UpdateStudentSchema>;
