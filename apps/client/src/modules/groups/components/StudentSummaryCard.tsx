import { GroupStudentSummaryDto } from '@halaqa/shared';
import { Trash2, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { TimezoneDisplay } from '@/components/ui/timezone-display';

type StudentSummaryCardProps = {
  student: GroupStudentSummaryDto;
  onClick?: () => void;
  onDelete?: (studentId: string) => void;
};

export function StudentSummaryCard({ student, onClick, onDelete }: StudentSummaryCardProps) {
  const learnerInitial = student.name.trim().charAt(0) || '؟';

  return (
    <Card
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      className={
        onClick
          ? 'cursor-pointer transition-all hover:shadow-md hover:border-primary/20'
          : undefined
      }
    >
      <CardContent className='p-4'>
        <div className='flex flex-row items-center justify-between gap-4'>
          <div className='flex flex-row items-center gap-3 min-w-0 flex-1'>
            <div className='size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0'>
              {learnerInitial}
            </div>

            <div className='flex flex-col min-w-0'>
              <Typography as='div' size='md' weight='medium' className='truncate'>
                {student.name}
              </Typography>
              <div className='flex flex-row items-center gap-1 text-muted-foreground'>
                <UserCircle2 className='w-3.5 h-3.5' />
                <Typography as='span' size='xs'>
                  متعلم
                </Typography>
              </div>
            </div>

            <div className='flex flex-row items-center gap-3 shrink-0'>
              <TimezoneDisplay timezone={student.timezone} />
            </div>

            <div className='flex flex-col min-w-0 flex-1'>
              {student.notes ? (
                <Typography as='div' size='xs' className='truncate text-muted-foreground'>
                  {student.notes}
                </Typography>
              ) : (
                <Typography as='div' size='xs' className='text-muted-foreground'>
                  لا توجد ملاحظات
                </Typography>
              )}
            </div>
          </div>

          {onDelete ? (
            <Button
              variant='ghost'
              color='danger'
              size='sm'
              className='h-8 w-8 p-0 shrink-0'
              onClick={(event) => {
                event.stopPropagation();
                onDelete(student.id);
              }}
              aria-label='حذف الطالب من الحلقة'
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
