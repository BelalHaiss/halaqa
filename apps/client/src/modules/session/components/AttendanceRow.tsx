import { AttendanceStatus } from '@halaqa/shared';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/ui/typography';
import type { AttendanceEditFormData } from '../schema/session.schema';
import { getAttendanceStatusConfig } from '../utils/session.util';

const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  'ATTENDED',
  'MISSED',
  'EXCUSED'
];

interface AttendanceRowBaseProps {
  student: { id: string; name: string };
  disabled?: boolean;
}

interface AttendanceRowEditProps extends AttendanceRowBaseProps {
  mode: 'edit';
  index: number;
  control: Control<AttendanceEditFormData>;
  errors?: FieldErrors<AttendanceEditFormData>;
}

interface AttendanceRowViewProps extends AttendanceRowBaseProps {
  mode: 'view';
  attendance?: { status: AttendanceStatus; notes?: string };
}

type AttendanceRowProps = AttendanceRowEditProps | AttendanceRowViewProps;

const AttendanceStatusButtons = ({
  value,
  onChange,
  disabled
}: {
  value?: AttendanceStatus | null;
  onChange?: (value: AttendanceStatus) => void;
  disabled: boolean;
}) => (
  <div className='flex items-center gap-2 flex-wrap'>
    {ATTENDANCE_STATUSES.map((status) => {
      const config = getAttendanceStatusConfig(status);
      const isSelected = value === status;

      return (
        <Button
          key={status}
          type='button'
          onClick={() => onChange?.(status)}
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
);

export const AttendanceRow = (props: AttendanceRowProps) => {
  const { student, disabled = false } = props;

  if (props.mode === 'view') {
    return (
      <div className='p-3 rounded-lg border border-border space-y-2'>
        <div className='flex items-center justify-between gap-3'>
          <Typography as='div' size='sm' weight='medium'>
            {student.name}
          </Typography>
          <AttendanceStatusButtons
            value={props.attendance?.status}
            disabled={true}
          />
        </div>

        <Input
          type='text'
          placeholder='ملاحظات (اختياري)'
          value={props.attendance?.notes ?? ''}
          disabled={true}
          className='text-sm'
        />
      </div>
    );
  }

  const statusError =
    props.errors?.attendance?.[props.index]?.status?.message?.toString() ?? '';

  return (
    <div className='p-3 rounded-lg border border-border space-y-2'>
      <div className='flex items-center justify-between gap-3'>
        <Typography as='div' size='sm' weight='medium'>
          {student.name}
        </Typography>
        <Controller
          control={props.control}
          name={`attendance.${props.index}.status`}
          render={({ field }) => (
            <AttendanceStatusButtons
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
            />
          )}
        />
      </div>

      {statusError && (
        <Typography as='p' size='sm' color='danger'>
          {statusError}
        </Typography>
      )}

      <Controller
        control={props.control}
        name={`attendance.${props.index}.notes`}
        render={({ field }) => (
          <Input
            type='text'
            placeholder='ملاحظات (اختياري)'
            value={field.value ?? ''}
            onChange={field.onChange}
            disabled={disabled}
            className='text-sm'
          />
        )}
      />
    </div>
  );
};
