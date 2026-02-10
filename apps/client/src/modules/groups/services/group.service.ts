import {
  Group,
  CreateGroupDto,
  UpdateGroupDto,
  ApiResponse,
  GroupStatus
} from '@halaqa/shared';
import {
  groups as mockGroups,
  students as mockStudents,
  users as mockUsers
} from '@/lib/mockData';

export class GroupService {
  async getAllGroups(): Promise<ApiResponse<Group[]>> {
    // Mock implementation - convert GroupWithSchedule to Group
    const groups: Group[] = mockGroups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      tutorId: g.tutorId,
      status: g.status,
      scheduleDays: g.scheduleDays,
      students: g.students,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    return Promise.resolve({
      success: true,
      data: groups
    });
  }

  async getGroupById(id: string): Promise<ApiResponse<Group>> {
    const group = mockGroups.find((g) => g.id === id);
    if (group) {
      const convertedGroup: Group = {
        id: group.id,
        name: group.name,
        description: group.description,
        tutorId: group.tutorId,
        status: group.status,
        scheduleDays: group.scheduleDays,
        students: group.students,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return Promise.resolve({
        success: true,
        data: convertedGroup
      });
    }
    return Promise.resolve({
      success: false,
      error: 'الحلقة غير موجودة'
    });
  }

  async createGroup(group: CreateGroupDto): Promise<ApiResponse<Group>> {
    const newGroup: Group = {
      id: `${mockGroups.length + 1}`,
      ...group,
      status: group.status || 'ACTIVE',
      students: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return Promise.resolve({
      success: true,
      data: newGroup
    });
  }

  async updateGroup(group: UpdateGroupDto): Promise<ApiResponse<Group>> {
    // Mock - would need proper conversion in real app
    const existingGroup = mockGroups.find((g) => g.id === group.id);
    if (!existingGroup) {
      return Promise.resolve({
        success: false,
        error: 'الحلقة غير موجودة'
      });
    }

    const updatedGroup: Group = {
      ...existingGroup,
      ...group,
      id: group.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return Promise.resolve({
      success: true,
      data: updatedGroup
    });
  }

  async deleteGroup(_id: string): Promise<ApiResponse<void>> {
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

  async updateGroupStatus(
    groupId: string,
    status: GroupStatus
  ): Promise<ApiResponse<Group>> {
    // Mock implementation - in real app would call API
    return new Promise((resolve) => {
      setTimeout(() => {
        const groupIndex = mockGroups.findIndex((g) => g.id === groupId);
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

        const convertedGroup: Group = {
          id: updatedGroup.id,
          name: updatedGroup.name,
          description: updatedGroup.description,
          tutorId: updatedGroup.tutorId,
          status: updatedGroup.status,
          scheduleDays: updatedGroup.scheduleDays,
          students: updatedGroup.students,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        resolve({
          success: true,
          data: convertedGroup
        });
      }, 300);
    });
  }
}

export const groupService = new GroupService();
