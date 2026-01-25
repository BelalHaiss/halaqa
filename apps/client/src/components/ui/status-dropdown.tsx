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

interface StatusDropdownProps {
  currentStatus: GroupStatus;
  onStatusChange: (status: GroupStatus) => void;
  disabled?: boolean;
}

const statusOptions: { value: GroupStatus; label: string }[] = [
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'suspended', label: 'متوقف' },
  { value: 'completed', label: 'مكتمل' }
];

export const StatusDropdown = ({
  currentStatus,
  onStatusChange,
  disabled = false
}: StatusDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-8 px-3 gap-2 hover:bg-gray-100 dark:hover:bg-gray-700'
        >
          <StatusBadge status={currentStatus} />
          <MoreHorizontal className='w-4 h-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side='bottom'
        align='end'
        sideOffset={4}
        className='z-50 w-40 max-h-60 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md'
      >
        <div className='px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400'>
          تغيير الحالة
        </div>
        <DropdownMenuSeparator />
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className='flex items-center cursor-pointer justify-between'
          >
            <StatusBadge className='w-2/3' status={option.value} />
            {currentStatus === option.value && (
              <Edit3 className='w-3 h-3 text-emerald-600' />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
