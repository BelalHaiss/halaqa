// import { apiClient } from '@/services';
import { Group, CreateGroup, UpdateGroup, ApiResponse, GroupStatus } from '@halaqa/shared';
import {
  groups as mockGroups,
  students as mockStudents,
  users as mockUsers
} from '@/lib/mockData';

export class GroupService {
  async getAllGroups(): Promise<ApiResponse<Group[]>> {
    // return apiClient.get('/groups');

    // Mock implementation
    return Promise.resolve({
      success: true,
      data: mockGroups as Group[]
    });
  }

  async getGroupById(id: string): Promise<ApiResponse<Group>> {
    // return apiClient.get(`/groups/${id}`);

    const group = mockGroups.find((g) => g.id === id);
    if (group) {
      return Promise.resolve({
        success: true,
        data: group as Group
      });
    }
    return Promise.resolve({
      success: false,
      error: 'الحلقة غير موجودة'
    });
  }

  async createGroup(group: CreateGroup): Promise<ApiResponse<Group>> {
    // return apiClient.post('/groups', group);

    const newGroup: Group = {
      id: `${mockGroups.length + 1}`,
      ...group,
      students: []
    };

    return Promise.resolve({
      success: true,
      data: newGroup
    });
  }

  async updateGroup(group: UpdateGroup): Promise<ApiResponse<Group>> {
    // return apiClient.put(`/groups/${group.id}`, group);

    return Promise.resolve({
      success: true,
      data: group as Group
    });
  }

  async deleteGroup(_id: string): Promise<ApiResponse<void>> {
    // return apiClient.delete(`/groups/${id}`);

    return Promise.resolve({
      success: true
    });
  }

  async getGroupStudents(groupId: string) {
    const group = mockGroups.find((g) => g.id === groupId);
    if (!group) return [];

    return mockStudents.filter((s) => group.students.includes(s.id));
  }

  async getGroupTutor(tutorId: string) {
    return mockUsers.find((u) => u.id === tutorId);
  }
  
  async updateGroupStatus(groupId: string, status: GroupStatus): Promise<ApiResponse<Group>> {
    // Mock implementation - in real app would call API
    return new Promise((resolve) => {
      setTimeout(() => {
        const groupIndex = mockGroups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) {
          resolve({ 
            success: false, 
            error: 'الحلقة غير موجودة' 
          });
          return;
        }
        
        // Update the group status
        const updatedGroup = { ...mockGroups[groupIndex], status };
        mockGroups[groupIndex] = updatedGroup;
        
        resolve({
          success: true,
          data: updatedGroup as Group
        });
      }, 300);
    });
  }
}

export const groupService = new GroupService();
