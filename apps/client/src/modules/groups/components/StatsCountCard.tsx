import { Loader2, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

type StatsCountCardProps = {
  icon: LucideIcon;
  data: {
    count: number;
    title: string;
  };
  isLoading: boolean;
  className?: string;
  iconClassName?: string;
};

export function StatsCountCard({
  icon: Icon,
  data,
  isLoading,
  className,
  iconClassName,
}: StatsCountCardProps) {
  return (
    <Card className={cn('relative overflow-hidden border ring-1 shadow-sm', className)}>
      <CardContent className='p-5 space-y-4'>
        <div className='flex items-center justify-between'>
          <Typography
            as='div'
            size='xs'
            className='rounded-md bg-muted px-2 py-0.5 text-muted-foreground'
          >
            مؤشرات سريعة
          </Typography>
          <div
            className={cn(
              'rounded-xl bg-muted p-2.5 text-muted-foreground ring-1 ring-current/10',
              iconClassName
            )}
          >
            <Icon className='w-5 h-5' />
          </div>
        </div>
        {isLoading ? (
          <div className='flex items-center gap-2'>
            <Loader2 className='w-4 h-4 animate-spin' />
            <Typography as='div' size='sm' className='text-muted-foreground'>
              جاري التحميل...
            </Typography>
          </div>
        ) : (
          <div className='space-y-1'>
            <Typography as='div' size='2xl' weight='bold'>
              {data.count}
            </Typography>
            <Typography as='div' size='sm' weight='semibold'>
              {data.title}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
