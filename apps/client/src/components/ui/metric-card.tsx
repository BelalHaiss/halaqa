import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';

const metricCardVariants = cva('', {
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
    variant: 'outline',
    color: 'muted'
  }
});

const metricIconVariants = cva('p-2 rounded-lg', {
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
    { variant: 'solid', color: 'primary', className: 'bg-primary/10 text-primary' },
    { variant: 'solid', color: 'success', className: 'bg-success/10 text-success' },
    { variant: 'solid', color: 'danger', className: 'bg-danger/10 text-danger' },
    { variant: 'solid', color: 'muted', className: 'bg-muted text-muted-foreground' },

    { variant: 'ghost', color: 'primary', className: 'text-primary' },
    { variant: 'ghost', color: 'success', className: 'text-success' },
    { variant: 'ghost', color: 'danger', className: 'text-danger' },
    { variant: 'ghost', color: 'muted', className: 'text-muted-foreground' },

    { variant: 'outline', color: 'primary', className: 'bg-primary/10 text-primary' },
    { variant: 'outline', color: 'success', className: 'bg-success/10 text-success' },
    { variant: 'outline', color: 'danger', className: 'bg-danger/10 text-danger' },
    { variant: 'outline', color: 'muted', className: 'bg-muted text-muted-foreground' },

    { variant: 'soft', color: 'primary', className: 'bg-primary/10 text-primary' },
    { variant: 'soft', color: 'success', className: 'bg-success/10 text-success' },
    { variant: 'soft', color: 'danger', className: 'bg-danger/10 text-danger' },
    { variant: 'soft', color: 'muted', className: 'bg-muted text-muted-foreground' }
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'muted'
  }
});

type MetricCardProps = VariantProps<typeof metricCardVariants> & {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: React.ReactNode;
  className?: string;
};

function MetricCard({ icon, value, label, className, variant, color }: MetricCardProps) {
  return (
    <Card className={cn(metricCardVariants({ variant, color }), className)}>
      <CardContent className='p-3 lg:p-4'>
        <div className='flex items-center justify-between mb-2'>
          <div className={metricIconVariants({ variant: 'solid', color })}>{icon}</div>
        </div>
        <Typography as='div' size='xl' weight='semibold'>
          {value}
        </Typography>
        <Typography as='div' size='xs' variant='ghost' color='muted'>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export { MetricCard, metricCardVariants };

