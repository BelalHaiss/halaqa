import { useMemo, useState } from 'react';
import type {
  QueryTutorPaymentsDto,
  SortOrder,
  TutorPaymentsSortBy,
  TutorPaymentSummaryDto,
} from '@halaqa/shared';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryKeys } from '@/lib/query-client';
import { paymentService } from '../services/payment.service';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const normalizePositiveInteger = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

export function useTutorPaymentsViewModel() {
  const { user } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = normalizePositiveInteger(searchParams.get('page'), DEFAULT_PAGE);
  const limit = normalizePositiveInteger(searchParams.get('limit'), DEFAULT_LIMIT);
  const fromDate = searchParams.get('fromDate')?.trim() ?? '';
  const toDate = searchParams.get('toDate')?.trim() ?? '';
  const tutorSortBy = (searchParams.get('tutorSortBy')?.trim() ?? '') as TutorPaymentsSortBy | '';
  const tutorSortOrder = (searchParams.get('tutorSortOrder')?.trim() ?? 'desc') as SortOrder;

  const [selectedTutorPaymentId, setSelectedTutorPaymentId] = useState<string | null>(null);
  const [tutorPaymentPendingDelete, setTutorPaymentPendingDelete] =
    useState<TutorPaymentSummaryDto | null>(null);

  const updateParams = (updates: Record<string, string | undefined>, resetPage = false) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);
        return;
      }

      nextParams.set(key, value);
    });

    if (resetPage) {
      nextParams.delete('page');
    }

    setSearchParams(nextParams);
  };

  const tutorQuery: QueryTutorPaymentsDto = useMemo(
    () => ({
      page,
      limit,
      tutorId: user?.id ?? '',
      ...(fromDate ? { fromDate: fromDate as QueryTutorPaymentsDto['fromDate'] } : {}),
      ...(toDate ? { toDate: toDate as QueryTutorPaymentsDto['toDate'] } : {}),
      ...(tutorSortBy ? { sortBy: tutorSortBy } : {}),
      ...(tutorSortBy ? { sortOrder: tutorSortOrder } : {}),
    }),
    [fromDate, limit, page, toDate, tutorSortBy, tutorSortOrder, user?.id]
  );

  const tutorPaymentsQuery = useApiQuery({
    queryKey: queryKeys.payments.tutorList(tutorQuery),
    queryFn: () => paymentService.queryTutorPayments(tutorQuery),
    enabled: Boolean(user?.id),
    placeholderData: (previousData) => previousData,
  });

  const tutorDetailsQuery = useApiQuery({
    queryKey: queryKeys.payments.tutorDetail(selectedTutorPaymentId ?? ''),
    queryFn: () => paymentService.getTutorPaymentDetails(selectedTutorPaymentId ?? ''),
    enabled: Boolean(selectedTutorPaymentId),
  });

  return {
    filters: {
      page,
      limit,
      fromDate,
      toDate,
      tutorSortBy: tutorSortBy || undefined,
      tutorSortOrder,
    },

    setPage: (nextPage: number) =>
      updateParams({ page: nextPage > DEFAULT_PAGE ? String(nextPage) : undefined }),
    setSearch: (value: string) => updateParams({ search: value || undefined }, true),
    setFromDate: (value: string) => updateParams({ fromDate: value || undefined }, true),
    setToDate: (value: string) => updateParams({ toDate: value || undefined }, true),
    setTutorSort: (sortBy: TutorPaymentsSortBy) => {
      const nextOrder: SortOrder =
        tutorSortBy === sortBy && tutorSortOrder === 'asc' ? 'desc' : 'asc';
      updateParams(
        {
          tutorSortBy: sortBy,
          tutorSortOrder: nextOrder,
        },
        true
      );
    },
    clearFilters: () => setSearchParams(new URLSearchParams()),

    tutorPayments: tutorPaymentsQuery.data?.data ?? [],
    tutorMeta: tutorPaymentsQuery.data?.meta ?? {
      page,
      limit,
      total: 0,
      totalPages: 1,
    },
    isTutorPaymentsLoading: tutorPaymentsQuery.isPending,

    selectedTutorPaymentId,
    setSelectedTutorPaymentId,
    tutorPaymentPendingDelete,
    setTutorPaymentPendingDelete,

    tutorPaymentDetails: tutorDetailsQuery.data?.data ?? null,

    canDeletePayments: false,
    confirmDeleteTutorPayment: async () => undefined,
  };
}
