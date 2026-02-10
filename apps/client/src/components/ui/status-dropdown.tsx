import { MoreHorizontal, Edit3 } from 'lucide-react';
import { GroupStatus } from '@halaqa/shared';
import { StatusBadge } from './status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './dropdown-menu';
import { Button } from './button';
import { Typography } from '@/components/ui/typography';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

interface StatusDropdownProps {
  currentStatus: GroupStatus;
  onStatusChange: (status: GroupStatus) => void;
  disabled?: boolean;
}

const statusDropdownTriggerVariants = cva('h-8 px-3 gap-2', {
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

const statusOptions: { value: GroupStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'INACTIVE', label: 'غير نشط' },
  { value: 'COMPLETED', label: 'مكتمل' }
];

export const StatusDropdown = ({
  currentStatus,
  onStatusChange,
  disabled = false,
  variant = 'outline',
  color = 'muted'
}: StatusDropdownProps & VariantProps<typeof statusDropdownTriggerVariants>) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          type='button'
          variant={variant ?? 'outline'}
          color={color ?? 'muted'}
          size='sm'
          className={cn(
            statusDropdownTriggerVariants({
              variant: variant ?? 'outline',
              color: color ?? 'muted'
            })
          )}
        >
          <StatusBadge status={currentStatus} />
          <MoreHorizontal className='w-4 h-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side='bottom'
        align='end'
        sideOffset={4}
        className='w-40 max-h-60 overflow-y-auto'
      >
        <Typography
          as='div'
          size='xs'
          weight='medium'
          variant='ghost'
          color='muted'
          className='px-2 py-1.5'
        >
          تغيير الحالة
        </Typography>
        <DropdownMenuSeparator />
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className='flex items-center justify-between'
          >
            <StatusBadge className='w-2/3' status={option.value} />
            {currentStatus === option.value && (
              <Edit3 className='w-3 h-3 text-primary' />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
