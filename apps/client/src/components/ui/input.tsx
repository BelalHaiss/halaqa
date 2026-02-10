import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
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
      {
        variant: 'outline',
        color: 'muted',
        className:
          'border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
      },
      {
        variant: 'outline',
        color: 'primary',
        className:
          'border-primary/30 focus-visible:border-primary focus-visible:ring-primary/25 focus-visible:ring-[3px]'
      },
      {
        variant: 'outline',
        color: 'success',
        className:
          'border-success/30 focus-visible:border-success focus-visible:ring-success/25 focus-visible:ring-[3px]'
      },
      {
        variant: 'outline',
        color: 'danger',
        className:
          'border-danger/30 focus-visible:border-danger focus-visible:ring-danger/25 focus-visible:ring-[3px]'
      },

      {
        variant: 'solid',
        color: 'muted',
        className:
          'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
      },
      {
        variant: 'solid',
        color: 'primary',
        className:
          'border-primary/20 bg-background focus-visible:border-primary focus-visible:ring-primary/25 focus-visible:ring-[3px]'
      },
      {
        variant: 'solid',
        color: 'success',
        className:
          'border-success/20 bg-background focus-visible:border-success focus-visible:ring-success/25 focus-visible:ring-[3px]'
      },
      {
        variant: 'solid',
        color: 'danger',
        className:
          'border-danger/20 bg-background focus-visible:border-danger focus-visible:ring-danger/25 focus-visible:ring-[3px]'
      },

      {
        variant: 'soft',
        color: 'muted',
        className:
          'bg-muted/30 border-border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
      },
      {
        variant: 'soft',
        color: 'primary',
        className:
          'bg-muted/30 border-primary/20 focus-visible:border-primary focus-visible:ring-primary/25 focus-visible:ring-[3px]'
      },
      {
        variant: 'soft',
        color: 'success',
        className:
          'bg-muted/30 border-success/20 focus-visible:border-success focus-visible:ring-success/25 focus-visible:ring-[3px]'
      },
      {
        variant: 'soft',
        color: 'danger',
        className:
          'bg-muted/30 border-danger/20 focus-visible:border-danger focus-visible:ring-danger/25 focus-visible:ring-[3px]'
      },

      {
        variant: 'ghost',
        color: 'muted',
        className:
          'border-transparent bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
      },
      {
        variant: 'ghost',
        color: 'primary',
        className:
          'border-transparent bg-transparent focus-visible:border-primary focus-visible:ring-primary/25 focus-visible:ring-[3px]'
      },
      {
        variant: 'ghost',
        color: 'success',
        className:
          'border-transparent bg-transparent focus-visible:border-success focus-visible:ring-success/25 focus-visible:ring-[3px]'
      },
      {
        variant: 'ghost',
        color: 'danger',
        className:
          'border-transparent bg-transparent focus-visible:border-danger focus-visible:ring-danger/25 focus-visible:ring-[3px]'
      }
    ],
    defaultVariants: {
      variant: 'outline',
      color: 'muted'
    }
  }
);

type InputProps = React.ComponentProps<'input'> & VariantProps<typeof inputVariants>;

function Input({
  className,
  type,
  variant,
  color,
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        inputVariants({ variant, color }),
        'aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 aria-invalid:border-danger',
        className
      )}
      {...props}
    />
  );
}

export { Input, inputVariants };
