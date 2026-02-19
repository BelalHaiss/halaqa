import { useState } from 'react';
import {
  CreateLearnerDto,
  GroupDetailsDto,
  GroupStudentSummaryDto,
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
} from '@/components/ui/student-main-info-modal';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryClient, queryKeys } from '@/lib/query-client';
import { learnerService } from '@/modules/learners/services/learner.service';
import { groupService } from '../services/group.service';

export const useGroupDetailsViewModel = (groupId: string, user: User) => {
  const canManageGroup = user.role === 'ADMIN' || user.role === 'MODERATOR';
  const canEditLearner =
    user.role === 'ADMIN' || user.role === 'MODERATOR' || user.role === 'TUTOR';
  const [isLearnerModalOpen, setIsLearnerModalOpen] = useState(false);
  const [learnerModalMode, setLearnerModalMode] =
    useState<StudentMainInfoMode>('view');
  const [selectedLearner, setSelectedLearner] =
    useState<GroupStudentSummaryDto | null>(null);

  const groupQuery = useApiQuery<GroupDetailsDto>({
    queryKey: queryKeys.groups.detail(groupId),
    enabled: Boolean(groupId),
    queryFn: async () => groupService.getGroupById(groupId)
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
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
      ]);
    },
    onError: (error) => {
      toast.error(error.message || 'فشل إضافة المتعلم');
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

  const openCreateLearnerModal = () => {
    if (!canManageGroup) {
      return;
    }

    setSelectedLearner(null);
    setLearnerModalMode('create');
    setIsLearnerModalOpen(true);
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
    if (args.mode === 'create') {
      if (!canManageGroup) {
        throw new Error('غير مصرح لك بتنفيذ العملية');
      }

      if (args.addToGroupId && args.addToGroupId !== groupId) {
        throw new Error('معرف الحلقة غير متطابق');
      }

      await createLearnerAndAttachMutation.mutateAsync(args.data);
    } else if (args.mode === 'edit') {
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
    } else {
      throw new Error('الوضع غير مدعوم في هذه الصفحة');
    }
  };

  return {
    canManageGroup,
    canEditLearner,
    group: groupQuery.data?.data ?? null,
    isLoading: groupQuery.isPending,
    error: groupQuery.error?.message ?? null,

    updateGroupSettings,
    removeStudentFromGroup,
    openCreateLearnerModal,
    openLearnerEditModal,
    openLearnerInfoModal,
    submitLearnerMainInfo,
    isLearnerModalOpen,
    setIsLearnerModalOpen,
    learnerModalMode,
    selectedLearner,

    isUpdatingGroup: updateGroupMutation.isPending,
    isAddingStudent: createLearnerAndAttachMutation.isPending,
    isRemovingStudent: removeStudentMutation.isPending,
    isUpdatingLearner: updateLearnerMutation.isPending
  };
};
