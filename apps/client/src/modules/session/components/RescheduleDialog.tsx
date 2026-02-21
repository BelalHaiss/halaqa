import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import type { TimeMinutes, ISODateOnlyString } from '@halaqa/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Typography } from '@/components/ui/typography';

const rescheduleSchema = z.object({
  date: z.string().min(1, 'التاريخ مطلوب'),
  time: z.number().int().min(0).max(1439, 'الوقت مطلوب')
});

type RescheduleFormData = z.infer<typeof rescheduleSchema>;

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
  timezone
}: RescheduleDialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      date: '',
      time: 0 as TimeMinutes
    }
  });

  const onSubmit = async (data: RescheduleFormData) => {
    await onReschedule(data.date, data.time as TimeMinutes);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
              render={({ field: dateField }) => (
                <Controller
                  control={control}
                  name='time'
                  render={({ field: timeField }) => (
                    <DateTimePicker
                      date={dateField.value}
                      time={timeField.value}
                      onDateChange={dateField.onChange}
                      onTimeChange={timeField.onChange}
                      disabled={isLoading}
                    />
                  )}
                />
              )}
            />
            {(errors.date || errors.time) && (
              <Typography as='p' size='sm' color='danger'>
                {errors.date?.message || errors.time?.message}
              </Typography>
            )}
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
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                'إعادة جدولة'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
