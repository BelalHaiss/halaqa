import { getTimezoneLabel } from '@halaqa/shared';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type TimezoneDisplayProps = {
  timezone: string;
  className?: string;
};

export function TimezoneDisplay({
  timezone,

  className
}: TimezoneDisplayProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium text-muted-foreground',
        className
      )}
    >
      <Clock className='w-3 h-3' />
      {getTimezoneLabel(timezone || 'Africa/Cairo')}
    </span>
  );
}
