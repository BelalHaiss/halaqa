import { DashboardStats, ApiResponse } from '@halaqa/shared';

export class DashboardService {
  async getStats(
    _userId: string,
    userRole: string
  ): Promise<ApiResponse<DashboardStats>> {
    // Mock implementation
    return Promise.resolve({
      success: true,
      data: {
        totalGroups:
          userRole === 'admin' ? 8 : userRole === 'moderator' ? 5 : 2,
        totalStudents:
          userRole === 'admin' ? 45 : userRole === 'moderator' ? 30 : 12,
        totalSessions:
          userRole === 'admin' ? 120 : userRole === 'moderator' ? 80 : 45,
        todaySessions:
          userRole === 'admin' ? 3 : userRole === 'moderator' ? 2 : 1,
        studentsNeedingFollowUp:
          userRole === 'admin' ? 8 : userRole === 'moderator' ? 5 : 3
      }
    });
  }
}

export const dashboardService = new DashboardService();
