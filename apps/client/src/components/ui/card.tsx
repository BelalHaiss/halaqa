import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/typography';

const cardVariants = cva(
  'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border',
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
      { variant: 'solid', color: 'muted', className: '' },
      { variant: 'solid', color: 'primary', className: 'border-primary/20' },
      { variant: 'solid', color: 'success', className: 'border-success/20' },
      { variant: 'solid', color: 'danger', className: 'border-danger/20' },

      { variant: 'outline', color: 'muted', className: '' },
      {
        variant: 'outline',
        color: 'primary',
        className: 'border-primary/30'
      },
      {
        variant: 'outline',
        color: 'success',
        className: 'border-success/30'
      },
      {
        variant: 'outline',
        color: 'danger',
        className: 'border-danger/30'
      },

      {
        variant: 'ghost',
        color: 'muted',
        className: 'border-transparent bg-transparent'
      },
      {
        variant: 'ghost',
        color: 'primary',
        className: 'border-transparent bg-transparent'
      },
      {
        variant: 'ghost',
        color: 'success',
        className: 'border-transparent bg-transparent'
      },
      {
        variant: 'ghost',
        color: 'danger',
        className: 'border-transparent bg-transparent'
      },

      {
        variant: 'soft',
        color: 'muted',
        className: 'border-border bg-muted/30'
      },
      {
        variant: 'soft',
        color: 'primary',
        className: 'border-primary/20 bg-primary/5'
      },
      {
        variant: 'soft',
        color: 'success',
        className: 'border-success/20 bg-success/5'
      },
      {
        variant: 'soft',
        color: 'danger',
        className: 'border-danger/20 bg-danger/5'
      }
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'muted'
    }
  }
);

type CardProps = React.ComponentProps<'div'> & VariantProps<typeof cardVariants>;

function Card({ className, variant, color, ...props }: CardProps) {
  return (
    <div
      data-slot='card'
      data-variant={variant}
      data-color={color}
      className={cn(cardVariants({ variant, color }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-header'
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className
      )}
      {...props}
    />
  );
}

type CardTitleProps = Omit<React.ComponentProps<typeof Typography>, 'as'> & {
  as?: 'h1' | 'h2' | 'h3';
};

function CardTitle({
  className,
  as = 'h3',
  size = 'lg',
  weight = 'semibold',
  variant = 'solid',
  color = 'muted',
  ...props
}: CardTitleProps) {
  return (
    <Typography
      data-slot='card-title'
      as={as}
      size={size}
      weight={weight}
      variant={variant}
      color={color}
      className={cn('leading-none', className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  size = 'sm',
  variant = 'ghost',
  color = 'muted',
  ...props
}: Omit<React.ComponentProps<typeof Typography>, 'as'>) {
  return (
    <Typography
      data-slot='card-description'
      as='p'
      size={size}
      variant={variant}
      color={color}
      className={cn('', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-action'
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-content'
      className={cn('px-6 [&:last-child]:pb-6', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-footer'
      className={cn('flex items-center px-6 pb-6 [.border-t]:pt-6', className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent
};
