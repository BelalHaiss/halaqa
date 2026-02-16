import {
  UnifiedApiResponse,
  CreateGroupDto,
  getNowAsUTC,
  Group,
  GroupStatus,
  UpdateGroupDto
} from '@halaqa/shared';
import {
  groups as mockGroups,
  students as mockStudents,
  users as mockUsers
} from '@/lib/mockData';

export class GroupService {
  async getAllGroups(): Promise<UnifiedApiResponse<Group[]>> {
    const now = getNowAsUTC();

    // Mock implementation - convert GroupWithSchedule to Group
    const groups: Group[] = mockGroups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      tutorId: g.tutorId,
      timezone: g.timezone,
      status: g.status,
      scheduleDays: g.scheduleDays,
      students: g.students,
      createdAt: now,
      updatedAt: now
    }));

    return Promise.resolve({
      success: true,
      data: groups
    });
  }

  async getGroupById(id: string): Promise<UnifiedApiResponse<Group>> {
    const now = getNowAsUTC();
    const group = mockGroups.find((g) => g.id === id);
    if (!group) {
      throw new Error('الحلقة غير موجودة');
    }

    const convertedGroup: Group = {
      id: group.id,
      name: group.name,
      description: group.description,
      tutorId: group.tutorId,
      timezone: group.timezone,
      status: group.status,
      scheduleDays: group.scheduleDays,
      students: group.students,
      createdAt: now,
      updatedAt: now
    };
    return Promise.resolve({
      success: true,
      data: convertedGroup
    });
  }

  async createGroup(group: CreateGroupDto): Promise<UnifiedApiResponse<Group>> {
    const now = getNowAsUTC();

    const newGroup: Group = {
      id: `${mockGroups.length + 1}`,
      ...group,
      status: group.status || 'ACTIVE',
      students: [],
      createdAt: now,
      updatedAt: now
    };

    return Promise.resolve({
      success: true,
      data: newGroup
    });
  }

  async updateGroup(group: UpdateGroupDto): Promise<UnifiedApiResponse<Group>> {
    const now = getNowAsUTC();

    // Mock - would need proper conversion in real app
    const existingGroup = mockGroups.find((g) => g.id === group.id);
    if (!existingGroup) {
      throw new Error('الحلقة غير موجودة');
    }

    const updatedGroup: Group = {
      ...existingGroup,
      ...group,
      id: group.id,
      timezone: group.timezone || existingGroup.timezone,
      createdAt: now,
      updatedAt: now
    };

    return Promise.resolve({
      success: true,
      data: updatedGroup
    });
  }

  async deleteGroup(_id: string): Promise<UnifiedApiResponse<void>> {
    return Promise.resolve({
      success: true,
      data: undefined
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
  ): Promise<UnifiedApiResponse<Group>> {
    const now = getNowAsUTC();

    // Mock implementation - in real app would call API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const groupIndex = mockGroups.findIndex((g) => g.id === groupId);
        if (groupIndex === -1) {
          reject(new Error('الحلقة غير موجودة'));
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
          timezone: updatedGroup.timezone,
          status: updatedGroup.status,
          scheduleDays: updatedGroup.scheduleDays,
          students: updatedGroup.students,
          createdAt: now,
          updatedAt: now
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
