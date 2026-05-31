import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { applyLearnerPaymentSchema, CurrencyCode, getCurrencyLabel } from '@halaqa/shared';
import z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/forms/form-field';

const baseSchema = applyLearnerPaymentSchema('ar');

const applyLearnerSchema = baseSchema
  .extend({ remainingAmount: z.number() })
  .refine((data) => data.amount <= data.remainingAmount, {
    message: 'المبلغ لا يمكن أن يتجاوز المتبقي',
    path: ['amount'],
  });

type FormValues = z.input<typeof applyLearnerSchema>;
type OutputValues = z.output<typeof applyLearnerSchema>;

type ApplyLearnerPaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (amount: number) => Promise<void>;
  currency: CurrencyCode;
  maxAmount: number;
  isSubmitting?: boolean;
};

export function ApplyLearnerPaymentModal({
  open,
  onOpenChange,
  onSubmit,
  currency,
  maxAmount,
  isSubmitting,
}: ApplyLearnerPaymentModalProps) {
  const form = useForm<FormValues, unknown, OutputValues>({
    resolver: zodResolver(applyLearnerSchema),
    defaultValues: {
      amount: 0,
      currency,
      remainingAmount: maxAmount,
    },
  });

  useEffect(() => {
    form.setValue('currency', currency);
    form.setValue('remainingAmount', maxAmount);
  }, [currency, maxAmount, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values.amount);
    form.reset({ amount: 0, currency, remainingAmount: maxAmount });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تسجيل دفعة للمتعلم</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-3'>
          <div className='rounded-md border border-border bg-muted/40 p-3 text-sm'>
            <div>
              المتبقي: {maxAmount.toFixed(2)} {getCurrencyLabel(currency)}
            </div>
          </div>

          <FormField
            control={form.control}
            name='amount'
            label={`المبلغ (${getCurrencyLabel(currency)})`}
            type='number'
            placeholder='أدخل المبلغ'
          />

          <div className='flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              color='muted'
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              تأكيد الدفع
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
