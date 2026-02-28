import { AttendanceStatus } from '@halaqa/shared';
import { Controller, type Control } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import type { AttendanceEditFormData } from '../schema/session.schema';
import { getAttendanceStatusConfig } from '../utils/session.util';

const ATTENDANCE_STATUSES: AttendanceStatus[] = ['ATTENDED', 'MISSED', 'EXCUSED'];

interface AttendanceRowBaseProps {
  student: { id: string; name: string };
  disabled?: boolean;
}

interface AttendanceRowEditProps extends AttendanceRowBaseProps {
  mode: 'edit';
  index: number;
  control: Control<AttendanceEditFormData>;
}

interface AttendanceRowViewProps extends AttendanceRowBaseProps {
  mode: 'view';
  attendance?: { status: AttendanceStatus; notes?: string };
}

type AttendanceRowProps = AttendanceRowEditProps | AttendanceRowViewProps;

const AttendanceStatusButtons = ({
  value,
  onChange,
  disabled,
  invalid = false,
}: {
  value?: AttendanceStatus | null;
  onChange?: (value: AttendanceStatus) => void;
  disabled: boolean;
  invalid?: boolean;
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
          size='xs'
          aria-invalid={invalid}
          className={cn(
            'h-7 rounded-full px-2.5 text-[11px] font-medium',
            invalid && 'border-danger'
          )}
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
      <div className='flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/20 px-2.5 py-2'>
        <Typography
          as='div'
          size='sm'
          weight='medium'
          className='min-w-[150px] flex-1 truncate sm:flex-none sm:w-52'
        >
          {student.name}
        </Typography>

        <div className='min-w-[220px] flex-1 sm:flex-none'>
          <AttendanceStatusButtons value={props.attendance?.status} disabled={true} />
        </div>

        <Input
          type='text'
          placeholder='ملاحظات (اختياري)'
          value={props.attendance?.notes ?? ''}
          disabled={true}
          className='h-8 min-w-[200px] flex-1 text-xs'
        />
      </div>
    );
  }

  return (
    <div className='flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/20 px-2.5 py-2'>
      <Typography
        as='div'
        size='sm'
        weight='medium'
        className='min-w-[150px] flex-1 truncate sm:flex-none sm:w-52'
      >
        {student.name}
      </Typography>

      <Controller
        control={props.control}
        name={`attendance.${props.index}.status`}
        render={({ field, fieldState }) => (
          <div className='min-w-[220px] flex-1 sm:flex-none'>
            <AttendanceStatusButtons
              value={field.value}
              onChange={(nextStatus) => {
                field.onChange(nextStatus);
                field.onBlur();
              }}
              disabled={disabled}
              invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} className='text-xs' />
          </div>
        )}
      />

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
            className='h-8 min-w-[200px] flex-1 text-xs'
          />
        )}
      />
    </div>
  );
};
