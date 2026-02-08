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
