import * as React from 'react';

import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/typography';

type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center',
        className
      )}
    >
      <div className='min-w-0'>
        <Typography as='h1' size='2xl' weight='semibold' className='truncate'>
          {title}
        </Typography>
        {description ? (
          <Typography as='p' size='sm' className='text-muted-foreground'>
            {description}
          </Typography>
        ) : null}
      </div>
      {actions ? <div className='shrink-0'>{actions}</div> : null}
    </div>
  );
}

export { PageHeader };
