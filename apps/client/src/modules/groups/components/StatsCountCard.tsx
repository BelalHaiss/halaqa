import { Loader2, type LucideIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Card, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

const statsCardVariants = cva(
  'relative overflow-hidden border ring-1 shadow-sm',
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
        variant: 'soft',
        color: 'primary',
        className:
          'bg-linear-to-br from-primary/15 via-primary/5 to-background border-primary/30 ring-primary/20'
      },
      {
        variant: 'soft',
        color: 'success',
        className:
          'bg-linear-to-br from-success/15 via-success/5 to-background border-success/30 ring-success/20'
      },
      {
        variant: 'soft',
        color: 'danger',
        className:
          'bg-linear-to-br from-danger/15 via-danger/5 to-background border-danger/30 ring-danger/20'
      },
      {
        variant: 'soft',
        color: 'muted',
        className:
          'bg-linear-to-br from-muted via-background to-muted/40 border-border ring-border'
      },
      {
        variant: 'outline',
        color: 'primary',
        className: 'bg-card border-primary/30 ring-primary/10'
      },
      {
        variant: 'outline',
        color: 'muted',
        className: 'bg-card border-border ring-border'
      },
      {
        variant: 'solid',
        color: 'primary',
        className:
          'bg-primary text-primary-foreground border-primary ring-primary/20'
      },
      {
        variant: 'ghost',
        color: 'muted',
        className: 'bg-transparent border-border ring-border'
      }
    ],
    defaultVariants: {
      variant: 'soft',
      color: 'primary'
    }
  }
);

const statsIconVariants = cva('rounded-xl p-2.5', {
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
      variant: 'soft',
      color: 'primary',
      className: 'bg-primary/15 text-primary'
    },
    {
      variant: 'soft',
      color: 'success',
      className: 'bg-success/15 text-success'
    },
    {
      variant: 'soft',
      color: 'danger',
      className: 'bg-danger/15 text-danger'
    },
    {
      variant: 'soft',
      color: 'muted',
      className: 'bg-muted text-muted-foreground'
    },
    {
      variant: 'outline',
      color: 'primary',
      className: 'bg-primary/10 text-primary'
    },
    {
      variant: 'outline',
      color: 'muted',
      className: 'bg-muted/70 text-muted-foreground'
    },
    {
      variant: 'solid',
      color: 'primary',
      className: 'bg-primary-foreground/20 text-primary-foreground'
    },
    {
      variant: 'ghost',
      color: 'muted',
      className: 'bg-muted/60 text-muted-foreground'
    }
  ],
  defaultVariants: {
    variant: 'soft',
    color: 'primary'
  }
});

type StatsCountCardProps = {
  icon: LucideIcon;
  data: {
    count: number;
    title: string;
  };
  isLoading: boolean;
} & VariantProps<typeof statsCardVariants>;

export function StatsCountCard({
  icon: Icon,
  data,
  isLoading,
  variant = 'soft',
  color = 'primary'
}: StatsCountCardProps) {
  return (
    <Card className={cn(statsCardVariants({ variant, color }))}>
      <CardContent className='p-5 space-y-4'>
        <div className='flex items-center justify-between'>
          <Typography as='div' size='xs' variant='soft' color='muted'>
            مؤشرات سريعة
          </Typography>
          <div
            className={cn(
              statsIconVariants({ variant, color }),
              'ring-1 ring-current/10'
            )}
          >
            <Icon className='w-5 h-5' />
          </div>
        </div>
        {isLoading ? (
          <div className='flex items-center gap-2'>
            <Loader2 className='w-4 h-4 animate-spin' />
            <Typography as='div' size='sm' variant='ghost' color='muted'>
              جاري التحميل...
            </Typography>
          </div>
        ) : (
          <div className='space-y-1'>
            <Typography as='div' size='2xl' weight='bold'>
              {data.count}
            </Typography>
            <Typography as='div' size='sm' weight='semibold'>
              {data.title}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
