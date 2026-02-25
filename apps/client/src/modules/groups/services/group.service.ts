import { apiClient } from '@/services';
import {
  AddLearnersToGroupDto,
  CountDto,
  CreateLearnerDto,
  CreateGroupDto,
  GroupDetailsDto,
  GroupSelectOptionDto,
  GroupSummaryDto,
  GroupTutorSummaryDto,
  LearnerDto,
  QueryLearnersDto,
  UnifiedApiResponse,
  UpdateGroupDto,
  UpdateGroupSettingsDto
} from '@halaqa/shared';

export class GroupService {
  async getAllGroups(): Promise<UnifiedApiResponse<GroupSummaryDto[]>> {
    return apiClient.get<GroupSummaryDto[]>('/groups');
  }

  async getTutors(): Promise<UnifiedApiResponse<GroupTutorSummaryDto[]>> {
    return apiClient.get<GroupTutorSummaryDto[]>('/groups/tutors');
  }

  async getGroupOptions(): Promise<UnifiedApiResponse<GroupSelectOptionDto[]>> {
    return apiClient.get<GroupSelectOptionDto[]>('/groups/options');
  }

  async getGroupById(id: string): Promise<UnifiedApiResponse<GroupDetailsDto>> {
    return apiClient.get<GroupDetailsDto>(`/groups/${id}`);
  }

  async createGroup(
    group: CreateGroupDto
  ): Promise<UnifiedApiResponse<GroupDetailsDto>> {
    return apiClient.post<GroupDetailsDto>('/groups', group);
  }

  async updateGroup(
    groupId: string,
    group: UpdateGroupDto
  ): Promise<UnifiedApiResponse<GroupDetailsDto>> {
    return apiClient.patch<GroupDetailsDto>(`/groups/${groupId}`, group);
  }

  async updateGroupSettings(
    groupId: string,
    group: UpdateGroupSettingsDto
  ): Promise<UnifiedApiResponse<GroupDetailsDto>> {
    return apiClient.patch<GroupDetailsDto>(`/groups/${groupId}`, group);
  }

  async createLearnerAndAddToGroup(
    groupId: string,
    dto: CreateLearnerDto
  ): Promise<UnifiedApiResponse<GroupDetailsDto>> {
    return apiClient.post<GroupDetailsDto>(
      `/groups/${groupId}/students/create`,
      dto
    );
  }

  async addExistingLearnersToGroup(
    groupId: string,
    dto: AddLearnersToGroupDto
  ): Promise<UnifiedApiResponse<GroupDetailsDto>> {
    return apiClient.post<GroupDetailsDto>(`/groups/${groupId}/students/attach`, dto);
  }

  async removeStudentFromGroup(
    groupId: string,
    userId: string
  ): Promise<UnifiedApiResponse<null>> {
    await apiClient.delete<void>(`/groups/${groupId}/students/${userId}`);
    return {
      success: true,
      data: null
    };
  }

  async getLearnersCount(): Promise<UnifiedApiResponse<CountDto>> {
    return apiClient.get<CountDto>('/user/stats/learners-count');
  }

  async getTutorsCount(): Promise<UnifiedApiResponse<CountDto>> {
    return apiClient.get<CountDto>('/user/stats/tutors-count');
  }

  async getGroupsCount(): Promise<UnifiedApiResponse<CountDto>> {
    return apiClient.get<CountDto>('/groups/stats/groups-count');
  }

  async queryLearners(
    query: QueryLearnersDto
  ): Promise<UnifiedApiResponse<LearnerDto[]>> {
    const params = new URLSearchParams();
    params.set('page', String(query.page ?? 1));
    params.set('limit', String(query.limit ?? 10));
    if (query.search?.trim()) {
      params.set('search', query.search.trim());
    }

    return apiClient.get<LearnerDto[]>(`/user/learner?${params.toString()}`);
  }
}

export const groupService = new GroupService();
