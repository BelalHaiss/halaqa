import { z } from 'zod';

// API Response types
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

// Query params
export const PaginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10)
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

// Filter and Sort
export interface FilterParams {
  [key: string]: any;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

// Date range
export const DateRangeSchema = z.object({
  from: z.string(),
  to: z.string()
});

export type DateRange = z.infer<typeof DateRangeSchema>;

// Statistics
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

// View modes
export type ViewMode = 'list' | 'grid' | 'calendar';

// Loading and error states
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}
