import { AttendanceStatus } from './attendance.types';
import {
  ISODateString,
  ISODateOnlyString,
  PaginationQueryType,
  DateRangeQueryType,
  TimeMinutes,
} from './types/api.types';

// ============================================================================
// Session Status Types
// ============================================================================

/** Status stored in database for session records */
export type SessionRecordStatus = 'RESCHEDULED' | 'COMPLETED' | 'CANCELED' | 'MISSED';

/** Computed status including virtual 'SCHEDULED' for planned sessions */
export type SessionComputedStatus = SessionRecordStatus | 'SCHEDULED';

// ============================================================================
// Session DTOs
// ============================================================================

/** Summary view for session lists (today/history) */
export interface SessionSummaryDTO {
  id: string;
  groupName: string;
  tutorName: string | null;
  startedAt: ISODateString;
  originalStartedAt: ISODateString | null;
  sessionStatus: SessionComputedStatus;
}

/** Detailed view for single session with attendance */
export interface SessionDetailsDTO {
  id: string;
  groupInfo: { id: string; name: string };
  tutorInfo: { id: string; name: string } | null;
  status: SessionComputedStatus;
  canBeRescheduled: boolean;
  startedAt: ISODateString;
  originalStartedAt: ISODateString | null;
  students: { id: string; name: string }[];
  attendance: {
    studentId: string;
    studentName: string;
    status: AttendanceStatus;
    notes?: string;
  }[];
}

// ============================================================================
// Session Query DTOs
// ============================================================================

export type SessionQueryDTO = PaginationQueryType &
  DateRangeQueryType & {
    status?: SessionRecordStatus;
    groupId?: string;
  };

// ============================================================================
// Session Update DTOs
// ============================================================================

export type UpdateSessionActionType = 'CANCEL' | 'RESCHEDULE' | 'ATTENDANCE';

export interface SessionAttendanceUpdateDTO {
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface UpdateSessionActionDTO {
  action: UpdateSessionActionType;
  date?: ISODateOnlyString;
  time?: TimeMinutes;
  attendance?: SessionAttendanceUpdateDTO[];
}
