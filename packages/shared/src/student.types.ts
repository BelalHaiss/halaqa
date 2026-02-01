import { z } from 'zod';

// ============================================================================
// DTOs (Public Types)
// ============================================================================

export interface Student {
  id: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentDto {
  name: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  notes?: string;
}

export interface UpdateStudentDto {
  id: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  notes?: string;
}

export interface StudentFilterDto {
  search?: string;
  groupId?: string;
}

// ============================================================================
// Zod Schemas
// ============================================================================

const phoneRegex = /^[\d\s\-+()]+$/;

export const StudentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  phone: z.string().regex(phoneRegex, 'رقم الهاتف غير صحيح').optional(),
  whatsapp: z.string().regex(phoneRegex, 'رقم الواتساب غير صحيح').optional(),
  telegram: z.string().max(100).optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}) satisfies z.ZodType<Student>;

export const CreateStudentSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  phone: z.string().regex(phoneRegex, 'رقم الهاتف غير صحيح').optional(),
  whatsapp: z.string().regex(phoneRegex, 'رقم الواتساب غير صحيح').optional(),
  telegram: z.string().max(100).optional(),
  notes: z.string().optional()
}) satisfies z.ZodType<CreateStudentDto>;

export const UpdateStudentSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100)
    .optional(),
  phone: z.string().regex(phoneRegex, 'رقم الهاتف غير صحيح').optional(),
  whatsapp: z.string().regex(phoneRegex, 'رقم الواتساب غير صحيح').optional(),
  telegram: z.string().max(100).optional(),
  notes: z.string().optional()
}) satisfies z.ZodType<UpdateStudentDto>;

export const StudentFilterSchema = z.object({
  search: z.string().optional(),
  groupId: z.string().uuid().optional()
}) satisfies z.ZodType<StudentFilterDto>;
