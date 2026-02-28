import { useState } from 'react';
import type { CreateLearnerDto, LearnerDto, UpdateLearnerDto } from '@halaqa/shared';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryClient, queryKeys } from '@/lib/query-client';
import { learnerService } from '../services/learner.service';

export type LearnerModalMode = 'view' | 'edit' | 'create';

export type SubmitLearnerArgs = {
  mode: 'create' | 'edit';
  learnerId?: string;
  data: CreateLearnerDto | UpdateLearnerDto;
};

const PAGE_SIZE = 10;

export function useLearnersViewModel() {
  const { user } = useApp();
  const canManageLearners = user?.role === 'ADMIN' || user?.role === 'MODERATOR';

  const [searchQuery, setSearchQueryState] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLearner, setSelectedLearner] = useState<LearnerDto | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentModalMode, setStudentModalMode] = useState<LearnerModalMode>('view');
  const [learnerPendingDelete, setLearnerPendingDelete] = useState<LearnerDto | null>(null);

  const learnersQuery = useApiQuery<LearnerDto[]>({
    queryKey: queryKeys.learners.list({
      page,
      limit: PAGE_SIZE,
      search: searchQuery || undefined,
    }),
    queryFn: () =>
      learnerService.queryLearners({
        page,
        limit: PAGE_SIZE,
        search: searchQuery || undefined,
      }),
    placeholderData: (previousData) => previousData,
  });

  const createLearnerMutation = useApiMutation<CreateLearnerDto, LearnerDto>({
    mutationFn: learnerService.createLearner,
    onSuccess: async () => {
      toast.success('تمت إضافة المتعلم بنجاح');
      await queryClient.invalidateQueries({ queryKey: queryKeys.learners.all });
    },
  });

  const updateLearnerMutation = useApiMutation<{ id: string; data: UpdateLearnerDto }, LearnerDto>({
    mutationFn: ({ id, data }) => learnerService.updateLearner(id, data),
    onSuccess: async () => {
      toast.success('تم تعديل بيانات المتعلم بنجاح');
      await queryClient.invalidateQueries({ queryKey: queryKeys.learners.all });
    },
  });

  const deleteLearnerMutation = useApiMutation<string, null>({
    mutationFn: (learnerId: string) => learnerService.deleteLearner(learnerId),
    onSuccess: async () => {
      toast.success('تم حذف المتعلم بنجاح');
      await queryClient.invalidateQueries({ queryKey: queryKeys.learners.all });
    },
  });

  const handleSearchQueryChange = (value: string) => {
    setSearchQueryState(value);
    setPage(1);
  };

  const openCreateModal = () => {
    setSelectedLearner(null);
    setStudentModalMode('create');
    setIsStudentModalOpen(true);
  };

  const openViewModal = (learner: LearnerDto) => {
    setSelectedLearner(learner);
    setStudentModalMode('view');
    setIsStudentModalOpen(true);
  };

  const openEditModal = (learner: LearnerDto) => {
    if (!canManageLearners) {
      return;
    }

    setSelectedLearner(learner);
    setStudentModalMode('edit');
    setIsStudentModalOpen(true);
  };

  const submitLearner = async (args: SubmitLearnerArgs) => {
    if (!canManageLearners) {
      throw new Error('غير مصرح لك بتنفيذ العملية');
    }

    if (args.mode === 'create') {
      await createLearnerMutation.mutateAsync(args.data as CreateLearnerDto);
      return;
    }

    if (!args.learnerId) {
      throw new Error('معرف المتعلم غير موجود');
    }

    await updateLearnerMutation.mutateAsync({
      id: args.learnerId,
      data: args.data as UpdateLearnerDto,
    });
  };

  const confirmDeleteLearner = async () => {
    if (!canManageLearners || !learnerPendingDelete) {
      return;
    }

    await deleteLearnerMutation.mutateAsync(learnerPendingDelete.id);
    setLearnerPendingDelete(null);
  };

  return {
    learners: learnersQuery.data?.data ?? [],
    totalPages: Math.max(learnersQuery.data?.meta?.totalPages ?? 1, 1),
    isLoading: learnersQuery.isPending,
    isRefreshing: learnersQuery.isFetching,
    queryError: learnersQuery.error?.message ?? null,

    page,
    setPage,
    searchQuery,
    onSearchQueryChange: handleSearchQueryChange,

    canManageLearners,

    selectedLearner,
    isStudentModalOpen,
    setIsStudentModalOpen,
    studentModalMode,
    openCreateModal,
    openViewModal,
    openEditModal,
    submitLearner,

    learnerPendingDelete,
    setLearnerPendingDelete,
    confirmDeleteLearner,

    isSubmittingLearner: createLearnerMutation.isPending || updateLearnerMutation.isPending,
    isDeletingLearner: deleteLearnerMutation.isPending,
  };
}
