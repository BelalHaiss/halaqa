import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createLearnerPaymentSchema, CreateLearnerPaymentDto } from '@halaqa/shared';
import z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/forms/form-field';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { PaymentDatePicker } from './PaymentDatePicker';
import { LearnerSearchCombobox } from './LearnerSearchCombobox';
import { CurrencyFormField } from './CurrencyFormField';

const createLearnerSchema = createLearnerPaymentSchema('ar');

type FormValues = z.input<typeof createLearnerSchema>;

type CreateLearnerPaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateLearnerPaymentDto) => Promise<void>;
  isSubmitting?: boolean;
};

export function CreateLearnerPaymentModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateLearnerPaymentModalProps) {
  const [selectedLearnerName, setSelectedLearnerName] = useState('');
  const form = useForm<FormValues, unknown, CreateLearnerPaymentDto>({
    resolver: zodResolver(createLearnerSchema),
    defaultValues: {
      learnerId: '',
      billingType: 'SESSION_COUNT_MONTHLY',
      sessionsCount: 1,
      periodFrom: '',
      periodTo: '',
      totalAmount: 0,
      currency: 'EGP',
      initialPaidAmount: 0,
    },
  });
  const periodFrom = form.watch('periodFrom');
  const { errors } = form.formState;

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);

    form.reset();
    setSelectedLearnerName('');
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إنشاء اشتراك متعلم</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-3'>
          <Field data-invalid={!!errors.learnerId}>
            <FieldLabel htmlFor='learnerId'>المتعلم</FieldLabel>
            <LearnerSearchCombobox
              value={form.watch('learnerId')}
              onValueChange={(id, name) => {
                form.setValue('learnerId', id, { shouldValidate: true });
                setSelectedLearnerName(name);
              }}
              selectedName={selectedLearnerName}
              placeholder='ابحث عن متعلم...'
              disabled={isSubmitting}
            />
            <FieldError errors={[errors.learnerId]} />
          </Field>
          <FormField
            control={form.control}
            name='billingType'
            label='نوع الاشتراك'
            type='select'
            options={[{ value: 'SESSION_COUNT_MONTHLY', label: 'شهري حسب عدد الجلسات' }]}
          />
          <FormField control={form.control} name='sessionsCount' label='عدد الجلسات' type='text' />
          <Field data-invalid={!!errors.periodFrom}>
            <FieldLabel htmlFor='periodFrom'>من</FieldLabel>
            <PaymentDatePicker
              value={form.watch('periodFrom')}
              onChange={(value) => form.setValue('periodFrom', value, { shouldValidate: true })}
              placeholder='اختر تاريخ البداية'
              disabled={isSubmitting}
            />
            <FieldError errors={[errors.periodFrom]} />
          </Field>
          <Field data-invalid={!!errors.periodTo}>
            <FieldLabel htmlFor='periodTo'>إلى</FieldLabel>
            <PaymentDatePicker
              value={form.watch('periodTo')}
              onChange={(value) => form.setValue('periodTo', value, { shouldValidate: true })}
              minDate={periodFrom || undefined}
              placeholder='اختر تاريخ النهاية'
              disabled={isSubmitting}
            />
            <FieldError errors={[errors.periodTo]} />
          </Field>
          <FormField
            control={form.control}
            name='totalAmount'
            label='إجمالي الاشتراك'
            type='number'
          />
          <FormField
            control={form.control}
            name='initialPaidAmount'
            label='المدفوع الآن'
            type='number'
          />
          <CurrencyFormField control={form.control} name='currency' disabled={isSubmitting} />

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
              إنشاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
