import { useMemo, useState } from 'react';
import {
  AddLearnersToGroupDto,
  CreateLearnerDto,
  GroupDetailsDto,
  GroupStudentSummaryDto,
  GroupTutorSummaryDto,
  LearnerDto,
  UpdateGroupDto,
  UpdateGroupSettingsDto,
  UpdateLearnerDto,
  User
} from '@halaqa/shared';
import { toast } from 'sonner';
import {
  StudentMainInfoMode,
  StudentMainInfoSubmitArgs
} from '@/modules/learners/components/student-main-info-modal';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryClient, queryKeys } from '@/lib/query-client';
import { learnerService } from '@/modules/learners';
import { groupService } from '../services/group.service';

type UseGroupDetailsViewModelOptions = {
  shouldLoadTutors: boolean;
};

export const useGroupDetailsViewModel = (
  groupId: string,
  user: User,
  options: UseGroupDetailsViewModelOptions
) => {
  const canManageGroup = user.role === 'ADMIN' || user.role === 'MODERATOR';
  const canEditLearner =
    user.role === 'ADMIN' || user.role === 'MODERATOR' || user.role === 'TUTOR';
  const [isLearnerModalOpen, setIsLearnerModalOpen] = useState(false);
  const [isAddLearnersModalOpen, setIsAddLearnersModalOpen] = useState(false);
  const [learnerModalMode, setLearnerModalMode] =
    useState<StudentMainInfoMode>('view');
  const [selectedLearner, setSelectedLearner] =
    useState<GroupStudentSummaryDto | null>(null);

  const groupQuery = useApiQuery<GroupDetailsDto>({
    queryKey: queryKeys.groups.detail(groupId),
    enabled: Boolean(groupId),
    queryFn: async () => groupService.getGroupById(groupId)
  });

  const tutorsQuery = useApiQuery<GroupTutorSummaryDto[]>({
    queryKey: queryKeys.groups.tutors(),
    queryFn: async () => groupService.getTutors(),
    enabled: canManageGroup && options.shouldLoadTutors
  });

  const learnersQuery = useApiQuery<LearnerDto[]>({
    queryKey: queryKeys.learners.list({
      scope: 'group-details-attach',
      groupId,
      limit: 100
    }),
    queryFn: async () => groupService.queryLearners({ page: 1, limit: 100 }),
    enabled: canManageGroup && isAddLearnersModalOpen
  });

  const updateGroupMutation = useApiMutation<
    UpdateGroupSettingsDto,
    GroupDetailsDto
  >({
    mutationFn: async (payload) =>
      groupService.updateGroupSettings(groupId, payload),
    onSuccess: async () => {
      toast.success('تم تحديث الحلقة بنجاح');
      await queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
    onError: (error) => {
      toast.error(error.message || 'فشل تحديث الحلقة');
    }
  });

  const createLearnerAndAttachMutation = useApiMutation<
    CreateLearnerDto,
    GroupDetailsDto
  >({
    mutationFn: async (payload) =>
      groupService.createLearnerAndAddToGroup(groupId, payload),
    onSuccess: async () => {
      toast.success('تمت إضافة المتعلم للحلقة بنجاح');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.groups.detail(groupId)
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.learners.all })
      ]);
    },
    onError: (error) => {
      toast.error(error.message || 'فشل إضافة المتعلم');
    }
  });

  const addExistingLearnersMutation = useApiMutation<
    AddLearnersToGroupDto,
    GroupDetailsDto
  >({
    mutationFn: async (payload) =>
      groupService.addExistingLearnersToGroup(groupId, payload),
    onSuccess: async () => {
      toast.success('تمت إضافة المتعلمين للحلقة بنجاح');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.groups.detail(groupId)
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.learners.all })
      ]);
    },
    onError: (error) => {
      toast.error(error.message || 'فشل إضافة المتعلمين');
    }
  });

  const removeStudentMutation = useApiMutation<{ userId: string }, null>({
    mutationFn: async ({ userId }) =>
      groupService.removeStudentFromGroup(groupId, userId),
    onSuccess: async () => {
      toast.success('تم حذف المتعلم من الحلقة');
      await queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(groupId)
      });
    },
    onError: (error) => {
      toast.error(error.message || 'فشل حذف المتعلم');
    }
  });

  const updateLearnerMutation = useApiMutation<
    { id: string; data: UpdateLearnerDto },
    LearnerDto
  >({
    mutationFn: ({ id, data }) => learnerService.updateLearner(id, data),
    onSuccess: async () => {
      toast.success('تم تحديث المتعلم بنجاح');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.groups.detail(groupId)
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.learners.all })
      ]);
    },
    onError: (error) => {
      toast.error(error.message || 'فشل تحديث المتعلم');
    }
  });

  const updateGroupSettings = async (payload: UpdateGroupDto) => {
    if (!canManageGroup) {
      throw new Error('غير مصرح لك بتنفيذ العملية');
    }

    await updateGroupMutation.mutateAsync(payload);
  };

  const removeStudentFromGroup = async (userId: string) => {
    if (!canManageGroup) {
      throw new Error('غير مصرح لك بتنفيذ العملية');
    }

    await removeStudentMutation.mutateAsync({ userId });
  };

  const openAddLearnersModal = () => {
    if (!canManageGroup) {
      return;
    }

    setIsAddLearnersModalOpen(true);
  };

  const openLearnerEditModal = (student: GroupStudentSummaryDto) => {
    if (!canEditLearner) {
      return;
    }

    setSelectedLearner(student);
    setLearnerModalMode('edit');
    setIsLearnerModalOpen(true);
  };

  const openLearnerInfoModal = (student: GroupStudentSummaryDto) => {
    setSelectedLearner(student);
    setLearnerModalMode('view');
    setIsLearnerModalOpen(true);
  };

  const submitLearnerMainInfo = async (args: StudentMainInfoSubmitArgs) => {
    if (args.mode !== 'edit') {
      throw new Error('الوضع غير مدعوم في هذه الصفحة');
    }

    if (!canEditLearner) {
      throw new Error('غير مصرح لك بتنفيذ العملية');
    }

    if (!args.learnerId) {
      throw new Error('معرف المتعلم مفقود');
    }

    await updateLearnerMutation.mutateAsync({
      id: args.learnerId,
      data: args.data as UpdateLearnerDto
    });
  };

  const addExistingLearnersToGroup = async (dto: AddLearnersToGroupDto) => {
    if (!canManageGroup) {
      throw new Error('غير مصرح لك بتنفيذ العملية');
    }

    await addExistingLearnersMutation.mutateAsync(dto);
  };

  const createLearnerAndAttachToGroup = async (dto: CreateLearnerDto) => {
    if (!canManageGroup) {
      throw new Error('غير مصرح لك بتنفيذ العملية');
    }

    await createLearnerAndAttachMutation.mutateAsync(dto);
  };

  const availableLearners = useMemo(() => {
    const allLearners = learnersQuery.data?.data ?? [];
    const currentGroupLearnerIds = new Set(
      (groupQuery.data?.data?.students ?? []).map((student) => student.id)
    );

    return allLearners.filter((learner) => !currentGroupLearnerIds.has(learner.id));
  }, [groupQuery.data?.data?.students, learnersQuery.data?.data]);

  return {
    canManageGroup,
    canEditLearner,
    group: groupQuery.data?.data ?? null,
    isLoading: groupQuery.isPending,
    error: groupQuery.error?.message ?? null,
    tutors: tutorsQuery.data?.data ?? [],
    isLoadingTutors: tutorsQuery.isPending,

    updateGroupSettings,
    removeStudentFromGroup,
    openAddLearnersModal,
    openLearnerEditModal,
    openLearnerInfoModal,
    submitLearnerMainInfo,
    addExistingLearnersToGroup,
    createLearnerAndAttachToGroup,
    availableLearners,
    isLoadingAvailableLearners: learnersQuery.isPending,
    isAddLearnersModalOpen,
    setIsAddLearnersModalOpen,
    isLearnerModalOpen,
    setIsLearnerModalOpen,
    learnerModalMode,
    selectedLearner,

    isUpdatingGroup: updateGroupMutation.isPending,
    isAddingStudent: createLearnerAndAttachMutation.isPending,
    isAddingExistingStudents: addExistingLearnersMutation.isPending,
    isRemovingStudent: removeStudentMutation.isPending,
    isUpdatingLearner: updateLearnerMutation.isPending
  };
};
