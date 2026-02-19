import { LearnerDto } from '@halaqa/shared';
import { Pencil, Trash2, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { TimezoneDisplay } from '@/components/ui/timezone-display';

type StudentTableItemProps = {
  learner: LearnerDto;
  showActions?: boolean;
  onClick: (learner: LearnerDto) => void;
  onEdit: (learner: LearnerDto) => void;
  onDelete: (learner: LearnerDto) => void;
};

export function StudentTableItem({
  learner,
  showActions = true,
  onClick,
  onEdit,
  onDelete
}: StudentTableItemProps) {
  const learnerInitial = learner.name.trim().charAt(0) || '؟';

  return (
    <TableRow
      className='cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-900/40'
      onClick={() => onClick(learner)}
    >
      <TableCell className='px-4 py-3'>
        <div className='flex items-center gap-2.5'>
          <div className='size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold'>
            {learnerInitial}
          </div>
          <div className='flex flex-col'>
            <div className='text-sm text-gray-900 dark:text-gray-100 font-medium'>
              {learner.name}
            </div>
            <div className='text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1'>
              <UserCircle2 className='w-3.5 h-3.5' />
              متعلم
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className='px-4 py-3'>
        <TimezoneDisplay
          timezone={learner.timezone}
          variant='soft'
          color='muted'
          size='sm'
        />
      </TableCell>
      <TableCell className='px-4 py-3 max-w-72'>
        <div className='truncate text-xs text-gray-600 dark:text-gray-400'>
          {learner.contact.notes || 'لا توجد ملاحظات'}
        </div>
      </TableCell>
      <TableCell className='px-4 py-3 text-right'>
        {showActions ? (
          <div className='flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='ghost'
              color='primary'
              size='sm'
              className='h-8 w-8 p-0'
              onClick={(event) => {
                event.stopPropagation();
                onEdit(learner);
              }}
              aria-label='تعديل المتعلم'
            >
              <Pencil className='w-4 h-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              color='danger'
              size='sm'
              className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
              onClick={(event) => {
                event.stopPropagation();
                onDelete(learner);
              }}
              aria-label='حذف المتعلم'
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>
        ) : (
          '-'
        )}
      </TableCell>
    </TableRow>
  );
}
