import { Loader2 } from 'lucide-react';
import { formatDateShort } from '@halaqa/shared';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Typography } from '@/components/ui/typography';
import { getAttendanceStatusConfig, getSessionStatusConfig } from '@/modules/session';
import { GroupReportExportButton } from '../components/GroupReportExportButton';
import { GroupReportFilterContainer } from '../components/GroupReportFilterContainer';
import { useGroupReportViewModel } from '../viewmodels/group-report.viewmodel';

const GROUP_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'نشطة',
  INACTIVE: 'غير نشطة',
  COMPLETED: 'مكتملة',
};

export function GroupReportView() {
  const vm = useGroupReportViewModel();

  return (
    <div className='space-y-4'>
      <PageHeader
        title='التقارير'
        description='تقرير الحلقة مع المعلم والمتعلمين والحضور خلال فترة محددة'
        actions={<GroupReportExportButton report={vm.report} />}
      />

      {vm.groupsError && (
        <Alert alertType='ERROR'>
          <AlertDescription>{vm.groupsError}</AlertDescription>
        </Alert>
      )}

      <GroupReportFilterContainer
        groupId={vm.filters.groupId}
        fromDate={vm.filters.fromDate}
        toDate={vm.filters.toDate}
        groupOptions={vm.groups}
        onGroupChange={vm.setGroupId}
        onFromDateChange={vm.setFromDate}
        onToDateChange={vm.setToDate}
        onClear={vm.clearFilters}
        disabled={vm.isGroupsLoading || vm.isReportRefreshing}
      />

      {vm.reportError && (
        <Alert alertType='ERROR'>
          <AlertDescription>{vm.reportError}</AlertDescription>
        </Alert>
      )}

      {!vm.hasCompleteFilters ? (
        <div className='flex items-center justify-center rounded-lg border border-dashed py-16 text-muted-foreground'>
          اختر الحلقة وفترة التاريخ لعرض التقرير
        </div>
      ) : vm.isReportLoading ? (
        <div className='flex items-center justify-center py-16 gap-2 text-muted-foreground'>
          <Loader2 className='w-6 h-6 animate-spin' />
          جاري تحميل التقرير...
        </div>
      ) : vm.report ? (
        <div className='space-y-4'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle size='lg'>بيانات الحلقة</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='space-y-1'>
                <Typography as='div' size='xs' className='text-muted-foreground'>
                  اسم الحلقة
                </Typography>
                <Typography as='div' size='sm' weight='medium'>
                  {vm.report.group.name}
                </Typography>
              </div>
              <div className='space-y-1'>
                <Typography as='div' size='xs' className='text-muted-foreground'>
                  المعلم
                </Typography>
                <Typography as='div' size='sm' weight='medium'>
                  {vm.report.tutor?.name ?? 'غير محدد'}
                </Typography>
              </div>
              <div className='space-y-1'>
                <Typography as='div' size='xs' className='text-muted-foreground'>
                  الحالة
                </Typography>
                <Typography as='div' size='sm' weight='medium'>
                  {GROUP_STATUS_LABELS[vm.report.group.status] ?? vm.report.group.status}
                </Typography>
              </div>
              <div className='space-y-1'>
                <Typography as='div' size='xs' className='text-muted-foreground'>
                  الفترة
                </Typography>
                <Typography as='div' size='sm' weight='medium'>
                  {vm.report.period.fromDate} إلى {vm.report.period.toDate}
                </Typography>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle size='lg'>المتعلمون ({vm.report.learners.length})</CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              <Table>
                <TableHeader className='bg-muted/40'>
                  <TableRow>
                    <TableHead className='px-4 py-3 text-right text-xs'>الاسم</TableHead>
                    <TableHead className='px-4 py-3 text-right text-xs'>تاريخ الانضمام</TableHead>
                    <TableHead className='px-4 py-3 text-right text-xs'>تاريخ المغادرة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vm.report.learners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <div className='flex items-center justify-center py-8 text-muted-foreground'>
                          لا يوجد متعلمون في هذه الفترة
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    vm.report.learners.map((learner) => (
                      <TableRow key={learner.id}>
                        <TableCell className='px-4 py-3'>{learner.name}</TableCell>
                        <TableCell className='px-4 py-3'>
                          {formatDateShort(learner.joinedAt, vm.report!.group.timezone)}
                        </TableCell>
                        <TableCell className='px-4 py-3'>
                          {learner.leftAt
                            ? formatDateShort(learner.leftAt, vm.report!.group.timezone)
                            : 'ما زال منضمًا'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle size='lg'>الجلسات والحضور ({vm.report.sessions.length})</CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              <Table>
                <TableHeader className='bg-muted/40'>
                  <TableRow>
                    <TableHead className='px-4 py-3 text-right text-xs'>التاريخ</TableHead>
                    <TableHead className='px-4 py-3 text-right text-xs'>حالة الجلسة</TableHead>
                    <TableHead className='px-4 py-3 text-right text-xs'>الحضور</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vm.report.sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <div className='flex items-center justify-center py-8 text-muted-foreground'>
                          لا توجد جلسات في هذه الفترة
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    vm.report.sessions.map((session) => {
                      const statusConfig = getSessionStatusConfig(session.status);
                      return (
                        <TableRow key={session.id}>
                          <TableCell className='px-4 py-3 align-top'>
                            {formatDateShort(session.startedAt, vm.report!.group.timezone)}
                          </TableCell>
                          <TableCell className='px-4 py-3 align-top'>
                            <Badge variant={statusConfig.variant} color={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className='px-4 py-3'>
                            {session.attendance.length === 0 ? (
                              <Typography as='span' size='sm' className='text-muted-foreground'>
                                لا يوجد حضور مسجل
                              </Typography>
                            ) : (
                              <div className='flex flex-wrap gap-2'>
                                {session.attendance.map((attendance) => {
                                  const attendanceConfig = getAttendanceStatusConfig(
                                    attendance.status
                                  );
                                  return (
                                    <Badge
                                      key={attendance.studentId}
                                      variant={attendanceConfig.variant}
                                      color={attendanceConfig.color}
                                    >
                                      {attendance.studentName} - {attendanceConfig.label}
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
