import { apiClient } from '@/services';
import {
  CreateStaffUserDto,
  StaffUserDto,
  StaffUsersResponseDto,
  UnifiedApiResponse,
  UpdateStaffUserDto,
} from '@halaqa/shared';

export const userService = {
  getStaffUsers: async (): Promise<UnifiedApiResponse<StaffUsersResponseDto>> =>
    apiClient.get<StaffUsersResponseDto>('/user/staff'),

  createStaffUser: async (data: CreateStaffUserDto): Promise<UnifiedApiResponse<StaffUserDto>> =>
    apiClient.post<StaffUserDto>('/user/staff', data),

  updateStaffUser: async (
    id: string,
    data: UpdateStaffUserDto
  ): Promise<UnifiedApiResponse<StaffUserDto>> =>
    apiClient.patch<StaffUserDto>(`/user/staff/${id}`, data),

  deleteStaffUser: async (id: string): Promise<UnifiedApiResponse<null>> => {
    await apiClient.delete<void>(`/user/staff/${id}`);
    return {
      success: true,
      data: null,
    };
  },
};
