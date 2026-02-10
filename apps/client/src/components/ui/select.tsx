'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/typography';

const selectTriggerVariants = cva(
  "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground dark:bg-input/30 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 aria-invalid:border-danger'
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

      { variant: 'solid', color: 'muted', className: '' },
      { variant: 'solid', color: 'primary', className: 'border-primary/20' },
      { variant: 'solid', color: 'success', className: 'border-success/20' },
      { variant: 'solid', color: 'danger', className: 'border-danger/20' },

      {
        variant: 'ghost',
        color: 'muted',
        className: 'border-transparent bg-transparent'
      },
      {
        variant: 'ghost',
        color: 'primary',
        className: 'border-transparent bg-transparent text-primary'
      },
      {
        variant: 'ghost',
        color: 'success',
        className: 'border-transparent bg-transparent text-success'
      },
      {
        variant: 'ghost',
        color: 'danger',
        className: 'border-transparent bg-transparent text-danger'
      },

      { variant: 'soft', color: 'muted', className: 'bg-muted/30 border-border' },
      { variant: 'soft', color: 'primary', className: 'bg-muted/30 border-primary/20' },
      { variant: 'soft', color: 'success', className: 'bg-muted/30 border-success/20' },
      { variant: 'soft', color: 'danger', className: 'bg-muted/30 border-danger/20' }
    ],
    defaultVariants: {
      variant: 'outline',
      color: 'muted'
    }
  }
);

const selectContentVariants = cva(
  'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md',
  {
    variants: {
      variant: {
        solid: '',
        ghost: 'border-transparent shadow-none',
        outline: '',
        soft: 'bg-muted/30'
      },
      color: {
        primary: '',
        success: '',
        danger: '',
        muted: ''
      },
      position: {
        popper:
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        'item-aligned': ''
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
      { variant: 'ghost', color: 'primary', className: '' },
      { variant: 'ghost', color: 'success', className: '' },
      { variant: 'ghost', color: 'danger', className: '' },

      { variant: 'soft', color: 'muted', className: '' },
      { variant: 'soft', color: 'primary', className: 'border-primary/20' },
      { variant: 'soft', color: 'success', className: 'border-success/20' },
      { variant: 'soft', color: 'danger', className: 'border-danger/20' }
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'muted',
      position: 'popper'
    }
  }
);

const selectViewportVariants = cva('p-1', {
  variants: {
    position: {
      popper:
        'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1',
      'item-aligned': ''
    }
  },
  defaultVariants: {
    position: 'popper'
  }
});

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot='select' {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot='select-group' {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot='select-value' {...props} />;
}

function SelectTrigger({
  className,
  size = 'default',
  variant,
  color,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default';
} & VariantProps<typeof selectTriggerVariants>) {
  return (
    <SelectPrimitive.Trigger
      data-slot='select-trigger'
      data-size={size}
      className={cn(
        selectTriggerVariants({ variant, color }),
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className='size-4 opacity-50' />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  variant,
  color,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> &
  VariantProps<typeof selectContentVariants>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot='select-content'
        className={cn(
          selectContentVariants({
            variant,
            color,
            position: position === 'popper' ? 'popper' : 'item-aligned'
          }),
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            selectViewportVariants({
              position: position === 'popper' ? 'popper' : 'item-aligned'
            })
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot='select-label'
      asChild
      {...props}
    >
      <Typography
        as='div'
        size='xs'
        variant='ghost'
        color='muted'
        className={cn('px-2 py-1.5', className)}
      >
        {children}
      </Typography>
    </SelectPrimitive.Label>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot='select-item'
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <div className='absolute right-2 flex size-3.5 items-center justify-center'>
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className='size-4' />
        </SelectPrimitive.ItemIndicator>
      </div>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot='select-separator'
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot='select-scroll-up-button'
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      <ChevronUpIcon className='size-4' />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot='select-scroll-down-button'
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      <ChevronDownIcon className='size-4' />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue
};
