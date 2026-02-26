import type { ClientErrorLogDto, ClientErrorLogResponseDto } from '@halaqa/shared';
import { apiClient } from '@/services';

class ObservabilityService {
  reportClientError(payload: ClientErrorLogDto) {
    return apiClient.post<ClientErrorLogResponseDto>('/observability/client-errors', payload);
  }
}

export const observabilityService = new ObservabilityService();
