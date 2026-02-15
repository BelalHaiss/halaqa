// ============================================================================
// DTOs (Public Types)
// ============================================================================

import { AttendanceStatus } from './attendance.types';
import {
  ISODateOnlyString,
  ISODateString,
  TimeHHMMString,
} from './types/api.types';

export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED';

export interface Session {
  id: string;
  groupId: string;
  date: ISODateOnlyString; // Calendar date in YYYY-MM-DD
  time: TimeHHMMString; // 24-hour time in HH:mm
  status: SessionStatus;
  notes?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateSessionDto {
  groupId: string;
  date: ISODateOnlyString; // Calendar date in YYYY-MM-DD
  time: TimeHHMMString; // 24-hour time in HH:mm
  notes?: string;
}

export interface UpdateSessionDto {
  id: string;
  date?: ISODateOnlyString;
  time?: TimeHHMMString;
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
// Session Calendar / Attendance Flow DTOs
// ============================================================================

export type SessionRecordStatus =
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELED'
  | 'MISSED';

export type SessionComputedStatus = SessionRecordStatus | 'SCHEDULED';

export interface SessionSummaryDTO {
  id: string;
  groupName: string;
  tutorName: string;
  date: ISODateOnlyString; // Calendar date in YYYY-MM-DD
  time: TimeHHMMString; // 24-hour time in HH:mm
  sessionStatus: SessionComputedStatus;
}

export interface SessionDetailsDTO {
  id: string;
  groupInfo: {
    id: string;
    name: string;
  };
  tutorInfo: {
    id: string;
    name: string;
  };
  status: SessionComputedStatus;
  canBeRescheduled: boolean;
  date: ISODateOnlyString; // Calendar date in YYYY-MM-DD
  time: TimeHHMMString; // 24-hour time in HH:mm
  originalStartedAt: ISODateString | null;
  students: {
    id: string;
    name: string;
  }[];
  attendance: {
    studentId: string;
    studentName: string;
    status: AttendanceStatus;
    notes?: string;
  }[];
}

export type UpdateSessionActionType = 'CANCEL' | 'RESCHEDULE' | 'ATTENDANCE';

export interface SessionAttendanceUpdateDTO {
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface UpdateSessionActionDTO {
  action: UpdateSessionActionType;
  date?: ISODateOnlyString;
  time?: TimeHHMMString;
  attendance?: SessionAttendanceUpdateDTO[];
}
