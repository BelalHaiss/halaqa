import { apiClient } from '@/services';
import { GroupReportDTO, ReportQueryDTO, UnifiedApiResponse } from '@halaqa/shared';

export class ReportService {
  async getGroupReport(query: ReportQueryDTO): Promise<UnifiedApiResponse<GroupReportDTO>> {
    const params = new URLSearchParams({
      groupId: query.groupId,
      fromDate: query.fromDate,
      toDate: query.toDate,
    });

    return apiClient.get<GroupReportDTO>(`/reports/group?${params.toString()}`);
  }
}

export const reportService = new ReportService();
