'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const labelVariants = cva(
  'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
  {
    variants: {
      variant: {
        solid: '',
        ghost: '',
        outline: '',
        soft: ''
      },
      color: {
        primary: '',
        success: '',
        danger: '',
        muted: ''
      }
    },
    compoundVariants: [
      { variant: 'solid', color: 'muted', className: 'text-foreground' },
      { variant: 'solid', color: 'primary', className: 'text-primary' },
      { variant: 'solid', color: 'success', className: 'text-success' },
      { variant: 'solid', color: 'danger', className: 'text-danger' },

      { variant: 'ghost', color: 'muted', className: 'text-muted-foreground' },
      { variant: 'ghost', color: 'primary', className: 'text-primary/80' },
      { variant: 'ghost', color: 'success', className: 'text-success/80' },
      { variant: 'ghost', color: 'danger', className: 'text-danger/80' },

      { variant: 'outline', color: 'muted', className: 'text-foreground' },
      { variant: 'outline', color: 'primary', className: 'text-primary' },
      { variant: 'outline', color: 'success', className: 'text-success' },
      { variant: 'outline', color: 'danger', className: 'text-danger' },

      { variant: 'soft', color: 'muted', className: 'text-muted-foreground' },
      { variant: 'soft', color: 'primary', className: 'text-primary' },
      { variant: 'soft', color: 'success', className: 'text-success' },
      { variant: 'soft', color: 'danger', className: 'text-danger' }
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'muted'
    }
  }
);

function Label({
  className,
  variant,
  color,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive.Root
      data-slot='label'
      className={cn(
        labelVariants({ variant, color }),
        className
      )}
      {...props}
    />
  );
}

export { Label, labelVariants };
