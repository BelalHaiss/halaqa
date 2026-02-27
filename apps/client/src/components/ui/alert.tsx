import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/typography';

const alertVariants = cva(
  'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      alertType: {
        ERROR: 'border-danger/30 bg-danger/10 text-danger',
        WARN: 'border-border bg-muted/30 text-foreground',
      },
    },
    defaultVariants: {
      alertType: 'WARN',
    },
  },
);

function Alert({
  className,
  alertType = 'WARN',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot='alert'
      role='alert'
      data-alert-type={alertType}
      className={cn(alertVariants({ alertType }), className)}
      {...props}
    />
  );
}

function AlertTitle({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Typography>, 'as'>) {
  return (
    <Typography
      data-slot='alert-title'
      as='div'
      size='sm'
      weight='medium'
      className={cn('col-start-2 line-clamp-1 min-h-4 tracking-tight', className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Typography>, 'as'>) {
  return (
    <Typography
      data-slot='alert-description'
      as='div'
      size='sm'
      className={cn(
        'col-start-2 grid justify-items-start gap-1',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
