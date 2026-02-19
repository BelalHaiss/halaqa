import { apiClient } from '@/services';
import {
  UnifiedApiResponse,
  AuthResponseDto,
  LoginCredentialsDto
} from '@halaqa/shared';

export const authService = {
  login: async (
    credentials: LoginCredentialsDto
  ): Promise<UnifiedApiResponse<AuthResponseDto>> => {
    return apiClient.post<AuthResponseDto>('/auth/login', credentials);
  },

  logout: async (): Promise<void> => {
    return Promise.resolve();
  }
};

export default authService;
