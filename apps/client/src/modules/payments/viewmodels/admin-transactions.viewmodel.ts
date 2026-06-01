import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import type {
  CreateManualTransactionDto,
  CurrencyCode,
  FinancialTransactionSummaryDto,
  ISODateOnlyString,
  QueryTransactionsDto,
  SortOrder,
  TransactionEntityType,
  TransactionLabelDto,
  TransactionsSortBy,
  TransactionType,
} from '@halaqa/shared';
import { useApp } from '@/contexts/AppContext';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryClient, queryKeys } from '@/lib/query-client';
import { paymentLabelService } from '../services/payment-label.service';
import { transactionService } from '../services/transaction.service';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const normalizePositiveInteger = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
};

export function useAdminTransactionsViewModel() {
  const { user } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const role = user?.role;
  const page = normalizePositiveInteger(searchParams.get('txPage'), DEFAULT_PAGE);
  const limit = normalizePositiveInteger(searchParams.get('txLimit'), DEFAULT_LIMIT);
  const fromDate = (searchParams.get('txFrom')?.trim() ?? '') as ISODateOnlyString | '';
  const toDate = (searchParams.get('txTo')?.trim() ?? '') as ISODateOnlyString | '';
  const type = (searchParams.get('txType')?.trim() ?? '') as TransactionType | '';
  const entityType = (searchParams.get('txEntityType')?.trim() ?? '') as TransactionEntityType | '';
  const currency = (searchParams.get('txCurrency')?.trim() ?? '') as CurrencyCode | '';
  const labelId = searchParams.get('txLabelId')?.trim() ?? '';
  const sortBy = (searchParams.get('txSortBy')?.trim() ?? '') as TransactionsSortBy | '';
  const sortOrder = (searchParams.get('txSortOrder')?.trim() ?? 'desc') as SortOrder;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<FinancialTransactionSummaryDto | null>(null);
  const [labelSearch, setLabelSearch] = useState('');
  const [selectedFilterLabel, setSelectedFilterLabel] = useState<Pick<
    TransactionLabelDto,
    'id' | 'name'
  > | null>(null);

  const updateParams = (updates: Record<string, string | undefined>, resetPage = false) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);
        return;
      }
      nextParams.set(key, value);
    });
    if (resetPage) nextParams.delete('txPage');
    setSearchParams(nextParams);
  };

  const query: QueryTransactionsDto = useMemo(
    () => ({
      page,
      limit,
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
      ...(type ? { type } : {}),
      ...(entityType ? { entityType } : {}),
      ...(currency ? { currency } : {}),
      ...(labelId ? { labelId } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(sortBy ? { sortOrder } : {}),
    }),
    [currency, entityType, fromDate, labelId, limit, page, sortBy, sortOrder, toDate, type]
  );

  const transactionsQuery = useApiQuery({
    queryKey: queryKeys.transactions.list(query),
    queryFn: () => transactionService.queryTransactions(query),
    placeholderData: (previousData) => previousData,
  });

  const labelsQuery = useApiQuery({
    queryKey: queryKeys.transactionLabels.list(labelSearch),
    queryFn: () =>
      paymentLabelService.searchLabels({ search: labelSearch || undefined, limit: 20 }),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useApiMutation<CreateManualTransactionDto, unknown>({
    mutationFn: transactionService.createManualTransaction,
    onSuccess: async () => {
      toast.success('تم إضافة المعاملة بنجاح');
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactionLabels.all });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useApiMutation<string, void>({
    mutationFn: transactionService.deleteTransaction,
    onSuccess: async () => {
      toast.success('تم حذف المعاملة');
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteMutation.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  };

  const canDelete = role === 'ADMIN';

  return {
    filters: {
      page,
      limit,
      fromDate,
      toDate,
      type: type || undefined,
      entityType: entityType || undefined,
      currency: currency || undefined,
      labelId: labelId || undefined,
      sortBy: sortBy || undefined,
      sortOrder,
    },

    setPage: (nextPage: number) =>
      updateParams({ txPage: nextPage > DEFAULT_PAGE ? String(nextPage) : undefined }),
    setFromDate: (value: string) => updateParams({ txFrom: value || undefined }, true),
    setToDate: (value: string) => updateParams({ txTo: value || undefined }, true),
    setType: (value: TransactionType | '') => updateParams({ txType: value || undefined }, true),
    setEntityType: (value: TransactionEntityType | '') =>
      updateParams({ txEntityType: value || undefined }, true),
    setCurrency: (value: CurrencyCode | '') =>
      updateParams({ txCurrency: value || undefined }, true),
    setLabelId: (value: Pick<TransactionLabelDto, 'id' | 'name'> | null) => {
      setSelectedFilterLabel(value);
      updateParams({ txLabelId: value?.id || undefined }, true);
    },
    setSort: (nextSortBy: TransactionsSortBy) => {
      const nextOrder: SortOrder = sortBy === nextSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
      updateParams({ txSortBy: nextSortBy, txSortOrder: nextOrder }, true);
    },
    clearFilters: () => {
      const tab = searchParams.get('tab');
      const nextParams = new URLSearchParams();
      if (tab) nextParams.set('tab', tab);
      setSearchParams(nextParams);
      setSelectedFilterLabel(null);
    },

    transactions: transactionsQuery.data?.data ?? [],
    meta: transactionsQuery.data?.meta ?? { page, limit, total: 0, totalPages: 1 },
    isLoading: transactionsQuery.isPending,

    labels: labelsQuery.data?.data ?? [],
    isLabelsLoading: labelsQuery.isFetching,
    setLabelSearch,
    selectedFilterLabel,

    isCreateOpen,
    setIsCreateOpen,
    pendingDelete,
    setPendingDelete,

    canDelete,

    createTransaction: async (payload: CreateManualTransactionDto) => {
      await createMutation.mutateAsync(payload);
    },
    isCreating: createMutation.isPending,

    confirmDelete,
  };
}
