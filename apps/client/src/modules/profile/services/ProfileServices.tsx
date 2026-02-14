import { apiClient } from "@/services";
import { ApiResponse, UserAuthType } from "@halaqa/shared";

export interface UpdateProfileDto {
  username: string;
  timezone: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  /**
   * Update user profile (username, timezone)
   */
  updateProfile: async (
    userId: string,
    data: UpdateProfileDto,
  ): Promise<ApiResponse<UserAuthType>> => {
    return apiClient.put<UserAuthType>(`/users/${userId}/profile`, data);
  },

  /**
   * Change user password
   */
  changePassword: async (
    userId: string,
    data: ChangePasswordDto,
  ): Promise<ApiResponse<void>> => {
    return apiClient.post<void>(`/users/${userId}/change-password`, data);
  },

  /**
   * Get current user profile
   */
  getCurrentProfile: async (): Promise<ApiResponse<UserAuthType>> => {
    return apiClient.get<UserAuthType>("/users/me");
  },
};

export default profileService;
