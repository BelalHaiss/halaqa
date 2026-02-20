import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Loader2, Save, Users } from 'lucide-react';
import { formatISODateToUserTimezone } from '@halaqa/shared';
import { useApp } from '@/contexts/AppContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { Typography } from '@/components/ui/typography';
import { getSessionStatusConfig } from '../utils/session.util';
import { useSessionDetailsViewModel } from '../viewmodels/session-details.viewmodel';
import { AttendanceRow } from '../components/AttendanceRow';
import { RescheduleDialog } from '../components/RescheduleDialog';

export const SessionDetailsView = () => {
  const { user } = useApp();
  const { id } = useParams<{ id: string }>();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);

  if (!user || !id) {
    return null;
  }

  const vm = useSessionDetailsViewModel(id);

  useEffect(() => {
    if (vm.session && Object.keys(vm.attendanceMap).length === 0) {
      vm.initializeAttendanceMap(vm.session);
    }
  }, [vm.session]);

  if (vm.isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (vm.error || !vm.session) {
    return (
      <Alert variant='soft' color='danger'>
        <AlertDescription>{vm.error || 'الجلسة غير موجودة'}</AlertDescription>
      </Alert>
    );
  }

  const { date, time } = formatISODateToUserTimezone(
    vm.session.startedAt,
    user.timezone
  );
  const statusConfig = getSessionStatusConfig(vm.session.status);
  const canEdit =
    vm.session.canBeRescheduled || vm.session.status === 'SCHEDULED';

  return (
    <div className='space-y-6'>
      <PageHeader
        title='تفاصيل الجلسة'
        description={vm.session.groupInfo.name}
        actions={
          <Button asChild variant='outline' color='muted' className='gap-2'>
            <Link to='/sessions'>
              <ArrowLeft className='w-4 h-4' />
              العودة
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle size='lg'>معلومات الجلسة</CardTitle>
            <Badge variant={statusConfig.variant} color={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Typography as='div' size='sm' variant='ghost' color='muted'>
              الحلقة
            </Typography>
            <Typography as='div' size='sm' weight='medium'>
              <Link
                to={`/groups/${vm.session.groupInfo.id}`}
                className='text-primary hover:underline'
              >
                {vm.session.groupInfo.name}
              </Link>
            </Typography>
          </div>

          <div className='flex items-center justify-between'>
            <Typography as='div' size='sm' variant='ghost' color='muted'>
              المعلم
            </Typography>
            <Typography as='div' size='sm' weight='medium'>
              {vm.session.tutorInfo.name}
            </Typography>
          </div>

          <div className='flex items-center justify-between'>
            <Typography as='div' size='sm' variant='ghost' color='muted'>
              التاريخ
            </Typography>
            <div className='flex items-center gap-1'>
              <Calendar className='w-4 h-4 text-muted-foreground' />
              <Typography as='div' size='sm' weight='medium'>
                {date}
              </Typography>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <Typography as='div' size='sm' variant='ghost' color='muted'>
              الوقت
            </Typography>
            <div className='flex items-center gap-1'>
              <Clock className='w-4 h-4 text-muted-foreground' />
              <Typography as='div' size='sm' weight='medium'>
                {time}
              </Typography>
            </div>
          </div>

          {vm.session.originalStartedAt && (
            <div className='pt-2 border-t border-border'>
              <Alert variant='soft' color='muted'>
                <AlertDescription>
                  تم إعادة جدولة هذه الجلسة من{' '}
                  {
                    formatISODateToUserTimezone(
                      vm.session.originalStartedAt,
                      user.timezone
                    ).date
                  }{' '}
                  في{' '}
                  {
                    formatISODateToUserTimezone(
                      vm.session.originalStartedAt,
                      user.timezone
                    ).time
                  }
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <CardTitle size='lg' className='flex items-center gap-2'>
              <Users className='w-5 h-5' />
              الحضور والغياب ({vm.session.students.length})
            </CardTitle>
            {canEdit && (
              <Button
                onClick={vm.saveAttendance}
                disabled={vm.isUpdating}
                className='gap-2'
              >
                {vm.isUpdating ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Save className='w-4 h-4' />
                )}
                حفظ الحضور
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {vm.session.students.length === 0 ? (
            <div className='text-center py-8'>
              <Users className='w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground' />
              <Typography as='div' size='sm' variant='ghost' color='muted'>
                لا يوجد طلاب في هذه الجلسة
              </Typography>
            </div>
          ) : (
            <div className='space-y-2'>
              {vm.session.students.map((student) => (
                <AttendanceRow
                  key={student.id}
                  student={student}
                  attendance={vm.attendanceMap[student.id]}
                  onStatusChange={(status) =>
                    vm.updateAttendanceStatus(student.id, status)
                  }
                  onNotesChange={(notes) =>
                    vm.updateAttendanceNotes(student.id, notes)
                  }
                  disabled={!canEdit}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {vm.session.canBeRescheduled && (
        <Card>
          <CardHeader>
            <CardTitle size='lg'>إجراءات الجلسة</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-3'>
            <Button
              variant='outline'
              color='primary'
              onClick={() => setIsRescheduleDialogOpen(true)}
              disabled={vm.isUpdating}
            >
              إعادة جدولة
            </Button>
            <Button
              variant='outline'
              color='danger'
              onClick={() => setIsCancelDialogOpen(true)}
              disabled={vm.isUpdating}
            >
              إلغاء الجلسة
            </Button>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title='إلغاء الجلسة'
        description='هل أنت متأكد من إلغاء هذه الجلسة؟ لن يمكن التراجع عن هذا الإجراء.'
        confirmText='إلغاء الجلسة'
        cancelText='رجوع'
        variant='solid'
        color='danger'
        onConfirm={async () => {
          await vm.cancelSession();
          setIsCancelDialogOpen(false);
        }}
      />

      <RescheduleDialog
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
        onReschedule={async (date, time) => {
          await vm.rescheduleSession(date, time);
          setIsRescheduleDialogOpen(false);
        }}
        isLoading={vm.isUpdating}
        timezone={user.timezone}
      />
    </div>
  );
};
