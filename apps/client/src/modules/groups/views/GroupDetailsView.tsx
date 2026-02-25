import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { History, Loader2, Plus, Users } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { TimezoneDisplay } from '@/components/ui/timezone-display';
import { Typography } from '@/components/ui/typography';
import { StudentMainInfoModal } from '@/modules/learners/components/student-main-info-modal';
import { dayNames } from '../constants';
import { getGroupStatusConfig } from '../utils/group.util';
import { AddLearnersToGroupModal } from '../components/AddLearnersToGroupModal';
import { GroupFormModal } from '../components/GroupFormModal';
import { GroupScheduleTimeText } from '../components/GroupScheduleTimeText';
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

  const vm = useGroupDetailsViewModel(id, user, {
    shouldLoadTutors: isEditModalOpen
  });

  if (vm.isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (vm.error || !vm.group) {
    return (
      <Alert className='border-danger/30 bg-danger/10 text-danger'>
        <AlertDescription>{vm.error || 'الحلقة غير موجودة'}</AlertDescription>
      </Alert>
    );
  }

  const scheduleDays = vm.group.scheduleDays
    .map((scheduleDay) => dayNames[scheduleDay.dayOfWeek])
    .join(' - ');

  const groupStatusConfig = getGroupStatusConfig(vm.group.status);

  return (
    <div className='space-y-6'>
      <PageHeader
        title={vm.group.name}
        description='تفاصيل الحلقة'
        actions={
          vm.canManageGroup ? (
            <Button onClick={() => setIsEditModalOpen(true)}>تعديل الحلقة</Button>
          ) : null
        }
      />

      <Card>
        <CardHeader>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <CardTitle size='lg'>معلومات الحلقة</CardTitle>
            <Badge variant={groupStatusConfig.variant} color={groupStatusConfig.color}>
              {groupStatusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <Typography as='div' size='sm' className='text-muted-foreground'>
              المعلم
            </Typography>
            <Typography as='div' size='sm' weight='medium'>
              {vm.group.tutor.name}
            </Typography>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-2'>
            <Typography as='div' size='sm' className='text-muted-foreground'>
              المنطقة الزمنية
            </Typography>
            <TimezoneDisplay timezone={vm.group.timezone} />
          </div>

          <div className='flex flex-wrap items-center justify-between gap-2'>
            <Typography as='div' size='sm' className='text-muted-foreground'>
              الأيام
            </Typography>
            <Typography as='div' size='sm' weight='medium'>
              {scheduleDays || 'غير محدد'}
            </Typography>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-2'>
            <Typography as='div' size='sm' className='text-muted-foreground'>
              الوقت
            </Typography>
            <Typography as='div' size='sm' weight='medium'>
              <GroupScheduleTimeText
                scheduleDays={vm.group.scheduleDays}
                emptyLabel='غير محدد'
              />
            </Typography>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-2'>
            <Typography as='div' size='sm' className='text-muted-foreground'>
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
              <Users className='h-5 w-5' />
              الطلاب ({vm.group.students.length})
            </CardTitle>
            <div className='flex items-center gap-2'>
              <Button asChild variant='outline' color='muted' className='gap-2'>
                <Link to={`/sessions/history?groupId=${vm.group.id}`}>
                  <History className='h-4 w-4' />
                  السجل
                </Link>
              </Button>
              {vm.canManageGroup ? (
                <Button onClick={vm.openAddLearnersModal} className='gap-2'>
                  <Plus className='h-4 w-4' />
                  إضافة متعلم
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {vm.group.students.length === 0 ? (
            <div className='py-8 text-center'>
              <Users className='mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50' />
              <Typography as='div' size='sm' className='text-muted-foreground'>
                لا يوجد طلاب في هذه الحلقة
              </Typography>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
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
        tutors={vm.tutors}
        isLoading={vm.isUpdatingGroup || vm.isLoadingTutors}
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
        onSubmit={vm.submitLearnerMainInfo}
        isLoading={vm.isUpdatingLearner}
      />

      <AddLearnersToGroupModal
        open={vm.isAddLearnersModalOpen}
        onOpenChange={vm.setIsAddLearnersModalOpen}
        learners={vm.availableLearners}
        isLoadingLearners={vm.isLoadingAvailableLearners}
        isAttachingExisting={vm.isAddingExistingStudents}
        isCreatingLearner={vm.isAddingStudent}
        onAttachExisting={vm.addExistingLearnersToGroup}
        onCreateAndAttach={vm.createLearnerAndAttachToGroup}
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
        intent='destructive'
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
