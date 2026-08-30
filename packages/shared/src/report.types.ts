import { AttendanceStatus } from './attendance.types';
import { GroupStatus } from './group.types';
import { SessionRecordStatus } from './session.types';
import { ISODateOnlyString, ISODateString } from './types/api.types';

// ============================================================================
// Report Query DTOs
// ============================================================================

export interface ReportQueryDTO {
  groupId: string;
  fromDate: ISODateOnlyString;
  toDate: ISODateOnlyString;
}

// ============================================================================
// Report DTOs
// ============================================================================

export interface ReportSessionAttendanceDTO {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface ReportSessionDTO {
  id: string;
  startedAt: ISODateString;
  status: SessionRecordStatus;
  attendance: ReportSessionAttendanceDTO[];
}

export interface ReportLearnerDTO {
  id: string;
  name: string;
  joinedAt: ISODateString;
  leftAt: ISODateString | null;
}

export interface GroupReportDTO {
  group: { id: string; name: string; timezone: string; status: GroupStatus };
  tutor: { id: string; name: string } | null;
  learners: ReportLearnerDTO[];
  sessions: ReportSessionDTO[];
  period: { fromDate: ISODateOnlyString; toDate: ISODateOnlyString };
}
