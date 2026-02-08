// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Query & Filter Types
// ============================================================================

export interface PaginationParamsDto {
  page: number;
  pageSize: number;
}

export interface FilterParams {
  [key: string]: any;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface DateRangeDto {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface DashboardStats {
  totalGroups: number;
  totalStudents: number;
  totalSessions: number;
  todaySessions: number;
  studentsNeedingFollowUp: number;
}

export interface GroupStats {
  groupId: string;
  totalStudents: number;
  averageAttendance: number;
  totalSessions: number;
}

// ============================================================================
// UI State Types
// ============================================================================

export type ViewMode = 'list' | 'grid' | 'calendar';

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}
