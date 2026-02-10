import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import type { InteractiveColor, InteractiveVariant } from '@/components/ui/interactive-variants';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 aria-invalid:border-danger',
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
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        xs: 'h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*="size-"])]:size-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-xs': 'size-6 rounded-md [&_svg:not([class*="size-"])]:size-3',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10'
      },
    },
    compoundVariants: [
      {
        variant: 'solid',
        color: 'primary',
        className:
          'bg-primary text-primary-foreground hover:bg-primary/90'
      },
      {
        variant: 'solid',
        color: 'success',
        className:
          'bg-success text-success-foreground hover:bg-success/90'
      },
      {
        variant: 'solid',
        color: 'danger',
        className:
          'bg-danger text-danger-foreground hover:bg-danger/90'
      },
      {
        variant: 'solid',
        color: 'muted',
        className:
          'bg-muted text-foreground hover:bg-muted/80'
      },

      {
        variant: 'outline',
        color: 'primary',
        className:
          'bg-background shadow-xs border-primary/30 text-primary hover:bg-primary/10'
      },
      {
        variant: 'outline',
        color: 'success',
        className:
          'bg-background shadow-xs border-success/30 text-success hover:bg-success/10'
      },
      {
        variant: 'outline',
        color: 'danger',
        className:
          'bg-background shadow-xs border-danger/30 text-danger hover:bg-danger/10'
      },
      {
        variant: 'outline',
        color: 'muted',
        className:
          'bg-background shadow-xs border-border text-foreground hover:bg-accent hover:text-accent-foreground'
      },

      {
        variant: 'ghost',
        color: 'primary',
        className:
          'text-primary hover:bg-primary/10'
      },
      {
        variant: 'ghost',
        color: 'success',
        className:
          'text-success hover:bg-success/10'
      },
      {
        variant: 'ghost',
        color: 'danger',
        className:
          'text-danger hover:bg-danger/10'
      },
      {
        variant: 'ghost',
        color: 'muted',
        className:
          'text-foreground hover:bg-accent'
      },

      {
        variant: 'soft',
        color: 'primary',
        className:
          'bg-primary/10 text-primary hover:bg-primary/15'
      },
      {
        variant: 'soft',
        color: 'success',
        className:
          'bg-success/10 text-success hover:bg-success/15'
      },
      {
        variant: 'soft',
        color: 'danger',
        className:
          'bg-danger/10 text-danger hover:bg-danger/15'
      },
      {
        variant: 'soft',
        color: 'muted',
        className:
          'bg-muted text-muted-foreground hover:bg-muted/80'
      }
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'primary',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant = 'solid',
  color = 'primary',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot='button'
      data-variant={variant as InteractiveVariant}
      data-color={color as InteractiveColor}
      data-size={size}
      className={cn(buttonVariants({ variant, color, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
