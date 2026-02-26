import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import {
  formatISODateToUserTimezone,
  minutesToTimeString,
  type SessionComputedStatus,
  type ISODateString
} from '@halaqa/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { getSessionStatusConfig } from '../utils/session.util';
import { RescheduledNotice } from './RescheduledNotice';

interface SessionCardProps {
  id: string;
  groupName: string;
  tutorName: string | null;
  startedAt: ISODateString;
  originalStartedAt?: ISODateString | null;
  sessionStatus: SessionComputedStatus;
  timezone: string;
}

export const SessionCard = ({
  id,
  groupName,
  tutorName,
  startedAt,
  originalStartedAt,
  sessionStatus,
  timezone
}: SessionCardProps) => {
  const { time } = formatISODateToUserTimezone(startedAt, timezone);
  const formattedTime = minutesToTimeString(time as any);
  const statusConfig = getSessionStatusConfig(sessionStatus);

  return (
    <Link to={`/sessions/${id}`} className='block transition-shadow'>
      <Card className='hover:shadow-md'>
        <CardContent className='p-4 space-y-3'>
          <div className='flex items-start justify-between overflow-hidden'>
            <div className='bg-primary/10 p-2 rounded-lg'>
              <Calendar className='w-5 h-5 text-primary' />
            </div>
            <Badge variant={statusConfig.variant} color={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>

          <Typography as='h3' size='lg' weight='semibold'>
            {groupName}
          </Typography>

          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <Typography as='div' size='xs' className='text-muted-foreground'>
                المعلم
              </Typography>
              <Typography as='div' size='xs' weight='medium'>
                {tutorName ?? 'غير محدد'}
              </Typography>
            </div>

            <div className='flex items-center justify-between'>
              <Typography as='div' size='xs' className='text-muted-foreground'>
                الوقت
              </Typography>
              <div className='flex items-center gap-1'>
                <Clock className='w-3 h-3 text-muted-foreground' />
                <Typography as='div' size='xs' weight='medium'>
                  {formattedTime}
                </Typography>
              </div>
            </div>

            {originalStartedAt && (
              <div className='pt-1.5 border-t border-border'>
                <RescheduledNotice
                  originalStartedAt={originalStartedAt}
                  timezone={timezone}
                  variant='compact'
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
