// ============================================================================
// DTOs (Public Types)
// ============================================================================

export type GroupStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED';

export interface ScheduleDay {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  time: string; // HH:mm format
  durationMinutes: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  tutorId: string;
  status: GroupStatus;
  scheduleDays: ScheduleDay[];
  students: string[]; // user IDs with STUDENT role
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
  tutorId: string;
  status?: GroupStatus;
  scheduleDays: ScheduleDay[];
}

export interface UpdateGroupDto {
  id: string;
  name?: string;
  description?: string;
  tutorId?: string;
  status?: GroupStatus;
  scheduleDays?: ScheduleDay[];
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
