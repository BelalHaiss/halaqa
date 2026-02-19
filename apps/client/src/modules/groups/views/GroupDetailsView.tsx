import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { History, Loader2, Plus, Users } from 'lucide-react';
import { startMinutesToTime } from '@halaqa/shared';
import { useApp } from '@/contexts/AppContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { StudentMainInfoModal } from '@/components/ui/student-main-info-modal';
import { TimezoneDisplay } from '@/components/ui/timezone-display';
import { Typography } from '@/components/ui/typography';
import { dayNames } from '../constants';
import { GroupFormModal } from '../components/GroupFormModal';
import { StudentSummaryCard } from '../components/StudentSummaryCard';
import { useGroupDetailsViewModel } from '../viewmodels/group-details.viewmodel';

export const GroupDetailsView = () => {
  const { user } = useApp();
  const { id } = useParams<{ id: string }>();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studentPendingDelete, setStudentPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  if (!user || !id) {
    return null;
  }

  const vm = useGroupDetailsViewModel(id, user);

  if (vm.isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (vm.error || !vm.group) {
    return (
      <Alert variant='soft' color='danger'>
        <AlertDescription>{vm.error || 'الحلقة غير موجودة'}</AlertDescription>
      </Alert>
    );
  }

  const scheduleDays = vm.group.scheduleDays
    .map((scheduleDay) => dayNames[scheduleDay.dayOfWeek])
    .join(' - ');

  return (
    <div className='space-y-6'>
      <PageHeader
        title={vm.group.name}
        description='تفاصيل الحلقة'
        actions={
          vm.canManageGroup ? (
            <Button onClick={() => setIsEditModalOpen(true)}>
              تعديل الحلقة
            </Button>
          ) : null
        }
      />

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle size='lg'>معلومات الحلقة</CardTitle>
            <StatusBadge status={vm.group.status} />
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Typography as='div' size='sm' variant='ghost' color='muted'>
              المعلم
            </Typography>
            <Typography as='div' size='sm' weight='medium'>
              {vm.group.tutor.name}
            </Typography>
          </div>

          <div className='flex items-center justify-between'>
            <Typography as='div' size='sm' variant='ghost' color='muted'>
              المنطقة الزمنية
            </Typography>
            <TimezoneDisplay
              timezone={vm.group.timezone}
              variant='soft'
              color='muted'
              size='sm'
            />
          </div>

          <div className='flex items-center justify-between'>
            <Typography as='div' size='sm' variant='ghost' color='muted'>
              الأيام
            </Typography>
            <Typography as='div' size='sm' weight='medium'>
              {scheduleDays || 'غير محدد'}
            </Typography>
          </div>

          <div className='flex items-center justify-between'>
            <Typography as='div' size='sm' variant='ghost' color='muted'>
              الوقت
            </Typography>
            <Typography as='div' size='sm' weight='medium'>
              {vm.group.scheduleDays[0]
                ? startMinutesToTime(vm.group.scheduleDays[0].startMinutes)
                : 'غير محدد'}
            </Typography>
          </div>

          <div className='flex items-center justify-between'>
            <Typography as='div' size='sm' variant='ghost' color='muted'>
              المدة
            </Typography>
            <Typography as='div' size='sm' weight='medium'>
              {vm.group.scheduleDays[0]?.durationMinutes ?? 0} دقيقة
            </Typography>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <CardTitle size='lg' className='flex items-center gap-2'>
              <Users className='w-5 h-5' />
              الطلاب ({vm.group.students.length})
            </CardTitle>
            <div className='flex items-center gap-2'>
              <Button asChild variant='outline' color='muted' className='gap-2'>
                <Link to={`/history?groupId=${vm.group.id}`}>
                  <History className='w-4 h-4' />
                  السجل
                </Link>
              </Button>
              {vm.canManageGroup ? (
                <Button onClick={vm.openCreateLearnerModal} className='gap-2'>
                  <Plus className='w-4 h-4' />
                  إضافة متعلم
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {vm.group.students.length === 0 ? (
            <div className='text-center py-8'>
              <Users className='w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground' />
              <Typography as='div' size='sm' variant='ghost' color='muted'>
                لا يوجد طلاب في هذه الحلقة
              </Typography>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {vm.group.students.map((student) => (
                <StudentSummaryCard
                  key={student.id}
                  student={student}
                  onClick={() => vm.openLearnerEditModal(student)}
                  onDelete={
                    vm.canManageGroup
                      ? () =>
                          setStudentPendingDelete({
                            id: student.id,
                            name: student.name
                          })
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <GroupFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        mode='edit'
        group={vm.group}
        isLoading={vm.isUpdatingGroup}
        onSubmit={vm.updateGroupSettings}
      />

      <StudentMainInfoModal
        open={vm.isLearnerModalOpen}
        onOpenChange={vm.setIsLearnerModalOpen}
        mode={vm.learnerModalMode}
        learner={
          vm.selectedLearner
            ? {
                id: vm.selectedLearner.id,
                name: vm.selectedLearner.name,
                timezone: vm.selectedLearner.timezone,
                contact: {
                  notes: vm.selectedLearner.notes
                }
              }
            : null
        }
        addToGroupId={vm.group.id}
        onSubmit={vm.submitLearnerMainInfo}
        isLoading={vm.isAddingStudent || vm.isUpdatingLearner}
      />

      <ConfirmDialog
        open={Boolean(studentPendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setStudentPendingDelete(null);
          }
        }}
        title='حذف المتعلم من الحلقة'
        description={
          studentPendingDelete
            ? `هل تريد حذف "${studentPendingDelete.name}" من هذه الحلقة؟`
            : 'هل تريد حذف هذا المتعلم من الحلقة؟'
        }
        confirmText='حذف'
        cancelText='إلغاء'
        variant='solid'
        color='danger'
        onConfirm={async () => {
          if (!studentPendingDelete) {
            return;
          }
          await vm.removeStudentFromGroup(studentPendingDelete.id);
          setStudentPendingDelete(null);
        }}
      />
    </div>
  );
};
