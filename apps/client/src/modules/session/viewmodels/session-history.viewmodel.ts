import {
  DATE_ONLY_FORMAT_REGEX,
  GroupSelectOptionDto,
  ISODateOnlyString,
  SessionQueryDTO,
  SessionRecordStatus,
  SessionSummaryDTO,
} from '@halaqa/shared';
import { useSearchParams } from 'react-router-dom';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryKeys } from '@/lib/query-client';
import { groupService } from '@/modules/groups';
import { sessionService } from '../services/session.service';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const VALID_STATUSES: SessionRecordStatus[] = [
  'RESCHEDULED',
  'COMPLETED',
  'CANCELED',
  'MISSED',
];

const normalizePositiveInteger = (
  value: string | null,
  fallback: number,
): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const normalizeISODate = (value: string | null): string => {
  if (!value) {
    return '';
  }

  return DATE_ONLY_FORMAT_REGEX.test(value) ? value : '';
};

const normalizeStatus = (value: string | null): SessionRecordStatus | '' => {
  if (!value) {
    return '';
  }

  return VALID_STATUSES.includes(value as SessionRecordStatus)
    ? (value as SessionRecordStatus)
    : '';
};

export const useSessionHistoryViewModel = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const fromDate = normalizeISODate(searchParams.get('fromDate'));
  const toDate = normalizeISODate(searchParams.get('toDate'));
  const groupId = searchParams.get('groupId')?.trim() ?? '';
  const status = normalizeStatus(searchParams.get('status'));
  const page = normalizePositiveInteger(searchParams.get('page'), DEFAULT_PAGE);
  const limit = normalizePositiveInteger(
    searchParams.get('limit'),
    DEFAULT_LIMIT,
  );

  const query: SessionQueryDTO = {
    page,
    limit,
    ...(fromDate ? { fromDate: fromDate as ISODateOnlyString } : {}),
    ...(toDate ? { toDate: toDate as ISODateOnlyString } : {}),
    ...(groupId ? { groupId } : {}),
    ...(status ? { status } : {}),
  };

  const groupsQuery = useApiQuery<GroupSelectOptionDto[]>({
    queryKey: queryKeys.groups.options(),
    queryFn: async () => groupService.getGroupOptions(),
  });

  const historyQuery = useApiQuery<SessionSummaryDTO[]>({
    queryKey: queryKeys.sessions.list(query),
    queryFn: async () => sessionService.querySessionHistory(query),
    enabled: groupsQuery.isSuccess,
    placeholderData: (previousData) => previousData,
  });

  const updateParams = (
    updates: Record<string, string | undefined>,
    options?: { resetPage?: boolean },
  ) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);
        return;
      }

      nextParams.set(key, value);
    });

    if (options?.resetPage) {
      nextParams.delete('page');
    }

    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('fromDate');
    nextParams.delete('toDate');
    nextParams.delete('groupId');
    nextParams.delete('status');
    nextParams.delete('page');
    nextParams.delete('limit');
    setSearchParams(nextParams);
  };

  return {
    filters: {
      fromDate,
      toDate,
      groupId,
      status,
      page,
      limit,
    },

    groups: groupsQuery.data?.data ?? [],
    isGroupsLoading: groupsQuery.isPending,
    groupsError: groupsQuery.error?.message ?? null,

    sessions: historyQuery.data?.data ?? [],
    meta: historyQuery.data?.meta ?? {
      page,
      limit,
      total: 0,
      totalPages: 1,
    },
    isHistoryLoading: historyQuery.isPending,
    isHistoryRefreshing: historyQuery.isFetching,
    historyError: historyQuery.error?.message ?? null,

    setFromDate: (value: string) =>
      updateParams({ fromDate: value || undefined }, { resetPage: true }),
    setToDate: (value: string) =>
      updateParams({ toDate: value || undefined }, { resetPage: true }),
    setGroupId: (value: string) =>
      updateParams({ groupId: value || undefined }, { resetPage: true }),
    setStatus: (value: string) =>
      updateParams({ status: value || undefined }, { resetPage: true }),
    setPage: (nextPage: number) =>
      updateParams({
        page: nextPage > DEFAULT_PAGE ? String(nextPage) : undefined,
      }),
    clearFilters,
  };
};
