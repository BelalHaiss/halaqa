import { apiClient } from '@/services';
import {
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

  async updateSession(
    id: string,
    payload: UpdateSessionActionDTO
  ): Promise<UnifiedApiResponse<SessionDetailsDTO>> {
    return apiClient.patch<SessionDetailsDTO>(`/sessions/${id}`, payload);
  }
}

export const sessionService = new SessionService();
