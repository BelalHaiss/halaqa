// ============================================================================
// DTOs (Public Types)
// ============================================================================

export type GroupStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED';

export interface GroupScheduleDay {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startMinutes: number; // minutes from midnight in group timezone
  durationMinutes: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  tutorId: string;
  timezone: string; // IANA timezone
  status: GroupStatus;
  scheduleDays: GroupScheduleDay[];
  students: string[]; // user IDs with STUDENT role
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
  id: string;
  name?: string;
  description?: string;
  tutorId?: string;
  timezone?: string;
  status?: GroupStatus;
  scheduleDays?: GroupScheduleDay[];
}

export interface AddStudentToGroupDto {
  groupId: string;
  userId: string;
}

export interface RemoveStudentFromGroupDto {
  groupId: string;
  userId: string;
}

export interface GroupFilterDto {
  status?: GroupStatus;
  tutorId?: string;
  search?: string;
}
