import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Loader2, Plus, Users } from 'lucide-react';
import { GroupSummaryDto } from '@halaqa/shared';
import { useApp } from '@/contexts/AppContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { TimezoneDisplay } from '@/components/ui/timezone-display';
import { Typography } from '@/components/ui/typography';
import { dayNames, STATUS_LABELS, STATUS_ORDER } from '../constants';
import { getGroupStatusConfig } from '../utils/group.util';
import { StatsCountCard } from '../components/StatsCountCard';
import { GroupFormModal } from '../components/GroupFormModal';
import { GroupScheduleTimeText } from '../components/GroupScheduleTimeText';
import { useGroupsViewModel } from '../viewmodels/groups.viewmodel';

const groupsByStatus = (groups: GroupSummaryDto[]) => {
  return STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    groups: groups.filter((g) => g.status === status),
  }));
};

export const GroupsView = () => {
  const { user } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!user) {
    return null;
  }

  const vm = useGroupsViewModel(user, {
    shouldLoadTutors: isCreateModalOpen,
  });

  if (vm.isLoadingGroups) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (vm.groupsError) {
    return (
      <Alert alertType='ERROR'>
        <AlertDescription>{vm.groupsError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      <section className='space-y-3 rounded-2xl border border-primary/20 bg-linear-to-l from-primary/5 via-background to-success/5 p-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <Typography as='h2' size='lg' weight='semibold'>
            ملخص الحلقات
          </Typography>
          <Typography as='div' size='xs' className='text-muted-foreground'>
            إحصائيات مباشرة عن المتعلمين والحلقات
          </Typography>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <StatsCountCard
            icon={GraduationCap}
            data={{ count: vm.learnersCount, title: 'إجمالي المتعلمين' }}
            isLoading={vm.isLoadingLearnersCount}
            className='bg-linear-to-br from-primary/15 via-primary/5 to-background border-primary/30 ring-primary/20'
            iconClassName='bg-primary/15 text-primary'
          />
          {user.role !== 'TUTOR' ? (
            <StatsCountCard
              icon={Users}
              data={{ count: vm.tutorsCount, title: 'إجمالي معلمي القرآن' }}
              isLoading={vm.isLoadingTutorsCount}
              className='bg-linear-to-br from-success/15 via-success/5 to-background border-success/30 ring-success/20'
              iconClassName='bg-success/15 text-success'
            />
          ) : null}
          <StatsCountCard
            icon={BookOpen}
            data={{ count: vm.groupsCount, title: 'إجمالي الحلقات' }}
            isLoading={vm.isLoadingGroupsCount}
            className='bg-card border-border ring-border'
            iconClassName='bg-muted/70 text-muted-foreground'
          />
        </div>
      </section>

      <PageHeader
        title='الحلقات'
        description='إدارة حلقات تحفيظ القرآن'
        actions={
          vm.canManageGroups ? (
            <Button onClick={() => setIsCreateModalOpen(true)} className='gap-2'>
              <Plus className='h-4 w-4' />
              إضافة حلقة
            </Button>
          ) : null
        }
      />

      <div className='h-px bg-border' />

      {groupsByStatus(vm.groups).map(({ status, label, groups }) => (
        <section key={status} className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Typography as='h2' size='lg' weight='semibold'>
              {label}
            </Typography>
            <Typography as='span' size='sm' className='text-muted-foreground'>
              ({groups.length})
            </Typography>
          </div>

          {groups.length > 0 ? (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {groups.map((group) => {
                const scheduleDays = group.scheduleDays
                  .map((scheduleDay) => dayNames[scheduleDay.dayOfWeek])
                  .join(' - ');

                const statusConfig = getGroupStatusConfig(group.status);

                return (
                  <Link
                    key={group.id}
                    to={`/groups/${group.id}`}
                    className='block transition-shadow hover:shadow-md'
                  >
                    <Card>
                      <CardContent className='space-y-3 p-4'>
                        <div className='flex items-start justify-between'>
                          <div className='rounded-lg bg-primary/10 p-2'>
                            <Users className='h-5 w-5 text-primary' />
                          </div>
                          <Badge variant={statusConfig.variant} color={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <Typography as='h3' size='lg' weight='semibold'>
                          {group.name}
                        </Typography>

                        <div className='space-y-1.5'>
                          <div className='flex items-center justify-between'>
                            <Typography as='div' size='xs' className='text-muted-foreground'>
                              عدد الطلاب
                            </Typography>
                            <Typography as='div' size='xs' weight='medium'>
                              {group.studentsCount}
                            </Typography>
                          </div>
                          <div className='flex items-center justify-between'>
                            <Typography as='div' size='xs' className='text-muted-foreground'>
                              المنطقة الزمنية
                            </Typography>
                            <TimezoneDisplay timezone={group.timezone} />
                          </div>
                          <div className='flex items-center justify-between'>
                            <Typography as='div' size='xs' className='text-muted-foreground'>
                              الوقت
                            </Typography>
                            <Typography as='div' size='xs' weight='medium'>
                              <GroupScheduleTimeText
                                scheduleDays={group.scheduleDays}
                                emptyLabel='غير محدد'
                              />
                            </Typography>
                          </div>
                          <div className='border-t border-border pt-1.5'>
                            <Typography as='div' size='xs' className='text-muted-foreground'>
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
          ) : (
            <div className='rounded-lg border border-dashed border-border py-8 text-center'>
              <Users className='mx-auto mb-2 h-8 w-8 opacity-30' />
              <Typography as='div' size='sm' className='text-muted-foreground'>
                لا توجد حلقات {label}
              </Typography>
            </div>
          )}
        </section>
      ))}

      {vm.groups.length === 0 ? (
        <div className='py-12 text-center'>
          <Users className='mx-auto mb-3 h-12 w-12 opacity-50' />
          <Typography as='div' size='sm' className='text-muted-foreground'>
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
