import { z } from 'zod';

// ============================================================================
// DTOs (Public Types)
// ============================================================================

export type UserRole = 'ADMIN' | 'MODERATOR' | 'TUTOR' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  role: UserRole;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentialsDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  role: UserRole;
  password?: string;
  notes?: string;
}

export interface UpdateUserDto {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  role?: UserRole;
  password?: string;
  notes?: string;
}

export interface AuthResponseDto {
  user: User;
  token: string;
}

export interface UserFilterDto {
  role?: UserRole;
  search?: string;
}

// ============================================================================
// Zod Schemas
// ============================================================================

export const UserRoleSchema = z.enum([
  'ADMIN',
  'MODERATOR',
  'TUTOR',
  'STUDENT'
]) satisfies z.ZodType<UserRole>;

const phoneRegex = /^[\d\s\-+()]+$/;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(phoneRegex, 'رقم الهاتف غير صحيح').optional(),
  whatsapp: z.string().regex(phoneRegex, 'رقم الواتساب غير صحيح').optional(),
  telegram: z.string().max(100).optional(),
  role: UserRoleSchema,
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}) satisfies z.ZodType<User>;

export const LoginCredentialsSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
}) satisfies z.ZodType<LoginCredentialsDto>;

export const CreateUserSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().regex(phoneRegex, 'رقم الهاتف غير صحيح').optional(),
  whatsapp: z.string().regex(phoneRegex, 'رقم الواتساب غير صحيح').optional(),
  telegram: z.string().max(100).optional(),
  role: UserRoleSchema,
  password: z
    .string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    .optional(),
  notes: z.string().optional()
}) satisfies z.ZodType<CreateUserDto>;

export const UpdateUserSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100)
    .optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
  phone: z.string().regex(phoneRegex, 'رقم الهاتف غير صحيح').optional(),
  whatsapp: z.string().regex(phoneRegex, 'رقم الواتساب غير صحيح').optional(),
  telegram: z.string().max(100).optional(),
  role: UserRoleSchema.optional(),
  password: z
    .string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    .optional(),
  notes: z.string().optional()
}) satisfies z.ZodType<UpdateUserDto>;

export const AuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string()
}) satisfies z.ZodType<AuthResponseDto>;

export const UserFilterSchema = z.object({
  role: UserRoleSchema.optional(),
  search: z.string().optional()
}) satisfies z.ZodType<UserFilterDto>;
