import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Loader2, Plus, Users } from 'lucide-react';
import { startMinutesToTime } from '@halaqa/shared';
import { useApp } from '@/contexts/AppContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Typography } from '@/components/ui/typography';
import { dayNames } from '../constants';
import { StatsCountCard } from '../components/StatsCountCard';
import { GroupFormModal } from '../components/GroupFormModal';
import { useGroupsViewModel } from '../viewmodels/groups.viewmodel';

export const GroupsView = () => {
  const { user } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!user) {
    return null;
  }

  const vm = useGroupsViewModel(user);

  if (vm.isLoadingGroups) {
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
    <div className='space-y-6'>
      <section className='space-y-3 rounded-2xl border border-primary/20 bg-linear-to-l from-primary/5 via-background to-success/5 p-4'>
        <div className='flex items-center justify-between'>
          <Typography as='h2' size='lg' weight='semibold'>
            ملخص الحلقات
          </Typography>
          <Typography as='div' size='xs' variant='ghost' color='muted'>
            إحصائيات مباشرة عن المتعلمين والحلقات
          </Typography>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <StatsCountCard
            icon={GraduationCap}
            data={{ count: vm.learnersCount, title: 'إجمالي المتعلمين' }}
            isLoading={vm.isLoadingLearnersCount}
            variant='soft'
            color='primary'
          />
          {user.role !== 'TUTOR' ? (
            <StatsCountCard
              icon={Users}
              data={{ count: vm.tutorsCount, title: 'إجمالي معلمي القرآن' }}
              isLoading={vm.isLoadingTutorsCount}
              variant='soft'
              color='success'
            />
          ) : null}
          <StatsCountCard
            icon={BookOpen}
            data={{ count: vm.groupsCount, title: 'إجمالي الحلقات' }}
            isLoading={vm.isLoadingGroupsCount}
            variant='outline'
            color='muted'
          />
        </div>
      </section>
      <PageHeader
        title='الحلقات'
        description='إدارة حلقات تحفيظ القرآن'
        actions={
          vm.canManageGroups ? (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className='gap-2'
            >
              <Plus className='w-4 h-4' />
              إضافة حلقة
            </Button>
          ) : null
        }
      />

      <div className='h-px bg-border' />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {vm.groups.map((group) => {
          const scheduleDays = group.scheduleDays
            .map((scheduleDay) => dayNames[scheduleDay.dayOfWeek])
            .join(' - ');

          return (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className='block transition-shadow hover:shadow-md'
            >
              <Card>
                <CardContent className='p-4 space-y-3'>
                  <div className='flex items-start justify-between'>
                    <div className='bg-primary/10 p-2 rounded-lg'>
                      <Users className='w-5 h-5 text-primary' />
                    </div>
                    <StatusBadge status={group.status} />
                  </div>

                  <Typography as='h3' size='lg' weight='semibold'>
                    {group.name}
                  </Typography>

                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between'>
                      <Typography
                        as='div'
                        size='xs'
                        variant='ghost'
                        color='muted'
                      >
                        عدد الطلاب
                      </Typography>
                      <Typography as='div' size='xs' weight='medium'>
                        {group.studentsCount}
                      </Typography>
                    </div>
                    <div className='flex items-center justify-between'>
                      <Typography
                        as='div'
                        size='xs'
                        variant='ghost'
                        color='muted'
                      >
                        الوقت
                      </Typography>
                      <Typography as='div' size='xs' weight='medium'>
                        {group.scheduleDays[0]
                          ? startMinutesToTime(
                              group.scheduleDays[0].startMinutes
                            )
                          : 'غير محدد'}
                      </Typography>
                    </div>
                    <div className='pt-1.5 border-t border-border'>
                      <Typography
                        as='div'
                        size='xs'
                        variant='ghost'
                        color='muted'
                      >
                        {scheduleDays || 'لا توجد أيام محددة'}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {vm.groups.length === 0 ? (
        <div className='text-center py-12'>
          <Users className='w-12 h-12 mx-auto mb-3 opacity-50' />
          <Typography as='div' size='sm' variant='ghost' color='muted'>
            لا توجد حلقات
          </Typography>
        </div>
      ) : null}

      <GroupFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode='create'
        tutors={vm.tutors}
        isLoading={vm.isCreatingGroup || vm.isLoadingTutors}
        onSubmit={vm.createGroup}
      />
    </div>
  );
};
