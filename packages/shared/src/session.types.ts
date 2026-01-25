import { z } from 'zod';

export const SessionStatusSchema = z.enum(['done', 'canceled', 'active', 'inactive']);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  date: z.string(), // YYYY-MM-DD
  time: z.string(), // HH:mm
  status: SessionStatusSchema.default('active'),
  notes: z.string().optional()
});

export type Session = z.infer<typeof SessionSchema>;

export const CreateSessionSchema = z.object({
  groupId: z.string(),
  date: z.string(),
  time: z.string(),
  notes: z.string().optional()
});

export type CreateSession = z.infer<typeof CreateSessionSchema>;

export const UpdateSessionSchema = z.object({
  id: z.string(),
  status: SessionStatusSchema,
  notes: z.string().optional()
});

export type UpdateSession = z.infer<typeof UpdateSessionSchema>;
