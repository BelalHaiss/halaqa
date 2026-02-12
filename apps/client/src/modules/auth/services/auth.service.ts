import { apiClient } from "@/services";
import {
  ApiResponse,
  AuthResponseDto,
  LoginCredentialsDto,
} from "@halaqa/shared";

export const authService = {
  login: async (
    credentials: LoginCredentialsDto,
  ): Promise<ApiResponse<AuthResponseDto>> => {
    return apiClient.post<AuthResponseDto>("/auth/login", credentials);
  },

  logout: async (): Promise<void> => {
    return Promise.resolve();
  },
};

export default authService;
