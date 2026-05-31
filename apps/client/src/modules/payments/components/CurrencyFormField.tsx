import type { FieldValues, Path, Control } from 'react-hook-form';
import { SUPPORTED_CURRENCIES, getCurrencyLabel } from '@halaqa/shared';
import { FormField } from '@/components/forms/form-field';

type CurrencyFormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean;
};

export function CurrencyFormField<T extends FieldValues>({
  control,
  name,
  disabled,
}: CurrencyFormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      label='العملة'
      type='select'
      disabled={disabled}
      options={SUPPORTED_CURRENCIES.map((c) => ({
        value: c,
        label: getCurrencyLabel(c),
      }))}
    />
  );
}
