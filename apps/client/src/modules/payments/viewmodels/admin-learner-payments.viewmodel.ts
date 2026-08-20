import { useMemo, useState } from 'react';
import type {
  CurrencyCode,
  CreateLearnerPaymentDto,
  LearnerPaymentsSortBy,
  LearnerPaymentSummaryDto,
  PaymentStatus,
  QueryLearnerPaymentsDto,
  SortOrder,
} from '@halaqa/shared';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryClient, queryKeys } from '@/lib/query-client';
import { paymentService } from '../services/payment.service';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const VALID_STATUS: PaymentStatus[] = ['UNPAID', 'PAID'];

const normalizePositiveInteger = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const normalizeStatus = (value: string | null): PaymentStatus | undefined => {
  if (!value) return undefined;
  return VALID_STATUS.includes(value as PaymentStatus) ? (value as PaymentStatus) : undefined;
};

export function useAdminLearnerPaymentsViewModel() {
  const { user } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const role = user?.role;
  const page = normalizePositiveInteger(searchParams.get('page'), DEFAULT_PAGE);
  const limit = normalizePositiveInteger(searchParams.get('limit'), DEFAULT_LIMIT);
  const fromDate = searchParams.get('fromDate')?.trim() ?? '';
  const toDate = searchParams.get('toDate')?.trim() ?? '';
  const learnerId = searchParams.get('learnerId')?.trim() ?? '';
  const learnerName = searchParams.get('learnerName')?.trim() ?? '';
  const groupId = searchParams.get('groupId')?.trim() ?? '';
  const status = normalizeStatus(searchParams.get('status'));
  const sortBy = (searchParams.get('learnerSortBy')?.trim() ?? '') as LearnerPaymentsSortBy | '';
  const sortOrder = (searchParams.get('learnerSortOrder')?.trim() ?? 'desc') as SortOrder;
  const currency = (searchParams.get('currency')?.trim() ?? '') as CurrencyCode | '';

  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [paymentPendingDelete, setPaymentPendingDelete] = useState<LearnerPaymentSummaryDto | null>(
    null
  );

  const updateParams = (updates: Record<string, string | undefined>, resetPage = false) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);
        return;
      }
      nextParams.set(key, value);
    });
    if (resetPage) nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const query: QueryLearnerPaymentsDto = useMemo(
    () => ({
      page,
      limit,
      ...(learnerId ? { learnerId } : {}),
      ...(groupId ? { groupId } : {}),
      ...(status ? { status } : {}),
      ...(fromDate ? { fromDate: fromDate as QueryLearnerPaymentsDto['fromDate'] } : {}),
      ...(toDate ? { toDate: toDate as QueryLearnerPaymentsDto['toDate'] } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(sortBy ? { sortOrder } : {}),
      ...(currency ? { currency } : {}),
    }),
    [currency, fromDate, learnerId, groupId, sortBy, sortOrder, limit, page, status, toDate]
  );

  const paymentsQuery = useApiQuery({
    queryKey: queryKeys.payments.learnerList(query),
    queryFn: () => paymentService.queryLearnerPayments(query),
    placeholderData: (previousData) => previousData,
  });

  const detailsQuery = useApiQuery({
    queryKey: queryKeys.payments.learnerDetail(selectedPaymentId ?? ''),
    queryFn: () => paymentService.getLearnerPaymentDetails(selectedPaymentId ?? ''),
    enabled: Boolean(selectedPaymentId),
  });

  const createMutation = useApiMutation<CreateLearnerPaymentDto, unknown>({
    mutationFn: paymentService.createLearnerPayment,
    onSuccess: async () => {
      toast.success('تم إنشاء اشتراك المتعلم بنجاح');
      await queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useApiMutation<string, null>({
    mutationFn: paymentService.deleteLearnerPayment,
    onSuccess: async () => {
      toast.success('تم حذف اشتراك المتعلم');
      await queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const canManagePayments = role === 'ADMIN' || role === 'MODERATOR';
  const canDeletePayments = role === 'ADMIN';

  const confirmDelete = async () => {
    if (!paymentPendingDelete) return;
    await deleteMutation.mutateAsync(paymentPendingDelete.id);
    setPaymentPendingDelete(null);
  };

  return {
    filters: {
      page,
      limit,
      fromDate,
      toDate,
      learnerId,
      learnerName,
      groupId,
      status,
      currency: currency || undefined,
      sortBy: sortBy || undefined,
      sortOrder,
    },

    setPage: (nextPage: number) =>
      updateParams({ page: nextPage > DEFAULT_PAGE ? String(nextPage) : undefined }),
    setLearnerId: (id: string, name: string) =>
      updateParams({ learnerId: id || undefined, learnerName: name || undefined }, true),
    setGroupId: (id: string) => updateParams({ groupId: id || undefined }, true),
    setFromDate: (value: string) => updateParams({ fromDate: value || undefined }, true),
    setToDate: (value: string) => updateParams({ toDate: value || undefined }, true),
    setStatus: (value: PaymentStatus | '') => updateParams({ status: value || undefined }, true),
    setCurrency: (value: CurrencyCode | '') => updateParams({ currency: value || undefined }, true),
    setSort: (nextSortBy: LearnerPaymentsSortBy) => {
      const nextOrder: SortOrder = sortBy === nextSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
      updateParams({ learnerSortBy: nextSortBy, learnerSortOrder: nextOrder }, true);
    },
    clearFilters: () => {
      const tab = searchParams.get('tab');
      const nextParams = new URLSearchParams();
      if (tab) nextParams.set('tab', tab);
      setSearchParams(nextParams);
    },

    payments: paymentsQuery.data?.data ?? [],
    meta: paymentsQuery.data?.meta ?? { page, limit, total: 0, totalPages: 1 },
    isLoading: paymentsQuery.isPending,

    paymentDetails: detailsQuery.data?.data ?? null,

    selectedPaymentId,
    setSelectedPaymentId,
    isCreateOpen,
    setIsCreateOpen,
    paymentPendingDelete,
    setPaymentPendingDelete,

    canManagePayments,
    canDeletePayments,

    createPayment: async (payload: CreateLearnerPaymentDto) => {
      await createMutation.mutateAsync(payload);
    },
    isCreatingPayment: createMutation.isPending,

    confirmDelete,
  };
}
