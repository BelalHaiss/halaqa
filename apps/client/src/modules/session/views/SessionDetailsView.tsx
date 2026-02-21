import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Calendar, Clock, Loader2, Save, Users } from 'lucide-react';
import {
  AttendanceStatus,
  formatISODateToUserTimezone,
  minutesToTimeString
} from '@halaqa/shared';
import { useApp } from '@/contexts/AppContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { Typography } from '@/components/ui/typography';
import {
  attendanceEditSchema,
  type AttendanceEditFormData
} from '../schema/session.schema';
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
  const [isAttendanceConfirmDialogOpen, setIsAttendanceConfirmDialogOpen] =
    useState(false);

  if (!user || !id) {
    return null;
  }

  const vm = useSessionDetailsViewModel(id);
  const attendanceFormValues = useMemo<AttendanceEditFormData>(() => {
    if (!vm.session) {
      return { attendance: [] };
    }

    const existingAttendanceByStudentId = vm.session.attendance.reduce(
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
      attendance: vm.session.students.map((student) => ({
        studentId: student.id,
        studentName: student.name,
        status:
          vm.session.status === 'COMPLETED'
            ? (existingAttendanceByStudentId[student.id]?.status ?? null)
            : null,
        notes:
          vm.session.status === 'COMPLETED'
            ? (existingAttendanceByStudentId[student.id]?.notes ?? '')
            : ''
      }))
    };
  }, [vm.session]);

  const attendanceForm = useForm<AttendanceEditFormData>({
    resolver: zodResolver(attendanceEditSchema),
    mode: 'onChange',
    defaultValues: { attendance: [] },
    values: attendanceFormValues
  });

  const attendanceViewMap = vm.session?.attendance.reduce(
    (acc, item) => {
      acc[item.studentId] = {
        status: item.status,
        notes: item.notes
      };
      return acc;
    },
    {} as Record<string, { status: AttendanceStatus; notes?: string }>
  );

  const shouldShowAttendanceCard = true;

  const canStoreAttendance =
    vm.session?.status === 'SCHEDULED' ||
    vm.session?.status === 'RESCHEDULED';
  const handleSaveAttendance = attendanceForm.handleSubmit(async (values) => {
    await vm.saveAttendance(
      values.attendance.map((item) => ({
        studentId: item.studentId,
        status: item.status as AttendanceStatus,
        notes: item.notes?.trim() ? item.notes.trim() : undefined
      }))
    );
  });

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
  const formattedTime = minutesToTimeString(time as any);
  const statusConfig = getSessionStatusConfig(vm.session.status);

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
                {formattedTime}
              </Typography>
            </div>
          </div>

          {vm.session.originalStartedAt && (
            <div className='pt-2 border-t border-border'>
              <Alert variant='soft' color='muted'>
                <AlertDescription>
                  <RescheduledNotice
                    originalStartedAt={vm.session.originalStartedAt}
                    timezone={user.timezone}
                    variant='full'
                  />
                </AlertDescription>
              </Alert>
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

      {shouldShowAttendanceCard && (
        <Card>
          <CardHeader>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <CardTitle size='lg' className='flex items-center gap-2'>
                <Users className='w-5 h-5' />
                الحضور والغياب ({vm.session.students.length})
              </CardTitle>
              {canStoreAttendance && (
                <Button
                  onClick={() => setIsAttendanceConfirmDialogOpen(true)}
                  disabled={vm.isUpdating || !attendanceForm.formState.isValid}
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
              <>
                {canStoreAttendance && vm.session.status !== 'COMPLETED' && (
                  <Alert variant='soft' color='muted' className='mb-3'>
                    <AlertDescription>
                      لا توجد قيم افتراضية للحضور. يجب تحديد حالة كل طالب قبل
                      حفظ الحضور.
                    </AlertDescription>
                  </Alert>
                )}
                <div className='space-y-2'>
                  {vm.session.students.map((student, index) =>
                    canStoreAttendance ? (
                      <AttendanceRow
                        key={student.id}
                        mode='edit'
                        student={student}
                        index={index}
                        control={attendanceForm.control}
                        errors={attendanceForm.formState.errors}
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
      <ConfirmDialog
        open={isAttendanceConfirmDialogOpen}
        onOpenChange={setIsAttendanceConfirmDialogOpen}
        title='حفظ الحضور'
        description='هل تريد حفظ بيانات الحضور والغياب لهذه الجلسة؟'
        confirmText='حفظ الحضور'
        cancelText='رجوع'
        variant='solid'
        color='primary'
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
