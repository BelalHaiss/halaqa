import { Calendar, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/ui/page-header';
import { Typography } from '@/components/ui/typography';
import { useTodaySessionsViewModel } from '../viewmodels/today-sessions.viewmodel';
import { SessionCard } from '../components/SessionCard';

export const TodaySessionsView = () => {
  const { user } = useApp();

  if (!user) {
    return null;
  }

  const vm = useTodaySessionsViewModel(user);

  if (vm.isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (vm.error) {
    return (
      <Alert className='border-danger/30 bg-danger/10 text-danger'>
        <AlertDescription>{vm.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title='جلسات اليوم'
        description='الجلسات المجدولة لهذا اليوم'
      />

      {vm.sessions.length === 0 ? (
        <div className='text-center py-12 rounded-lg border border-dashed border-border'>
          <Calendar className='w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground' />
          <Typography as='div' size='sm' className='text-muted-foreground'>
            لا توجد جلسات مجدولة اليوم
          </Typography>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {vm.sessions.map((session) => (
            <SessionCard
              key={session.id}
              id={session.id}
              groupName={session.groupName}
              tutorName={session.tutorName}
              startedAt={session.startedAt}
              originalStartedAt={session.originalStartedAt ?? undefined}
              sessionStatus={session.sessionStatus}
              timezone={user.timezone}
            />
          ))}
        </div>
      )}
    </div>
  );
};
