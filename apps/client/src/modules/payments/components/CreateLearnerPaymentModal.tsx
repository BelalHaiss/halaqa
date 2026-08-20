import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  createLearnerPaymentSchema,
  CreateLearnerPaymentDto,
  CurrencyCode,
  getCurrencyLabel,
} from '@halaqa/shared';
import z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/forms/form-field';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { PaymentDatePicker } from './PaymentDatePicker';
import { LearnerSearchCombobox } from './LearnerSearchCombobox';
import { CurrencyFormField } from './CurrencyFormField';
import { GroupLazySelect } from './GroupLazySelect';

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
  const [groupPriceHint, setGroupPriceHint] = useState<{
    monthlyPrice?: number;
    currency?: CurrencyCode;
  } | null>(null);
  const form = useForm<FormValues, unknown, CreateLearnerPaymentDto>({
    resolver: zodResolver(createLearnerSchema),
    defaultValues: {
      learnerId: '',
      groupId: '',
      periodFrom: '',
      periodTo: '',
      totalAmount: 0,
      currency: 'EGP',
    },
  });
  const periodFrom = form.watch('periodFrom');
  const learnerId = form.watch('learnerId');
  const { errors } = form.formState;

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);

    form.reset();
    setSelectedLearnerName('');
    setGroupPriceHint(null);
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
              value={learnerId}
              onValueChange={(id, name) => {
                form.setValue('learnerId', id, { shouldValidate: true });
                form.setValue('groupId', '', { shouldValidate: true });
                setSelectedLearnerName(name);
                setGroupPriceHint(null);
              }}
              selectedName={selectedLearnerName}
              placeholder='ابحث عن متعلم...'
              disabled={isSubmitting}
            />
            <FieldError errors={[errors.learnerId]} />
          </Field>

          <Field data-invalid={!!errors.groupId}>
            <FieldLabel htmlFor='groupId'>الحلقة</FieldLabel>
            <GroupLazySelect
              value={form.watch('groupId')}
              learnerId={learnerId}
              onValueChange={(id, option) => {
                form.setValue('groupId', id, { shouldValidate: true });
                setGroupPriceHint(
                  option ? { monthlyPrice: option.monthlyPrice, currency: option.currency } : null
                );
              }}
              placeholder='اختر الحلقة'
              disabled={isSubmitting}
            />
            <FieldError errors={[errors.groupId]} />
            {groupPriceHint?.monthlyPrice != null && groupPriceHint.currency && (
              <p className='text-sm text-muted-foreground'>
                السعر الشهري المسجل للحلقة: {groupPriceHint.monthlyPrice}{' '}
                {getCurrencyLabel(groupPriceHint.currency)}
              </p>
            )}
          </Field>

          <FormField
            control={form.control}
            name='totalAmount'
            label='المبلغ المطلوب'
            type='number'
          />
          <CurrencyFormField control={form.control} name='currency' disabled={isSubmitting} />

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
