import {
  DATE_ONLY_FORMAT_REGEX,
  GroupReportDTO,
  GroupSelectOptionDto,
  ISODateOnlyString,
} from '@halaqa/shared';
import { useSearchParams } from 'react-router-dom';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryKeys } from '@/lib/query-client';
import { groupService } from '@/modules/groups';
import { reportService } from '../services/report.service';

const normalizeISODate = (value: string | null): string => {
  if (!value) {
    return '';
  }

  return DATE_ONLY_FORMAT_REGEX.test(value) ? value : '';
};

export const useGroupReportViewModel = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const groupId = searchParams.get('groupId')?.trim() ?? '';
  const fromDate = normalizeISODate(searchParams.get('fromDate'));
  const toDate = normalizeISODate(searchParams.get('toDate'));

  const hasCompleteFilters = Boolean(groupId && fromDate && toDate);

  const groupsQuery = useApiQuery<GroupSelectOptionDto[]>({
    queryKey: queryKeys.groups.options(),
    queryFn: async () => groupService.getGroupOptions(),
  });

  const reportQuery = useApiQuery<GroupReportDTO>({
    queryKey: queryKeys.reports.list({ groupId, fromDate, toDate }),
    queryFn: async () =>
      reportService.getGroupReport({
        groupId,
        fromDate: fromDate as ISODateOnlyString,
        toDate: toDate as ISODateOnlyString,
      }),
    enabled: groupsQuery.isSuccess && hasCompleteFilters,
  });

  const updateParams = (updates: Record<string, string | undefined>) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);
        return;
      }

      nextParams.set(key, value);
    });

    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('groupId');
    nextParams.delete('fromDate');
    nextParams.delete('toDate');
    setSearchParams(nextParams);
  };

  return {
    filters: {
      groupId,
      fromDate,
      toDate,
    },
    hasCompleteFilters,

    groups: groupsQuery.data?.data ?? [],
    isGroupsLoading: groupsQuery.isPending,
    groupsError: groupsQuery.error?.message ?? null,

    report: reportQuery.data?.data ?? null,
    isReportLoading: reportQuery.isPending && hasCompleteFilters,
    isReportRefreshing: reportQuery.isFetching,
    reportError: reportQuery.error?.message ?? null,

    setGroupId: (value: string) => updateParams({ groupId: value || undefined }),
    setFromDate: (value: string) => updateParams({ fromDate: value || undefined }),
    setToDate: (value: string) => updateParams({ toDate: value || undefined }),
    clearFilters,
  };
};
