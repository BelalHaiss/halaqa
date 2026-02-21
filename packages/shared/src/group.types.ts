// ============================================================================
// DTOs (Public Types)
// ============================================================================

import { DayOfWeek, MinutesFromMidnight } from './types/api.types';

export type GroupStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED';

export interface GroupScheduleDay {
  dayOfWeek: DayOfWeek;
  startMinutes: MinutesFromMidnight;
  durationMinutes: number;
}

export interface CountDto {
  count: number;
}

export interface GroupTutorSummaryDto {
  id: string;
  name: string;
}

export interface GroupSelectOptionDto {
  name: string;
  value: string;
}

export interface GroupStudentSummaryDto {
  id: string;
  name: string;
  timezone: string;
  notes?: string;
}

export interface GroupSummaryDto {
  id: string;
  name: string;
  description?: string;
  tutorId: string;
  timezone: string;
  status: GroupStatus;
  scheduleDays: GroupScheduleDay[];
  studentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupDetailsDto {
  id: string;
  name: string;
  description?: string;
  tutorId: string;
  tutor: GroupTutorSummaryDto;
  timezone: string;
  status: GroupStatus;
  scheduleDays: GroupScheduleDay[];
  students: GroupStudentSummaryDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
  tutorId: string;
  timezone: string;
  status?: GroupStatus;
  scheduleDays: GroupScheduleDay[];
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  tutorId?: string;
  timezone?: string;
  status?: GroupStatus;
  scheduleDays?: GroupScheduleDay[];
}

export interface UpdateGroupSettingsDto {
  status?: GroupStatus;
  scheduleDays?: GroupScheduleDay[];
}
