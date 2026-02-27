import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/typography';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role='alert'
      aria-live='assertive'
      className={cn(
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        'bg-background/80 backdrop-blur-sm',
        'animate-in fade-in duration-500'
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-6 px-12 py-10',
          'bg-background/95 backdrop-blur-xl',
          'border border-border shadow-2xl',
          'rounded-3xl',
          'max-w-md w-full mx-4',
          'animate-in zoom-in-95 duration-500'
        )}
      >
        <div
          className={cn(
            'flex size-20 shrink-0 items-center justify-center',
            'bg-danger/10 rounded-2xl',
            'animate-pulse'
          )}
        >
          <WifiOff className='size-10 text-danger' strokeWidth={2} />
        </div>

        <div className='flex flex-col gap-2 text-center'>
          <Typography as='div' size='xl' weight='semibold' className='text-foreground'>
            غير متصل بالإنترنت
          </Typography>
          <Typography as='div' size='md' className='text-muted-foreground'>
            يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى
          </Typography>
        </div>

        <div className='flex items-center gap-2 text-muted-foreground'>
          <RefreshCw className='size-5 animate-spin' strokeWidth={2} />
          <Typography as='span' size='sm'>
            إعادة المحاولة...
          </Typography>
        </div>
      </div>
    </div>
  );
}
