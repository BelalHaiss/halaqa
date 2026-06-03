import { useMemo, useState } from 'react';
import type {
  CurrencyCode,
  QueryTutorPaymentsDto,
  SortOrder,
  TutorPaymentsSortBy,
  TutorPaymentSummaryDto,
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

const normalizePositiveInteger = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
};

export function useAdminTutorPaymentsViewModel() {
  const { user } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const role = user?.role;
  const page = normalizePositiveInteger(searchParams.get('page'), DEFAULT_PAGE);
  const limit = normalizePositiveInteger(searchParams.get('limit'), DEFAULT_LIMIT);
  const fromDate = searchParams.get('fromDate')?.trim() ?? '';
  const toDate = searchParams.get('toDate')?.trim() ?? '';
  const selectedTutorId = searchParams.get('id')?.trim() ?? '';
  const sortBy = (searchParams.get('tutorSortBy')?.trim() ?? '') as TutorPaymentsSortBy | '';
  const sortOrder = (searchParams.get('tutorSortOrder')?.trim() ?? 'desc') as SortOrder;
  const currency = (searchParams.get('currency')?.trim() ?? '') as CurrencyCode | '';

  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [paymentPendingDelete, setPaymentPendingDelete] = useState<TutorPaymentSummaryDto | null>(
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

  const query: QueryTutorPaymentsDto = useMemo(
    () => ({
      page,
      limit,
      ...(selectedTutorId ? { tutorId: selectedTutorId } : {}),
      ...(fromDate ? { fromDate: fromDate as QueryTutorPaymentsDto['fromDate'] } : {}),
      ...(toDate ? { toDate: toDate as QueryTutorPaymentsDto['toDate'] } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(sortBy ? { sortOrder } : {}),
      ...(currency ? { currency } : {}),
    }),
    [currency, fromDate, limit, page, selectedTutorId, sortBy, sortOrder, toDate]
  );

  const paymentsQuery = useApiQuery({
    queryKey: queryKeys.payments.tutorList(query),
    queryFn: () => paymentService.queryTutorPayments(query),
    placeholderData: (previousData) => previousData,
  });

  const detailsQuery = useApiQuery({
    queryKey: queryKeys.payments.tutorDetail(selectedPaymentId ?? ''),
    queryFn: () => paymentService.getTutorPaymentDetails(selectedPaymentId ?? ''),
    enabled: Boolean(selectedPaymentId),
  });

  const deleteMutation = useApiMutation<string, null>({
    mutationFn: paymentService.deleteTutorPayment,
    onSuccess: async () => {
      toast.success('تم حذف أجور المعلم');
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
      selectedTutorId,
      currency: currency || undefined,
      sortBy: sortBy || undefined,
      sortOrder,
    },

    setPage: (nextPage: number) =>
      updateParams({ page: nextPage > DEFAULT_PAGE ? String(nextPage) : undefined }),
    setTutorId: (value: string) => updateParams({ id: value || undefined }, true),
    setFromDate: (value: string) => updateParams({ fromDate: value || undefined }, true),
    setToDate: (value: string) => updateParams({ toDate: value || undefined }, true),
    setCurrency: (value: CurrencyCode | '') => updateParams({ currency: value || undefined }, true),
    setSort: (nextSortBy: TutorPaymentsSortBy) => {
      const nextOrder: SortOrder = sortBy === nextSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
      updateParams({ tutorSortBy: nextSortBy, tutorSortOrder: nextOrder }, true);
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

    confirmDelete,
  };
}
