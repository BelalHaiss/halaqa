import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type { TimeMinutes } from '@halaqa/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Typography } from '@/components/ui/typography';
import { Field, FieldError } from '@/components/ui/field';
import { createRescheduleSchema, type RescheduleFormData } from '../schema/reschedule.schema';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule: (date: string, time: TimeMinutes) => Promise<void>;
  isLoading?: boolean;
  timezone: string;
}

export const RescheduleDialog = ({
  open,
  onOpenChange,
  onReschedule,
  isLoading = false,
  timezone,
}: RescheduleDialogProps) => {
  const rescheduleSchema = useMemo(() => createRescheduleSchema(timezone), [timezone]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      date: '',
      time: 0 as TimeMinutes,
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: RescheduleFormData) => {
    await onReschedule(data.date, data.time);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-full sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>إعادة جدولة الجلسة</DialogTitle>
          <DialogDescription>
            اختر التاريخ والوقت الجديد للجلسة (المنطقة الزمنية: {timezone})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Typography as='label' size='sm' weight='medium'>
              التاريخ والوقت
            </Typography>
            <Controller
              control={control}
              name='date'
              render={({ field: dateField, fieldState: dateFieldState }) => (
                <Controller
                  control={control}
                  name='time'
                  render={({ field: timeField, fieldState: timeFieldState }) => (
                    <Field data-invalid={dateFieldState.invalid || timeFieldState.invalid}>
                      <DateTimePicker
                        date={dateField.value}
                        time={timeField.value}
                        onDateChange={dateField.onChange}
                        onDateBlur={dateField.onBlur}
                        onTimeChange={timeField.onChange}
                        onTimeBlur={timeField.onBlur}
                        invalid={dateFieldState.invalid || timeFieldState.invalid}
                        disablePastDates
                        disabled={isLoading}
                      />
                    </Field>
                  )}
                />
              )}
            />
            <FieldError errors={[errors.date, errors.time]} />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              color='muted'
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type='submit' disabled={isLoading || !isDirty || !isValid}>
              {isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : 'إعادة جدولة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
