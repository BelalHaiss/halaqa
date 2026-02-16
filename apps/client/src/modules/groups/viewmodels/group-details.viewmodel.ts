import { Group, User as UserType } from '@halaqa/shared';
import { toast } from 'sonner';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryClient, queryKeys } from '@/lib/query-client';
import { StudentUser } from '@/lib/mockData';
import { groupService } from '../services/group.service';

export const useGroupDetailsViewModel = (groupId: string) => {
  const groupQuery = useApiQuery<Group>({
    queryKey: queryKeys.groups.detail(groupId),
    enabled: Boolean(groupId),
    queryFn: async () => {
      return groupService.getGroupById(groupId);
    }
  });

  const studentsQuery = useApiQuery<StudentUser[]>({
    queryKey: [...queryKeys.groups.detail(groupId), 'students'] as const,
    enabled: Boolean(groupId),
    queryFn: async () => ({
      success: true,
      data: await groupService.getGroupStudents(groupId)
    })
  });

  const tutorId = groupQuery.data?.data?.tutorId;
  const tutorQuery = useApiQuery<UserType | null>({
    queryKey: [...queryKeys.groups.detail(groupId), 'tutor', tutorId] as const,
    enabled: Boolean(groupId && tutorId),
    queryFn: async () => ({
      success: true,
      data: tutorId
        ? ((await groupService.getGroupTutor(tutorId)) ?? null)
        : null
    })
  });

  const updateGroupMutation = useApiMutation<
    Partial<Group> & { id: string },
    Group
  >({
    mutationFn: async (payload) => {
      return groupService.updateGroup(payload);
    },
    onSuccess: async () => {
      toast.success('تم تحديث الحلقة بنجاح');
      await queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
    onError: (error) => {
      toast.error(error.message || 'فشل تحديث الحلقة');
    }
  });

  const updateGroup = async (updatedGroup: Partial<Group> & { id: string }) => {
    try {
      await updateGroupMutation.mutateAsync(updatedGroup);
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'فشل تحديث الحلقة'
      };
    }
  };

  return {
    group: groupQuery.data?.data ?? null,
    students: studentsQuery.data?.data ?? [],
    tutor: tutorQuery.data?.data ?? null,
    isLoading:
      groupQuery.isPending || studentsQuery.isPending || tutorQuery.isPending,
    error:
      groupQuery.error?.message ||
      studentsQuery.error?.message ||
      tutorQuery.error?.message ||
      null,
    updateGroup,
    refreshGroup: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(groupId)
      })
  };
};
