import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import type { CreateManualTransactionDto, TransactionLabelDto } from '@halaqa/shared';
import { createManualTransactionSchema } from '@halaqa/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { FormField } from '@/components/forms/form-field';
import { CreatableCombobox, type ComboboxValue } from '@/components/ui/creatable-combobox';
import { CurrencyFormField } from './CurrencyFormField';

const schema = createManualTransactionSchema('ar');
type FormInputValues = z.input<typeof schema>;

type CreateTransactionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateManualTransactionDto) => Promise<void>;
  isSubmitting?: boolean;
  labels: TransactionLabelDto[];
  isLabelsLoading?: boolean;
  onLabelSearch: (query: string) => void;
};

export function CreateTransactionModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  labels,
  isLabelsLoading,
  onLabelSearch,
}: CreateTransactionModalProps) {
  const [labelValue, setLabelValue] = useState<ComboboxValue | null>(null);

  const form = useForm<FormInputValues, unknown, CreateManualTransactionDto>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'INCOME',
      amount: 0,
      currency: 'EGP',
      notes: '',
      labelId: undefined,
      newLabelName: undefined,
    },
  });

  const { errors } = form.formState;

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
      setLabelValue(null);
    }
    onOpenChange(nextOpen);
  };

  const handleLabelChange = (value: ComboboxValue | null) => {
    setLabelValue(value);
    if (value?.isNew) {
      form.setValue('newLabelName', value.label, { shouldValidate: true });
      form.setValue('labelId', undefined, { shouldValidate: false });
    } else if (value) {
      form.setValue('labelId', value.id, { shouldValidate: true });
      form.setValue('newLabelName', undefined, { shouldValidate: false });
    } else {
      form.setValue('labelId', undefined, { shouldValidate: true });
      form.setValue('newLabelName', undefined, { shouldValidate: false });
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    form.reset();
    setLabelValue(null);
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة معاملة</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-3'>
          <FormField
            control={form.control}
            name='type'
            label='نوع المعاملة'
            type='select'
            disabled={isSubmitting}
            options={[
              { value: 'INCOME', label: 'إيراد' },
              { value: 'EXPENSE', label: 'مصروف' },
            ]}
          />

          <FormField
            control={form.control}
            name='amount'
            label='المبلغ'
            type='number'
            placeholder='0.00'
            disabled={isSubmitting}
          />

          <CurrencyFormField control={form.control} name='currency' disabled={isSubmitting} />

          <Field>
            <FieldLabel>التصنيف</FieldLabel>
            <CreatableCombobox
              value={labelValue}
              onChange={handleLabelChange}
              onSearch={onLabelSearch}
              options={labels.map((l) => ({ id: l.id, name: l.name }))}
              isLoading={isLabelsLoading}
              placeholder='ابحث أو أضف تصنيفاً...'
              allowCreate
              disabled={isSubmitting}
            />
            <FieldError errors={[errors.labelId, errors.newLabelName]} />
          </Field>

          <FormField
            control={form.control}
            name='notes'
            label='ملاحظات (اختياري)'
            type='textarea'
            placeholder='أدخل وصفاً أو ملاحظات...'
            disabled={isSubmitting}
            rows={3}
          />

          <div className='flex justify-end gap-2 pt-1'>
            <Button
              type='button'
              variant='ghost'
              color='muted'
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type='submit' variant='solid' color='primary' disabled={isSubmitting}>
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
