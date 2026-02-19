import {
  CountDto,
  CreateGroupDto,
  GroupDetailsDto,
  GroupSummaryDto,
  User,
} from '@halaqa/shared';
import { toast } from 'sonner';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryClient, queryKeys } from '@/lib/query-client';
import { groupService } from '../services/group.service';

export const useGroupsViewModel = (currentUser: User) => {
  const canManageGroups =
    currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR';

  const groupsQuery = useApiQuery<GroupSummaryDto[]>({
    queryKey: queryKeys.groups.list({
      userId: currentUser.id,
      role: currentUser.role,
    }),
    queryFn: async () => groupService.getAllGroups(),
  });

  const groupsCountQuery = useApiQuery<CountDto>({
    queryKey: [...queryKeys.groups.all, 'stats', 'groups-count'] as const,
    queryFn: async () => groupService.getGroupsCount(),
  });

  const learnersCountQuery = useApiQuery<CountDto>({
    queryKey: [...queryKeys.groups.all, 'stats', 'learners-count'] as const,
    queryFn: async () => groupService.getLearnersCount(),
  });

  const tutorsCountQuery = useApiQuery<CountDto>({
    queryKey: [...queryKeys.groups.all, 'stats', 'tutors-count'] as const,
    queryFn: async () => groupService.getTutorsCount(),
    enabled: currentUser.role !== 'TUTOR',
  });

  const tutorsQuery = useApiQuery<{ id: string; name: string }[]>({
    queryKey: [...queryKeys.groups.all, 'tutors'] as const,
    queryFn: async () => groupService.getTutors(),
    enabled: canManageGroups,
  });

  const createGroupMutation = useApiMutation<CreateGroupDto, GroupDetailsDto>({
    mutationFn: async (group) => groupService.createGroup(group),
    onSuccess: async () => {
      toast.success('تم إضافة الحلقة بنجاح');
      await queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
    onError: (error) => {
      toast.error(error.message || 'فشل إضافة الحلقة');
    },
  });

  const createGroup = async (group: CreateGroupDto) => {
    if (!canManageGroups) {
      throw new Error('غير مصرح لك بتنفيذ العملية');
    }

    await createGroupMutation.mutateAsync(group);
  };

  return {
    canManageGroups,
    groups: groupsQuery.data?.data ?? [],
    groupsError: groupsQuery.error?.message ?? null,
    isLoadingGroups: groupsQuery.isPending,

    groupsCount: groupsCountQuery.data?.data?.count ?? 0,
    learnersCount: learnersCountQuery.data?.data?.count ?? 0,
    tutorsCount: tutorsCountQuery.data?.data?.count ?? 0,
    isLoadingGroupsCount: groupsCountQuery.isPending,
    isLoadingLearnersCount: learnersCountQuery.isPending,
    isLoadingTutorsCount: tutorsCountQuery.isPending,

    tutors: tutorsQuery.data?.data ?? [],
    isLoadingTutors: tutorsQuery.isPending,

    createGroup,
    isCreatingGroup: createGroupMutation.isPending,
  };
};
