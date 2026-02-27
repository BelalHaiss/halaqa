import { apiClient } from '@/services';
import {
  UnifiedApiResponse,
  ChangeOwnPasswordDto,
  UpdateOwnProfileDto,
  UserAuthType
} from '@halaqa/shared';

export const userProfileService = {
  /**
   * Update current user profile
   */
  updateProfile: async (
    data: UpdateOwnProfileDto
  ): Promise<UnifiedApiResponse<UserAuthType>> => {
    return apiClient.patch<UserAuthType>('/user/me/profile', data);
  },

  /**
   * Change current user password
   */
  changePassword: async (
    data: ChangeOwnPasswordDto
  ): Promise<UnifiedApiResponse<void>> => {
    return apiClient.post<void>('/user/me/change-password', data);
  },

  /**
   * Get current user profile
   */
  getCurrentProfile: async (): Promise<UnifiedApiResponse<UserAuthType>> => {
    return apiClient.get<UserAuthType>('/user/me');
  }
};

export default userProfileService;
