import { Link } from 'react-router-dom';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { formatISODateToUserTimezone } from '@halaqa/shared';
import { useApp } from '@/contexts/AppContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Typography } from '@/components/ui/typography';
import { getSessionStatusConfig } from '../utils/session.util';
import { useTodaySessionsViewModel } from '../viewmodels/today-sessions.viewmodel';

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
      <Alert variant='soft' color='danger'>
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
          <Typography as='div' size='sm' variant='ghost' color='muted'>
            لا توجد جلسات مجدولة اليوم
          </Typography>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {vm.sessions.map((session) => {
            const { time } = formatISODateToUserTimezone(
              session.startedAt,
              user.timezone
            );
            const statusConfig = getSessionStatusConfig(session.sessionStatus);

            return (
              <Link
                key={session.id}
                to={`/sessions/${session.id}`}
                className='block transition-shadow hover:shadow-md'
              >
                <Card>
                  <CardContent className='p-4 space-y-3'>
                    <div className='flex items-start justify-between'>
                      <div className='bg-primary/10 p-2 rounded-lg'>
                        <Calendar className='w-5 h-5 text-primary' />
                      </div>
                      <Badge
                        variant={statusConfig.variant}
                        color={statusConfig.color}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <Typography as='h3' size='lg' weight='semibold'>
                      {session.groupName}
                    </Typography>

                    <div className='space-y-1.5'>
                      <div className='flex items-center justify-between'>
                        <Typography
                          as='div'
                          size='xs'
                          variant='ghost'
                          color='muted'
                        >
                          المعلم
                        </Typography>
                        <Typography as='div' size='xs' weight='medium'>
                          {session.tutorName}
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
                        <div className='flex items-center gap-1'>
                          <Clock className='w-3 h-3 text-muted-foreground' />
                          <Typography as='div' size='xs' weight='medium'>
                            {time}
                          </Typography>
                        </div>
                      </div>

                      {session.originalStartedAt && (
                        <div className='pt-1.5 border-t border-border'>
                          <Typography
                            as='div'
                            size='xs'
                            variant='ghost'
                            color='muted'
                          >
                            معاد جدولتها من{' '}
                            {
                              formatISODateToUserTimezone(
                                session.originalStartedAt,
                                user.timezone
                              ).time
                            }
                          </Typography>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
