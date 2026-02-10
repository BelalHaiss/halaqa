import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

type TypographyTag = 'p' | 'span' | 'div' | 'label' | 'h1' | 'h2' | 'h3';

const typographyVariants = cva('text-balance', {
  variants: {
    variant: {
      solid: '',
      ghost: '',
      outline: 'underline underline-offset-4',
      soft: 'rounded-md px-2 py-0.5'
    },
    color: {
      primary: '',
      success: '',
      danger: '',
      muted: ''
    },
    size: {
      xs: 'text-xs leading-5',
      sm: 'text-sm leading-6',
      md: 'text-base leading-7',
      lg: 'text-lg leading-7',
      xl: 'text-xl leading-8',
      '2xl': 'text-2xl leading-9'
    },
    weight: {
      regular: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    }
  },
  compoundVariants: [
    { variant: 'solid', color: 'primary', className: 'text-primary' },
    { variant: 'solid', color: 'success', className: 'text-success' },
    { variant: 'solid', color: 'danger', className: 'text-danger' },
    { variant: 'solid', color: 'muted', className: 'text-foreground' },

    { variant: 'ghost', color: 'primary', className: 'text-primary/80' },
    { variant: 'ghost', color: 'success', className: 'text-success/80' },
    { variant: 'ghost', color: 'danger', className: 'text-danger/80' },
    { variant: 'ghost', color: 'muted', className: 'text-muted-foreground' },

    {
      variant: 'outline',
      color: 'primary',
      className: 'decoration-primary/40 text-primary'
    },
    {
      variant: 'outline',
      color: 'success',
      className: 'decoration-success/40 text-success'
    },
    {
      variant: 'outline',
      color: 'danger',
      className: 'decoration-danger/40 text-danger'
    },
    {
      variant: 'outline',
      color: 'muted',
      className: 'decoration-muted-foreground/40 text-foreground'
    },

    {
      variant: 'soft',
      color: 'primary',
      className: 'bg-primary/10 text-primary'
    },
    {
      variant: 'soft',
      color: 'success',
      className: 'bg-success/10 text-success'
    },
    {
      variant: 'soft',
      color: 'danger',
      className: 'bg-danger/10 text-danger'
    },
    {
      variant: 'soft',
      color: 'muted',
      className: 'bg-muted text-muted-foreground'
    }
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'muted',
    size: 'md',
    weight: 'regular'
  }
});

type TypographyProps = React.ComponentPropsWithoutRef<'div'> &
  VariantProps<typeof typographyVariants> & {
    as?: TypographyTag;
  };

function Typography({
  as = 'p',
  className,
  variant,
  color,
  size,
  weight,
  ...props
}: TypographyProps) {
  const Comp = as as any;

  return (
    <Comp
      data-slot='typography'
      className={cn(typographyVariants({ variant, color, size, weight }), className)}
      {...props}
    />
  );
}

export { Typography, typographyVariants };

