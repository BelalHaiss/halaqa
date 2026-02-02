import { z } from 'zod';

// ============================================================================
// DTOs (Public Types)
// ============================================================================

export type UserRole = 'ADMIN' | 'MODERATOR' | 'TUTOR' | 'STUDENT';

export interface UserProfile {
  userId: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  notes?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

export interface LoginCredentialsDto {
  usernameOrEmail: string;
  password: string;
}

export interface CreateUserDto {
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  password: string;
  profile?: {
    phone?: string;
    whatsapp?: string;
    telegram?: string;
    notes?: string;
  };
}

export interface UpdateUserDto {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  password?: string;
}

export interface UpdateUserProfileDto {
  userId: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
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

export const UserProfileSchema = z.object({
  userId: z.string(),
  phone: z.string().regex(phoneRegex, 'رقم الهاتف غير صحيح').optional(),
  whatsapp: z.string().regex(phoneRegex, 'رقم الواتساب غير صحيح').optional(),
  telegram: z.string().max(100).optional(),
  notes: z.string().optional()
}) satisfies z.ZodType<UserProfile>;

export const UserSchema = z.object({
  id: z.string(),
  username: z.string().min(3).max(50),
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  role: UserRoleSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  profile: UserProfileSchema.optional()
}) satisfies z.ZodType<User>;

export const LoginCredentialsSchema = z.object({
  usernameOrEmail: z.string().min(1, 'اسم المستخدم أو البريد الإلكتروني مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
}) satisfies z.ZodType<LoginCredentialsDto>;

export const CreateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .max(50),
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
  role: UserRoleSchema,
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  profile: z
    .object({
      phone: z.string().regex(phoneRegex, 'رقم الهاتف غير صحيح').optional(),
      whatsapp: z
        .string()
        .regex(phoneRegex, 'رقم الواتساب غير صحيح')
        .optional(),
      telegram: z.string().max(100).optional(),
      notes: z.string().optional()
    })
    .optional()
}) satisfies z.ZodType<CreateUserDto>;

export const UpdateUserSchema = z.object({
  id: z.string(),
  username: z
    .string()
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .max(50)
    .optional(),
  name: z
    .string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100)
    .optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
  role: UserRoleSchema.optional(),
  password: z
    .string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    .optional()
}) satisfies z.ZodType<UpdateUserDto>;

export const UpdateUserProfileSchema = z.object({
  userId: z.string(),
  phone: z.string().regex(phoneRegex, 'رقم الهاتف غير صحيح').optional(),
  whatsapp: z.string().regex(phoneRegex, 'رقم الواتساب غير صحيح').optional(),
  telegram: z.string().max(100).optional(),
  notes: z.string().optional()
}) satisfies z.ZodType<UpdateUserProfileDto>;

export const AuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string()
}) satisfies z.ZodType<AuthResponseDto>;

export const UserFilterSchema = z.object({
  role: UserRoleSchema.optional(),
  search: z.string().optional()
}) satisfies z.ZodType<UserFilterDto>;
