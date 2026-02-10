'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Typography, typographyVariants } from '@/components/ui/typography';

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot='dialog' {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot='dialog-portal' {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot='dialog-close' {...props} />;
}

const dialogOverlayVariants = cva(
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50',
  {
    variants: {
      variant: {
        solid: 'bg-foreground/50',
        ghost: 'bg-foreground/40',
        outline: 'bg-foreground/45',
        soft: 'bg-foreground/35'
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
      { variant: 'solid', color: 'primary', className: '' },
      { variant: 'solid', color: 'success', className: '' },
      { variant: 'solid', color: 'danger', className: '' },

      { variant: 'ghost', color: 'muted', className: '' },
      { variant: 'ghost', color: 'primary', className: '' },
      { variant: 'ghost', color: 'success', className: '' },
      { variant: 'ghost', color: 'danger', className: '' },

      { variant: 'outline', color: 'muted', className: '' },
      { variant: 'outline', color: 'primary', className: '' },
      { variant: 'outline', color: 'success', className: '' },
      { variant: 'outline', color: 'danger', className: '' },

      { variant: 'soft', color: 'muted', className: '' },
      { variant: 'soft', color: 'primary', className: '' },
      { variant: 'soft', color: 'success', className: '' },
      { variant: 'soft', color: 'danger', className: '' }
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'muted'
    }
  }
);

function DialogOverlay({
  className,
  variant,
  color,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay> &
  VariantProps<typeof dialogOverlayVariants>) {
  return (
    <DialogPrimitive.Overlay
      data-slot='dialog-overlay'
      data-variant={variant}
      data-color={color}
      className={cn(dialogOverlayVariants({ variant, color }), className)}
      {...props}
    />
  );
}

const dialogContentVariants = cva(
  'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
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
      color: 'muted'
    }
  }
);

const dialogCloseVariants = cva(
  'ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
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
      { variant: 'solid', color: 'primary', className: '' },
      { variant: 'solid', color: 'success', className: '' },
      { variant: 'solid', color: 'danger', className: '' },

      { variant: 'ghost', color: 'muted', className: '' },
      { variant: 'ghost', color: 'primary', className: '' },
      { variant: 'ghost', color: 'success', className: '' },
      { variant: 'ghost', color: 'danger', className: '' },

      { variant: 'outline', color: 'muted', className: '' },
      { variant: 'outline', color: 'primary', className: '' },
      { variant: 'outline', color: 'success', className: '' },
      { variant: 'outline', color: 'danger', className: '' },

      { variant: 'soft', color: 'muted', className: '' },
      { variant: 'soft', color: 'primary', className: '' },
      { variant: 'soft', color: 'success', className: '' },
      { variant: 'soft', color: 'danger', className: '' }
    ],
    defaultVariants: {
      variant: 'ghost',
      color: 'muted'
    }
  }
);

const dialogHeaderVariants = cva('flex flex-col gap-2 text-center sm:text-left', {
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
    { variant: 'solid', color: 'primary', className: '' },
    { variant: 'solid', color: 'success', className: '' },
    { variant: 'solid', color: 'danger', className: '' },

    { variant: 'ghost', color: 'muted', className: '' },
    { variant: 'ghost', color: 'primary', className: '' },
    { variant: 'ghost', color: 'success', className: '' },
    { variant: 'ghost', color: 'danger', className: '' },

    { variant: 'outline', color: 'muted', className: '' },
    { variant: 'outline', color: 'primary', className: '' },
    { variant: 'outline', color: 'success', className: '' },
    { variant: 'outline', color: 'danger', className: '' },

    { variant: 'soft', color: 'muted', className: '' },
    { variant: 'soft', color: 'primary', className: '' },
    { variant: 'soft', color: 'success', className: '' },
    { variant: 'soft', color: 'danger', className: '' }
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'muted'
  }
});

const dialogFooterVariants = cva('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', {
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
    { variant: 'solid', color: 'primary', className: '' },
    { variant: 'solid', color: 'success', className: '' },
    { variant: 'solid', color: 'danger', className: '' },

    { variant: 'ghost', color: 'muted', className: '' },
    { variant: 'ghost', color: 'primary', className: '' },
    { variant: 'ghost', color: 'success', className: '' },
    { variant: 'ghost', color: 'danger', className: '' },

    { variant: 'outline', color: 'muted', className: '' },
    { variant: 'outline', color: 'primary', className: '' },
    { variant: 'outline', color: 'success', className: '' },
    { variant: 'outline', color: 'danger', className: '' },

    { variant: 'soft', color: 'muted', className: '' },
    { variant: 'soft', color: 'primary', className: '' },
    { variant: 'soft', color: 'success', className: '' },
    { variant: 'soft', color: 'danger', className: '' }
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'muted'
  }
});

function DialogContent({
  className,
  children,
  variant,
  color,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> &
  VariantProps<typeof dialogContentVariants>) {
  return (
    <DialogPortal data-slot='dialog-portal'>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot='dialog-content'
        className={cn(
          dialogContentVariants({ variant, color }),
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className={dialogCloseVariants({})}>
          <XIcon />
          <Typography as='span' className='sr-only'>
            Close
          </Typography>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  variant,
  color,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof dialogHeaderVariants>) {
  return (
    <div
      data-slot='dialog-header'
      data-variant={variant}
      data-color={color}
      className={cn(dialogHeaderVariants({ variant, color }), className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  variant,
  color,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof dialogFooterVariants>) {
  return (
    <div
      data-slot='dialog-footer'
      data-variant={variant}
      data-color={color}
      className={cn(dialogFooterVariants({ variant, color }), className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  children,
  variant,
  color,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Title>, 'asChild'> &
  VariantProps<typeof typographyVariants> & {
    children: React.ReactNode;
  }) {
  return (
    <DialogPrimitive.Title data-slot='dialog-title' asChild {...props}>
      <Typography
        as='h2'
        size='lg'
        weight='semibold'
        variant={variant}
        color={color}
        className={className}
      >
        {children}
      </Typography>
    </DialogPrimitive.Title>
  );
}

function DialogDescription({
  className,
  children,
  variant,
  color,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Description>, 'asChild'> &
  VariantProps<typeof typographyVariants> & {
    children: React.ReactNode;
  }) {
  return (
    <DialogPrimitive.Description data-slot='dialog-description' asChild {...props}>
      <Typography
        as='p'
        size='sm'
        variant={variant ?? 'ghost'}
        color={color ?? 'muted'}
        className={className}
      >
        {children}
      </Typography>
    </DialogPrimitive.Description>
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
};
