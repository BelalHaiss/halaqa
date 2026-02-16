// ============================================================================
// DTOs (Public Types)
// ============================================================================

export type SessionStatus = 'RESCHEDULED' | 'COMPLETED' | 'CANCELED' | 'MISSED';

export interface Session {
  id: string;
  groupId: string;
  startedAt: string; // UTC datetime
  originalStartedAt?: string;
  status: SessionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionDto {
  groupId: string;
  startedAt: string;
  originalStartedAt?: string;
  status?: SessionStatus;
  notes?: string;
}

export interface UpdateSessionDto {
  id: string;
  startedAt?: string;
  originalStartedAt?: string;
  status?: SessionStatus;
  notes?: string;
}

export interface SessionFilterDto {
  groupId?: string;
  status?: SessionStatus;
  startedAtFrom?: string;
  startedAtTo?: string;
}
