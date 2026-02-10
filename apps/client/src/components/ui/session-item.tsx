import { Session, SessionStatus } from '@halaqa/shared';
import { Calendar, Clock, FileText } from 'lucide-react';
import { StatusBadge, StatusType } from './status-badge';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/typography';

interface SessionItemProps {
  session: Session;
  onClick?: (session: Session) => void;
  className?: string;
}

const sessionItemVariants = cva(
  'p-4 border rounded-lg transition-colors',
  {
    variants: {
      variant: {
        solid: 'bg-card',
        ghost: 'bg-transparent border-transparent',
        outline: 'bg-card',
        soft: 'bg-muted/30'
      },
      color: {
        primary: '',
        success: '',
        danger: '',
        muted: ''
      },
      interactive: {
        true: 'cursor-pointer hover:bg-accent',
        false: ''
      }
    },
    compoundVariants: [
      { variant: 'solid', color: 'muted', className: 'border-border' },
      { variant: 'solid', color: 'primary', className: 'border-primary/20' },
      { variant: 'solid', color: 'success', className: 'border-success/20' },
      { variant: 'solid', color: 'danger', className: 'border-danger/20' },

      { variant: 'outline', color: 'muted', className: 'border-border' },
      { variant: 'outline', color: 'primary', className: 'border-primary/30' },
      { variant: 'outline', color: 'success', className: 'border-success/30' },
      { variant: 'outline', color: 'danger', className: 'border-danger/30' },

      { variant: 'ghost', color: 'muted', className: '' },
      { variant: 'ghost', color: 'primary', className: '' },
      { variant: 'ghost', color: 'success', className: '' },
      { variant: 'ghost', color: 'danger', className: '' },

      { variant: 'soft', color: 'muted', className: 'border-border' },
      { variant: 'soft', color: 'primary', className: 'border-primary/20' },
      { variant: 'soft', color: 'success', className: 'border-success/20' },
      { variant: 'soft', color: 'danger', className: 'border-danger/20' }
    ],
    defaultVariants: {
      variant: 'outline',
      color: 'muted',
      interactive: false
    }
  }
);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

export const SessionItem = ({
  session,
  onClick,
  className,
  variant = 'outline',
  color = 'muted'
}: SessionItemProps &
  Pick<VariantProps<typeof sessionItemVariants>, 'variant' | 'color'>) => {
  const handleClick = () => {
    if (onClick) {
      onClick(session);
    }
  };

  const statusMap: Record<SessionStatus, StatusType> = {
    COMPLETED: 'COMPLETED',
    CANCELED: 'CANCELED',
    SCHEDULED: 'SCHEDULED'
  };

  return (
    <div
      className={cn(
        sessionItemVariants({
          variant,
          color,
          interactive: Boolean(onClick)
        }),
        className
      )}
      onClick={handleClick}
    >
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <div className='bg-primary/10 p-2 rounded-full'>
            <Calendar className='w-4 h-4 text-primary' />
          </div>
          <div>
            <Typography as='div' size='sm' weight='medium'>
              {formatDate(session.date)}
            </Typography>
            <div className='flex items-center gap-1 mt-0.5'>
              <Clock className='w-3 h-3' />
              <Typography as='div' size='xs' variant='ghost' color='muted'>
                {session.time}
              </Typography>
            </div>
          </div>
        </div>

        <StatusBadge status={statusMap[session.status]} />
      </div>

      {session.notes && (
        <div className='flex items-start gap-2'>
          <FileText className='w-3 h-3 mt-0.5 text-muted-foreground' />
          <Typography as='div' size='xs' variant='ghost' color='muted' className='line-clamp-2'>
            {session.notes}
          </Typography>
        </div>
      )}
    </div>
  );
};
