import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/typography';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        solid: 'bg-card text-card-foreground',
        ghost: 'border-transparent bg-transparent',
        outline: 'bg-card text-card-foreground',
        soft: 'bg-muted/30 text-foreground'
      },
      color: {
        primary: '',
        success: '',
        danger: '',
        muted: ''
      }
    },
    compoundVariants: [
      { variant: 'solid', color: 'muted', className: '' },
      { variant: 'solid', color: 'primary', className: 'border-primary/20' },
      { variant: 'solid', color: 'success', className: 'border-success/20' },
      { variant: 'solid', color: 'danger', className: 'border-danger/20' },

      { variant: 'outline', color: 'muted', className: '' },
      { variant: 'outline', color: 'primary', className: 'border-primary/30' },
      { variant: 'outline', color: 'success', className: 'border-success/30' },
      { variant: 'outline', color: 'danger', className: 'border-danger/30' },

      { variant: 'ghost', color: 'muted', className: '' },
      { variant: 'ghost', color: 'primary', className: 'text-primary' },
      { variant: 'ghost', color: 'success', className: 'text-success' },
      { variant: 'ghost', color: 'danger', className: 'text-danger' },

      { variant: 'soft', color: 'muted', className: '' },
      { variant: 'soft', color: 'primary', className: 'bg-primary/10 text-primary' },
      { variant: 'soft', color: 'success', className: 'bg-success/10 text-success' },
      { variant: 'soft', color: 'danger', className: 'bg-danger/10 text-danger' }
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'muted'
    }
  }
);

function Alert({
  className,
  variant,
  color,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot='alert'
      role='alert'
      data-variant={variant}
      data-color={color}
      className={cn(alertVariants({ variant, color }), className)}
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
      variant='ghost'
      color='muted'
      className={cn(
        'col-start-2 grid justify-items-start gap-1',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
