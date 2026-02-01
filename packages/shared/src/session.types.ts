import { z } from 'zod';

// ============================================================================
// DTOs (Public Types)
// ============================================================================

export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED';

export interface Session {
  id: string;
  groupId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: SessionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionDto {
  groupId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
}

export interface UpdateSessionDto {
  id: string;
  date?: string;
  time?: string;
  status?: SessionStatus;
  notes?: string;
}

export interface SessionFilterDto {
  groupId?: string;
  status?: SessionStatus;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================================
// Zod Schemas
// ============================================================================

export const SessionStatusSchema = z.enum([
  'SCHEDULED',
  'COMPLETED',
  'CANCELED'
]) satisfies z.ZodType<SessionStatus>;

export const SessionSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'صيغة التاريخ غير صحيحة'),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'صيغة الوقت غير صحيحة'),
  status: SessionStatusSchema,
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}) satisfies z.ZodType<Session>;

export const CreateSessionSchema = z.object({
  groupId: z.string().uuid('معرف الحلقة غير صحيح'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'صيغة التاريخ غير صحيحة (YYYY-MM-DD)'),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'صيغة الوقت غير صحيحة (HH:mm)'),
  notes: z.string().optional()
}) satisfies z.ZodType<CreateSessionDto>;

export const UpdateSessionSchema = z.object({
  id: z.string().uuid(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'صيغة التاريخ غير صحيحة')
    .optional(),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'صيغة الوقت غير صحيحة')
    .optional(),
  status: SessionStatusSchema.optional(),
  notes: z.string().optional()
}) satisfies z.ZodType<UpdateSessionDto>;

export const SessionFilterSchema = z.object({
  groupId: z.string().uuid().optional(),
  status: SessionStatusSchema.optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
}) satisfies z.ZodType<SessionFilterDto>;
