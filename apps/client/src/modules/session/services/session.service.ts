import { apiClient } from '@/services';
import {
  SessionQueryDTO,
  SessionSummaryDTO,
  SessionDetailsDTO,
  UpdateSessionActionDTO,
  UnifiedApiResponse
} from '@halaqa/shared';

export class SessionService {
  async getTodaySessions(): Promise<UnifiedApiResponse<SessionSummaryDTO[]>> {
    return apiClient.get<SessionSummaryDTO[]>('/sessions/today');
  }

  async getSessionDetails(
    id: string
  ): Promise<UnifiedApiResponse<SessionDetailsDTO>> {
    return apiClient.get<SessionDetailsDTO>(`/sessions/${id}`);
  }

  async querySessionHistory(
    query: SessionQueryDTO
  ): Promise<UnifiedApiResponse<SessionSummaryDTO[]>> {
    const params = new URLSearchParams();
    params.set('page', String(query.page ?? 1));
    params.set('limit', String(query.limit ?? 10));

    if (query.fromDate) {
      params.set('fromDate', query.fromDate);
    }
    if (query.toDate) {
      params.set('toDate', query.toDate);
    }
    if (query.groupId?.trim()) {
      params.set('groupId', query.groupId.trim());
    }
    if (query.status) {
      params.set('status', query.status);
    }

    return apiClient.get<SessionSummaryDTO[]>(
      `/sessions/history?${params.toString()}`
    );
  }

  async updateSession(
    id: string,
    payload: UpdateSessionActionDTO
  ): Promise<UnifiedApiResponse<SessionDetailsDTO>> {
    return apiClient.patch<SessionDetailsDTO>(`/sessions/${id}`, payload);
  }
}

export const sessionService = new SessionService();
