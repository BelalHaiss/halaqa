'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot='tabs'
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot='tabs-list'
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px]',
        className
      )}
      {...props}
    />
  );
}

const tabsTriggerVariants = cva(
  'inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
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
        variant: 'solid',
        color: 'muted',
        className:
          'text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50'
      },
      {
        variant: 'solid',
        color: 'primary',
        className:
          'text-primary data-[state=active]:bg-card data-[state=active]:text-primary focus-visible:border-primary focus-visible:ring-primary/25'
      },
      {
        variant: 'solid',
        color: 'success',
        className:
          'text-success data-[state=active]:bg-card data-[state=active]:text-success focus-visible:border-success focus-visible:ring-success/25'
      },
      {
        variant: 'solid',
        color: 'danger',
        className:
          'text-danger data-[state=active]:bg-card data-[state=active]:text-danger focus-visible:border-danger focus-visible:ring-danger/25'
      },

      { variant: 'ghost', color: 'muted', className: 'text-foreground data-[state=active]:bg-accent' },
      { variant: 'ghost', color: 'primary', className: 'text-primary data-[state=active]:bg-primary/10' },
      { variant: 'ghost', color: 'success', className: 'text-success data-[state=active]:bg-success/10' },
      { variant: 'ghost', color: 'danger', className: 'text-danger data-[state=active]:bg-danger/10' },

      { variant: 'outline', color: 'muted', className: 'text-foreground data-[state=active]:bg-card' },
      { variant: 'outline', color: 'primary', className: 'text-primary data-[state=active]:bg-primary/10' },
      { variant: 'outline', color: 'success', className: 'text-success data-[state=active]:bg-success/10' },
      { variant: 'outline', color: 'danger', className: 'text-danger data-[state=active]:bg-danger/10' },

      { variant: 'soft', color: 'muted', className: 'text-foreground data-[state=active]:bg-muted' },
      { variant: 'soft', color: 'primary', className: 'text-primary data-[state=active]:bg-primary/10' },
      { variant: 'soft', color: 'success', className: 'text-success data-[state=active]:bg-success/10' },
      { variant: 'soft', color: 'danger', className: 'text-danger data-[state=active]:bg-danger/10' }
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'muted'
    }
  }
);

function TabsTrigger({
  className,
  variant,
  color,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof tabsTriggerVariants>) {
  return (
    <TabsPrimitive.Trigger
      data-slot='tabs-trigger'
      data-variant={variant}
      data-color={color}
      className={cn(tabsTriggerVariants({ variant, color }), className)}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot='tabs-content'
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
