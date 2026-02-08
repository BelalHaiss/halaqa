// ============================================================================
// DTOs (Public Types)
// ============================================================================

export type AttendanceStatus = 'ATTENDED' | 'MISSED' | 'EXCUSED';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  userId: string;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceRecordDto {
  sessionId: string;
  userId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface UpdateAttendanceRecordDto {
  id: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface BulkAttendanceDto {
  sessionId: string;
  records: CreateAttendanceRecordDto[];
}

export interface AttendanceFilterDto {
  sessionId?: string;
  userId?: string;
  status?: AttendanceStatus;
}
