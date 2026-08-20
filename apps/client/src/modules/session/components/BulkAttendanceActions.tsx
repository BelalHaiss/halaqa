import { AttendanceStatus } from '@halaqa/shared';
import type { UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import type { AttendanceEditFormData } from '../utils/session.validation';
import { getAttendanceStatusConfig } from '../utils/session.util';

const ATTENDANCE_STATUSES: AttendanceStatus[] = ['ATTENDED', 'MISSED', 'EXCUSED'];

interface BulkAttendanceActionsProps {
  setValue: UseFormSetValue<AttendanceEditFormData>;
  getValues: UseFormGetValues<AttendanceEditFormData>;
  disabled?: boolean;
}

export const BulkAttendanceActions = ({
  setValue,
  getValues,
  disabled = false,
}: BulkAttendanceActionsProps) => {
  const applyToAll = (status: AttendanceStatus) => {
    const attendance = getValues('attendance');
    attendance.forEach((_, index) => {
      setValue(`attendance.${index}.status`, status, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

  return (
    <div className='flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border bg-muted/10 px-2.5 py-2'>
      <Typography as='div' size='xs' className='text-muted-foreground'>
        تحديد الكل كـ:
      </Typography>
      {ATTENDANCE_STATUSES.map((status) => {
        const config = getAttendanceStatusConfig(status);
        return (
          <Button
            key={status}
            type='button'
            onClick={() => applyToAll(status)}
            disabled={disabled}
            variant='outline'
            color={config.color}
            size='xs'
            className='h-7 rounded-full px-2.5 text-[11px] font-medium'
          >
            {config.label}
          </Button>
        );
      })}
      <Typography as='div' size='xs' className='text-muted-foreground'>
        يمكنك تعديل أي طالب بعد ذلك
      </Typography>
    </div>
  );
};
