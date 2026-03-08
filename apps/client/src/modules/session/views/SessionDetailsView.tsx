import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, Loader2, Save, Users } from 'lucide-react';
import { AttendanceStatus, formatISODateToUserTimezone, minutesToTimeString } from '@halaqa/shared';
import { useApp } from '@/contexts/AppContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BackButton } from '@/components/ui/back-button';
import { PageHeader } from '@/components/ui/page-header';
import { Typography } from '@/components/ui/typography';
import { attendanceEditSchema, type AttendanceEditFormData } from '../utils/session.validation';
import { getSessionStatusConfig } from '../utils/session.util';
import { useSessionDetailsViewModel } from '../viewmodels/session-details.viewmodel';
import { AttendanceRow } from '../components/AttendanceRow';
import { RescheduleDialog } from '../components/RescheduleDialog';
import { RescheduledNotice } from '../components/RescheduledNotice';

export const SessionDetailsView = () => {
  const { user } = useApp();
  const { id } = useParams<{ id: string }>();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isAttendanceConfirmDialogOpen, setIsAttendanceConfirmDialogOpen] = useState(false);

  if (!user || !id) {
    return null;
  }

  const vm = useSessionDetailsViewModel(id);
  const attendanceFormValues = useMemo<AttendanceEditFormData>(() => {
    if (!vm.session) {
      return { attendance: [] };
    }
    const session = vm.session;

    const existingAttendanceByStudentId = session.attendance.reduce(
      (acc, item) => {
        acc[item.studentId] = item;
        return acc;
      },
      {} as Record<
        string,
        {
          studentId: string;
          studentName: string;
          status: AttendanceStatus;
          notes?: string;
        }
      >
    );

    return {
      attendance: session.students.map((student) => ({
        studentId: student.id,
        studentName: student.name,
        status:
          session.status === 'COMPLETED'
            ? (existingAttendanceByStudentId[student.id]?.status ?? null)
            : null,
        notes:
          session.status === 'COMPLETED'
            ? (existingAttendanceByStudentId[student.id]?.notes ?? '')
            : '',
      })),
    };
  }, [vm.session]);

  const attendanceForm = useForm<AttendanceEditFormData>({
    resolver: zodResolver(attendanceEditSchema),
    mode: 'onTouched',
    defaultValues: { attendance: [] },
    values: attendanceFormValues,
  });

  const attendanceViewMap = vm.session?.attendance.reduce(
    (acc, item) => {
      acc[item.studentId] = {
        status: item.status,
        notes: item.notes,
      };
      return acc;
    },
    {} as Record<string, { status: AttendanceStatus; notes?: string }>
  );

  const shouldShowAttendanceCard = true;
  const canStoreAttendance =
    vm.session?.status === 'SCHEDULED' || vm.session?.status === 'RESCHEDULED';

  const handleSaveAttendance = attendanceForm.handleSubmit(async (values) => {
    await vm.saveAttendance(
      values.attendance.map((item) => ({
        studentId: item.studentId,
        status: item.status as AttendanceStatus,
        notes: item.notes?.trim() ? item.notes.trim() : undefined,
      }))
    );
  });

  if (vm.isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (vm.error || !vm.session) {
    return (
      <Alert alertType='ERROR'>
        <AlertDescription>{vm.error || 'الجلسة غير موجودة'}</AlertDescription>
      </Alert>
    );
  }

  const { date, time } = formatISODateToUserTimezone(vm.session.startedAt, user.timezone);
  const formattedTime = minutesToTimeString(time as any);
  const statusConfig = getSessionStatusConfig(vm.session.status);

  return (
    <div className='space-y-6'>
      <PageHeader
        title='تفاصيل الجلسة'
        description={vm.session.groupInfo.name}
        actions={<BackButton fallbackTo='/sessions' />}
      />

      <Card>
        <CardHeader>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <CardTitle size='lg'>معلومات الجلسة</CardTitle>
            <Badge variant={statusConfig.variant} color={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <Typography as='div' size='sm' className='text-muted-foreground'>
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

          <div className='flex flex-wrap items-center justify-between gap-2'>
            <Typography as='div' size='sm' className='text-muted-foreground'>
              المعلم
            </Typography>
            <Typography as='div' size='sm' weight='medium'>
              {vm.session.tutorInfo?.name ?? 'غير محدد'}
            </Typography>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-2'>
            <Typography as='div' size='sm' className='text-muted-foreground'>
              التاريخ
            </Typography>
            <div className='flex items-center gap-1'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <Typography as='div' size='sm' weight='medium'>
                {date}
              </Typography>
            </div>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-2'>
            <Typography as='div' size='sm' className='text-muted-foreground'>
              الوقت
            </Typography>
            <div className='flex items-center gap-1'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <Typography as='div' size='sm' weight='medium'>
                {formattedTime}
              </Typography>
            </div>
          </div>

          {vm.session.originalStartedAt ? (
            <div className='border-t border-border pt-2'>
              <Alert alertType='WARN'>
                <AlertDescription>
                  <RescheduledNotice
                    originalStartedAt={vm.session.originalStartedAt}
                    timezone={user.timezone}
                    variant='full'
                  />
                </AlertDescription>
              </Alert>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {vm.session.canBeRescheduled ? (
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
      ) : null}

      {shouldShowAttendanceCard ? (
        <Card>
          <CardHeader>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <CardTitle size='lg' className='flex items-center gap-2'>
                <Users className='h-5 w-5' />
                الحضور والغياب ({vm.session.students.length})
              </CardTitle>
              {canStoreAttendance ? (
                <Button
                  onClick={() => setIsAttendanceConfirmDialogOpen(true)}
                  disabled={
                    vm.isUpdating ||
                    !attendanceForm.formState.isDirty ||
                    !attendanceForm.formState.isValid
                  }
                  className='gap-2'
                >
                  {vm.isUpdating ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Save className='h-4 w-4' />
                  )}
                  حفظ الحضور
                </Button>
              ) : null}
            </div>
          </CardHeader>

          <CardContent>
            {vm.session.students.length === 0 ? (
              <div className='py-8 text-center'>
                <Users className='mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50' />
                <Typography as='div' size='sm' className='text-muted-foreground'>
                  لا يوجد طلاب في هذه الجلسة
                </Typography>
              </div>
            ) : (
              <>
                {canStoreAttendance && vm.session.status !== 'COMPLETED' ? (
                  <Alert alertType='WARN'>
                    <AlertDescription>
                      لا توجد قيم افتراضية للحضور. يجب تحديد حالة كل طالب قبل حفظ الحضور.
                    </AlertDescription>
                  </Alert>
                ) : null}
                <div className='space-y-2'>
                  {vm.session.students.map((student, index) =>
                    canStoreAttendance ? (
                      <AttendanceRow
                        key={student.id}
                        mode='edit'
                        student={student}
                        index={index}
                        control={attendanceForm.control}
                        disabled={vm.isUpdating}
                      />
                    ) : (
                      <AttendanceRow
                        key={student.id}
                        mode='view'
                        student={student}
                        attendance={attendanceViewMap?.[student.id]}
                      />
                    )
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      <ConfirmDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title='إلغاء الجلسة'
        description='هل أنت متأكد من إلغاء هذه الجلسة؟ لن يمكن التراجع عن هذا الإجراء.'
        confirmText='إلغاء الجلسة'
        cancelText='رجوع'
        intent='destructive'
        onConfirm={async () => {
          await vm.cancelSession();
          setIsCancelDialogOpen(false);
        }}
      />

      <ConfirmDialog
        open={isAttendanceConfirmDialogOpen}
        onOpenChange={setIsAttendanceConfirmDialogOpen}
        title='حفظ الحضور'
        description='هل تريد حفظ بيانات الحضور والغياب لهذه الجلسة؟'
        confirmText='حفظ الحضور'
        cancelText='رجوع'
        onConfirm={async () => {
          await handleSaveAttendance();
          setIsAttendanceConfirmDialogOpen(false);
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
