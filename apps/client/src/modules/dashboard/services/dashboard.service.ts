import { UnifiedApiResponse } from '@halaqa/shared';

export interface DashboardStats {
  totalGroups: number;
  totalStudents: number;
  totalSessions: number;
  todaySessions: number;
  studentsNeedingFollowUp: number;
}

export class DashboardService {
  async getStats(
    _userId: string,
    userRole: string
  ): Promise<UnifiedApiResponse<DashboardStats>> {
    const normalizedRole = userRole.toUpperCase();

    // Mock implementation
    return Promise.resolve({
      success: true,
      data: {
        totalGroups:
          normalizedRole === 'ADMIN'
            ? 8
            : normalizedRole === 'MODERATOR'
              ? 5
              : 2,
        totalStudents:
          normalizedRole === 'ADMIN'
            ? 45
            : normalizedRole === 'MODERATOR'
              ? 30
              : 12,
        totalSessions:
          normalizedRole === 'ADMIN'
            ? 120
            : normalizedRole === 'MODERATOR'
              ? 80
              : 45,
        todaySessions:
          normalizedRole === 'ADMIN'
            ? 3
            : normalizedRole === 'MODERATOR'
              ? 2
              : 1,
        studentsNeedingFollowUp:
          normalizedRole === 'ADMIN'
            ? 8
            : normalizedRole === 'MODERATOR'
              ? 5
              : 3
      }
    });
  }
}

export const dashboardService = new DashboardService();
