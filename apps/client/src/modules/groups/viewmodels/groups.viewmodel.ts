import { useState } from 'react';
import { CreateGroupDto, Group, GroupStatus, User } from '@halaqa/shared';
import { toast } from 'sonner';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryClient, queryKeys } from '@/lib/query-client';
import { groupService } from '../services/group.service';

export const useGroupsViewModel = (currentUser: User) => {
  const [searchQuery, setSearchQueryState] = useState('');

  const groupsQuery = useApiQuery<Group[]>({
    queryKey: queryKeys.groups.list({
      userId: currentUser.id,
      role: currentUser.role
    }),
    queryFn: async () => {
      const response = await groupService.getAllGroups();
      const groups = response.data;

      const filteredGroups =
        currentUser.role === 'TUTOR'
          ? groups.filter((group) => group.tutorId === currentUser.id)
          : groups;

      return {
        success: true,
        data: filteredGroups
      };
    }
  });

  const createGroupMutation = useApiMutation<CreateGroupDto, Group>({
    mutationFn: async (group) => {
      return groupService.createGroup(group);
    },
    onSuccess: async () => {
      toast.success('تم إضافة الحلقة بنجاح');
      await queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
    onError: (error) => {
      toast.error(error.message || 'فشل إضافة الحلقة');
    }
  });

  const deleteGroupMutation = useApiMutation<string, void>({
    mutationFn: async (id) => {
      return groupService.deleteGroup(id);
    },
    onSuccess: async () => {
      toast.success('تم حذف الحلقة بنجاح');
      await queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
    onError: (error) => {
      toast.error(error.message || 'فشل حذف الحلقة');
    }
  });

  const updateGroupStatusMutation = useApiMutation<
    { groupId: string; status: GroupStatus },
    Group
  >({
    mutationFn: async ({ groupId, status }) => {
      return groupService.updateGroupStatus(groupId, status);
    },
    onSuccess: async () => {
      toast.success('تم تحديث حالة الحلقة بنجاح');
      await queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
    onError: (error) => {
      toast.error(error.message || 'فشل تحديث حالة الحلقة');
    }
  });

  const setSearchQuery = (value: string) => {
    setSearchQueryState(value);
  };

  const createGroup = async (group: CreateGroupDto) => {
    try {
      await createGroupMutation.mutateAsync(group);
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'فشل إضافة الحلقة'
      };
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      await deleteGroupMutation.mutateAsync(id);
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'فشل حذف الحلقة'
      };
    }
  };

  const updateGroupStatus = async (groupId: string, status: GroupStatus) => {
    try {
      await updateGroupStatusMutation.mutateAsync({ groupId, status });
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'فشل تحديث حالة الحلقة'
      };
    }
  };

  const groups = groupsQuery.data?.data ?? [];
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    groups: filteredGroups,
    isLoading: groupsQuery.isPending,
    isRefreshing: groupsQuery.isFetching,
    error: groupsQuery.error?.message ?? null,
    searchQuery,
    setSearchQuery,
    createGroup,
    deleteGroup,
    updateGroupStatus,
    refreshGroups: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all }),
    isUpdatingGroupStatus: updateGroupStatusMutation.isPending
  };
};
