import { useMemo, useState } from 'react';
import type {
  LearnerPaymentsSortBy,
  PaymentStatus,
  QueryLearnerPaymentsDto,
  SortOrder,
} from '@halaqa/shared';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryKeys } from '@/lib/query-client';
import { paymentService } from '../services/payment.service';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const VALID_STATUS: PaymentStatus[] = ['UNPAID', 'PARTIAL', 'PAID'];

const normalizePositiveInteger = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const normalizeStatus = (value: string | null): PaymentStatus | undefined => {
  if (!value) {
    return undefined;
  }

  return VALID_STATUS.includes(value as PaymentStatus) ? (value as PaymentStatus) : undefined;
};

export function useLearnerPaymentsViewModel() {
  const { user } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = normalizePositiveInteger(searchParams.get('page'), DEFAULT_PAGE);
  const limit = normalizePositiveInteger(searchParams.get('limit'), DEFAULT_LIMIT);
  const fromDate = searchParams.get('fromDate')?.trim() ?? '';
  const toDate = searchParams.get('toDate')?.trim() ?? '';
  const status = normalizeStatus(searchParams.get('status'));
  const learnerSortBy = (searchParams.get('learnerSortBy')?.trim() ?? '') as
    | LearnerPaymentsSortBy
    | '';
  const learnerSortOrder = (searchParams.get('learnerSortOrder')?.trim() ?? 'desc') as SortOrder;

  const [selectedLearnerPaymentId, setSelectedLearnerPaymentId] = useState<string | null>(null);

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

  const learnerQuery: QueryLearnerPaymentsDto = useMemo(
    () => ({
      page,
      limit,
      ...(status ? { status } : {}),
      ...(fromDate ? { fromDate: fromDate as QueryLearnerPaymentsDto['fromDate'] } : {}),
      ...(toDate ? { toDate: toDate as QueryLearnerPaymentsDto['toDate'] } : {}),
      ...(learnerSortBy ? { sortBy: learnerSortBy } : {}),
      ...(learnerSortBy ? { sortOrder: learnerSortOrder } : {}),
    }),
    [fromDate, learnerSortBy, learnerSortOrder, limit, page, status, toDate]
  );

  const learnerPaymentsQuery = useApiQuery({
    queryKey: queryKeys.payments.learnerList(learnerQuery),
    queryFn: () => paymentService.queryLearnerPayments(learnerQuery),
    enabled: Boolean(user?.id),
    placeholderData: (previousData) => previousData,
  });

  const learnerDetailsQuery = useApiQuery({
    queryKey: queryKeys.payments.learnerDetail(selectedLearnerPaymentId ?? ''),
    queryFn: () => paymentService.getLearnerPaymentDetails(selectedLearnerPaymentId ?? ''),
    enabled: Boolean(selectedLearnerPaymentId),
  });

  return {
    filters: {
      page,
      limit,
      fromDate,
      toDate,
      status,
      learnerSortBy: learnerSortBy || undefined,
      learnerSortOrder,
    },

    setPage: (nextPage: number) =>
      updateParams({ page: nextPage > DEFAULT_PAGE ? String(nextPage) : undefined }),
    setSearch: (value: string) => updateParams({ search: value || undefined }, true),
    setFromDate: (value: string) => updateParams({ fromDate: value || undefined }, true),
    setToDate: (value: string) => updateParams({ toDate: value || undefined }, true),
    setStatus: (value: PaymentStatus | '') => updateParams({ status: value || undefined }, true),
    setSessionsCount: (value: string) => updateParams({ sessionsCount: value || undefined }, true),
    setLearnerSort: (sortBy: LearnerPaymentsSortBy) => {
      const nextOrder: SortOrder =
        learnerSortBy === sortBy && learnerSortOrder === 'asc' ? 'desc' : 'asc';
      updateParams(
        {
          learnerSortBy: sortBy,
          learnerSortOrder: nextOrder,
        },
        true
      );
    },
    clearFilters: () => setSearchParams(new URLSearchParams()),

    learnerPayments: learnerPaymentsQuery.data?.data ?? [],
    learnerMeta: learnerPaymentsQuery.data?.meta ?? {
      page,
      limit,
      total: 0,
      totalPages: 1,
    },
    isLearnerPaymentsLoading: learnerPaymentsQuery.isPending,

    selectedLearnerPaymentId,
    setSelectedLearnerPaymentId,

    learnerPaymentDetails: learnerDetailsQuery.data?.data ?? null,
  };
}
