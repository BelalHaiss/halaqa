import { Link } from 'react-router-dom';
import { Eye, Loader2 } from 'lucide-react';
import {
  formatDateShort,
  formatISODateToUserTimezone,
  minutesToTimeString,
  type TimeMinutes,
} from '@halaqa/shared';
import { useApp } from '@/contexts/AppContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationControls } from '@/components/ui/pagination-controls';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Typography } from '@/components/ui/typography';
import { getSessionStatusConfig } from '@/modules/session/utils/session.util';
import { HistoryFilterContainer } from '../components/HistoryFilterContainer';
import { useHistoryViewModel } from '../viewmodels/history.viewmodel';

export function HistoryView() {
  const { user } = useApp();
  const vm = useHistoryViewModel();

  if (!user) {
    return null;
  }

  if (vm.isGroupsLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (vm.groupsError) {
    return (
      <Alert variant='soft' color='danger'>
        <AlertDescription>{vm.groupsError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-4'>
      <PageHeader title='السجل' description='سجل الجلسات مع فلترة متقدمة' />

      <HistoryFilterContainer
        fromDate={vm.filters.fromDate}
        toDate={vm.filters.toDate}
        groupId={vm.filters.groupId}
        status={vm.filters.status}
        groupOptions={vm.groups}
        onFromDateChange={vm.setFromDate}
        onToDateChange={vm.setToDate}
        onGroupChange={vm.setGroupId}
        onStatusChange={vm.setStatus}
        onClear={vm.clearFilters}
        disabled={vm.isHistoryRefreshing}
      />

      {vm.historyError && (
        <Alert variant='soft' color='danger'>
          <AlertDescription>{vm.historyError}</AlertDescription>
        </Alert>
      )}

      <Table className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
        <TableHeader className='bg-gray-50 dark:bg-gray-900/50'>
          <TableRow>
            <TableHead className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
              الحلقة
            </TableHead>
            <TableHead className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
              المعلم
            </TableHead>
            <TableHead className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
              التاريخ
            </TableHead>
            <TableHead className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
              الوقت
            </TableHead>
            <TableHead className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
              الحالة
            </TableHead>
            <TableHead className='px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300'>
              الإجراءات
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vm.isHistoryLoading ? (
            <TableRow>
              <TableCell colSpan={6}>
                <div className='flex items-center justify-center py-8 gap-2 text-muted-foreground'>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  جاري تحميل السجل...
                </div>
              </TableCell>
            </TableRow>
          ) : vm.sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <div className='flex items-center justify-center py-8 text-muted-foreground'>
                  لا توجد جلسات مطابقة للفلاتر الحالية
                </div>
              </TableCell>
            </TableRow>
          ) : (
            vm.sessions.map((session) => {
              const statusConfig = getSessionStatusConfig(session.sessionStatus);
              const startedDateTime = formatDateShort(session.startedAt, user.timezone);
              const { time } = formatISODateToUserTimezone(
                session.startedAt,
                user.timezone,
              );
              const formattedTime = minutesToTimeString(time as TimeMinutes);

              return (
                <TableRow key={session.id} className='bg-white dark:bg-gray-800'>
                  <TableCell className='px-4 py-3'>{session.groupName}</TableCell>
                  <TableCell className='px-4 py-3'>{session.tutorName}</TableCell>
                  <TableCell className='px-4 py-3'>
                    <div className='space-y-1'>
                      <Typography as='div' size='sm' weight='medium'>
                        {startedDateTime}
                      </Typography>
                      {session.originalStartedAt && (
                        <Typography as='div' size='xs' variant='ghost' color='muted'>
                          الموعد الأصلي:{' '}
                          {formatDateShort(session.originalStartedAt, user.timezone)}
                        </Typography>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='px-4 py-3'>{formattedTime}</TableCell>
                  <TableCell className='px-4 py-3'>
                    <Badge variant={statusConfig.variant} color={statusConfig.color}>
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <Button asChild variant='ghost' color='primary' size='icon'>
                      <Link to={`/sessions/${session.id}`} aria-label='عرض الجلسة'>
                        <Eye className='w-4 h-4' />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <PaginationControls
        value={vm.meta.page}
        totalPages={Math.max(vm.meta.totalPages, 1)}
        onValueChange={vm.setPage}
        disabled={vm.isHistoryLoading || vm.isHistoryRefreshing}
      />
    </div>
  );
}
