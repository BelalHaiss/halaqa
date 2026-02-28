import * as React from 'react';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';

type MetricCardProps = {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: React.ReactNode;
  className?: string;
  iconClassName?: string;
};

function MetricCard({ icon, value, label, className, iconClassName }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardContent className='p-3 lg:p-4'>
        <div className='flex items-center justify-between mb-2'>
          <div className={cn('rounded-lg bg-muted p-2 text-muted-foreground', iconClassName)}>
            {icon}
          </div>
        </div>
        <Typography as='div' size='xl' weight='semibold'>
          {value}
        </Typography>
        <Typography as='div' size='xs' className='text-muted-foreground'>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export { MetricCard };
