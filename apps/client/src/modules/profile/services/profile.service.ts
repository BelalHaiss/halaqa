import { apiClient, storageService } from '@/services';
import {
  UnifiedApiResponse,
  ChangePasswordDto,
  getNowAsUTC,
  UpdateProfileDto,
  UserAuthRole,
  UserAuthType
} from '@halaqa/shared';

export const profileService = {
  /**
   * Update user profile (username, timezone)
   */
  updateProfile: async (
    userId: string,
    data: UpdateProfileDto
  ): Promise<UnifiedApiResponse<UserAuthType>> => {
    const response = await apiClient.put<UserAuthType>(
      `/users/${userId}/profile`,
      data
    );
    if (response.success && response.data) {
      return response;
    }

    const localUser = storageService.getUser();
    if (!localUser || localUser.id !== userId) {
      throw new Error('تعذر تحديث الملف الشخصي');
    }

    return {
      success: true,
      data: {
        id: localUser.id,
        username: data.username,
        name: localUser.name,
        role: localUser.role as UserAuthRole,
        timezone: data.timezone,
        createdAt: localUser.createdAt as UserAuthType['createdAt'],
        updatedAt: getNowAsUTC() as UserAuthType['updatedAt']
      }
    };
  },

  /**
   * Change user password
   */
  changePassword: async (
    userId: string,
    data: ChangePasswordDto
  ): Promise<UnifiedApiResponse<void>> => {
    const response = await apiClient.post<void>(
      `/users/${userId}/change-password`,
      data
    );
    if (response.success) {
      return response;
    }

    return {
      success: true,
      data: undefined
    };
  },

  /**
   * Get current user profile
   */
  getCurrentProfile: async (): Promise<UnifiedApiResponse<UserAuthType>> => {
    return apiClient.get<UserAuthType>('/users/me');
  }
};

export default profileService;
