import { AttendanceStatus } from '@halaqa/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/ui/typography';
import { getAttendanceStatusConfig } from '../utils/session.util';

interface AttendanceRowProps {
  student: { id: string; name: string };
  attendance: { status: AttendanceStatus; notes?: string } | undefined;
  onStatusChange: (status: AttendanceStatus) => void;
  onNotesChange: (notes: string) => void;
  disabled?: boolean;
}

const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  'ATTENDED',
  'MISSED',
  'EXCUSED'
];

export const AttendanceRow = ({
  student,
  attendance,
  onStatusChange,
  onNotesChange,
  disabled = false
}: AttendanceRowProps) => {
  const currentStatus = attendance?.status ?? 'MISSED';

  return (
    <div className='p-3 rounded-lg border border-border space-y-2'>
      <div className='flex items-center justify-between gap-3'>
        <Typography as='div' size='sm' weight='medium'>
          {student.name}
        </Typography>
        <div className='flex items-center gap-2'>
          {ATTENDANCE_STATUSES.map((status) => {
            const config = getAttendanceStatusConfig(status);
            const isSelected = currentStatus === status;

            return (
              <Button
                key={status}
                type='button'
                onClick={() => !disabled && onStatusChange(status)}
                disabled={disabled}
                variant={isSelected ? 'solid' : 'outline'}
                color={config.color}
                className='h-7 px-2 py-1 text-xs'
              >
                {config.label}
              </Button>
            );
          })}
        </div>
      </div>

      <Input
        type='text'
        placeholder='ملاحظات (اختياري)'
        value={attendance?.notes ?? ''}
        onChange={(e) => onNotesChange(e.target.value)}
        disabled={disabled}
        className='text-sm'
      />
    </div>
  );
};
