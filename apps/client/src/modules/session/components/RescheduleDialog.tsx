import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { FormField } from '@/components/forms/form-field';

const rescheduleSchema = z.object({
  date: z.string().min(1, 'التاريخ مطلوب'),
  time: z.string().min(1, 'الوقت مطلوب')
});

type RescheduleFormData = z.infer<typeof rescheduleSchema>;

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule: (date: string, time: string) => Promise<void>;
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
      time: ''
    }
  });

  const onSubmit = async (data: RescheduleFormData) => {
    await onReschedule(data.date, data.time);
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
          <FormField
            control={control}
            name='date'
            label='التاريخ'
            type='text'
            placeholder='YYYY-MM-DD'
            showError={!!errors.date}
          />

          <FormField
            control={control}
            name='time'
            label='الوقت'
            type='text'
            placeholder='HH:mm'
            showError={!!errors.time}
          />

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
