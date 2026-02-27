import { AttendanceStatus, SessionStatus } from 'generated/prisma/client';

export const SEED_NUMBER = 2032110;
export const TOTAL_TUTORS = 6;
export const TOTAL_LEARNERS = 40;
export const TOTAL_GROUPS = 12;
export const MAX_SESSION_DAYS_LOOKBACK = 70;

export const SESSION_STATUS_WEIGHTS: SessionStatus[] = [
  'COMPLETED',
  'COMPLETED',
  'COMPLETED',
  'COMPLETED',
  'RESCHEDULED',
  'MISSED',
  'CANCELED',
];

export const ATTENDANCE_STATUS_WEIGHTS: AttendanceStatus[] = [
  'ATTENDED',
  'ATTENDED',
  'ATTENDED',
  'ATTENDED',
  'EXCUSED',
  'MISSED',
];
