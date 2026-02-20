import { SessionComputedStatus, AttendanceStatus } from '@halaqa/shared';

interface SessionStatusConfig {
  label: string;
  variant: 'solid' | 'ghost' | 'outline' | 'soft';
  color: 'primary' | 'success' | 'danger' | 'muted';
}

export const SESSION_STATUS_CONFIG: Record<
  SessionComputedStatus,
  SessionStatusConfig
> = {
  SCHEDULED: { label: 'مجدولة', variant: 'soft', color: 'primary' },
  COMPLETED: { label: 'مكتملة', variant: 'soft', color: 'success' },
  RESCHEDULED: { label: 'معاد جدولتها', variant: 'soft', color: 'muted' },
  CANCELED: { label: 'ملغية', variant: 'soft', color: 'danger' },
  MISSED: { label: 'فائتة', variant: 'soft', color: 'danger' }
};

export const getSessionStatusConfig = (
  status: SessionComputedStatus
): SessionStatusConfig => {
  return SESSION_STATUS_CONFIG[status];
};

interface AttendanceStatusConfig {
  label: string;
  variant: 'solid' | 'ghost' | 'outline' | 'soft';
  color: 'primary' | 'success' | 'danger' | 'muted';
}

export const ATTENDANCE_STATUS_CONFIG: Record<
  AttendanceStatus,
  AttendanceStatusConfig
> = {
  ATTENDED: { label: 'حضر', variant: 'soft', color: 'success' },
  MISSED: { label: 'غاب', variant: 'soft', color: 'danger' },
  EXCUSED: { label: 'معذور', variant: 'soft', color: 'muted' }
};

export const getAttendanceStatusConfig = (
  status: AttendanceStatus
): AttendanceStatusConfig => {
  return ATTENDANCE_STATUS_CONFIG[status];
};
