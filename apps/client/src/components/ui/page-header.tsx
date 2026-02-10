import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/typography';

const pageHeaderVariants = cva('flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4', {
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
    { variant: 'solid', color: 'primary', className: '' },
    { variant: 'solid', color: 'success', className: '' },
    { variant: 'solid', color: 'danger', className: '' },
    { variant: 'solid', color: 'muted', className: '' },

    { variant: 'ghost', color: 'primary', className: '' },
    { variant: 'ghost', color: 'success', className: '' },
    { variant: 'ghost', color: 'danger', className: '' },
    { variant: 'ghost', color: 'muted', className: '' },

    { variant: 'outline', color: 'primary', className: '' },
    { variant: 'outline', color: 'success', className: '' },
    { variant: 'outline', color: 'danger', className: '' },
    { variant: 'outline', color: 'muted', className: '' },

    { variant: 'soft', color: 'primary', className: '' },
    { variant: 'soft', color: 'success', className: '' },
    { variant: 'soft', color: 'danger', className: '' },
    { variant: 'soft', color: 'muted', className: '' }
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'muted'
  }
});

type PageHeaderProps = VariantProps<typeof pageHeaderVariants> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

function PageHeader({
  title,
  description,
  actions,
  className,
  variant,
  color
}: PageHeaderProps) {
  return (
    <div className={cn(pageHeaderVariants({ variant, color }), className)}>
      <div className='min-w-0'>
        <Typography as='h1' size='2xl' weight='semibold' variant='solid' color='muted' className='truncate'>
          {title}
        </Typography>
        {description ? (
          <Typography as='p' size='sm' variant='ghost' color='muted'>
            {description}
          </Typography>
        ) : null}
      </div>
      {actions ? <div className='shrink-0'>{actions}</div> : null}
    </div>
  );
}

export { PageHeader, pageHeaderVariants };

