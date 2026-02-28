import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type FieldError,
} from 'react-hook-form';
import type { ReactNode } from 'react';
import { Checkbox } from '../ui/checkbox';
import { Field, FieldLabel, FieldError as FieldErrorComponent } from '../ui/field';
import { PasswordInput } from '../ui/password-input';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export interface SelectOption {
  value: string;
  label: string;
}

export interface IFormField {
  name: string;
  label?: string | ReactNode;
  type: 'text' | 'email' | 'password' | 'checkbox' | 'select' | 'textarea';
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  inputClassName?: string;
  rows?: number;
  options?: SelectOption[];
}

interface FormFieldProps<T extends FieldValues> extends IFormField {
  control: Control<T>;
  showError?: boolean;
}

function FormFieldComponent<T extends FieldValues>({
  control,
  name,
  label,
  type,
  placeholder,
  disabled,
  id,
  inputClassName,
  showError = true,
  rows,
  options,
}: FormFieldProps<T>) {
  const fieldId = id || name;

  // Determine which input component to render based on type
  const renderInput = (
    value: any,
    onChange: (...event: any[]) => void,
    onBlur: () => void,
    invalid: boolean
  ) => {
    if (type === 'checkbox') {
      return (
        <Checkbox
          id={fieldId}
          checked={value}
          onCheckedChange={(checked) => {
            onChange(checked);
            onBlur();
          }}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={invalid}
          className={inputClassName}
        />
      );
    }

    if (type === 'select') {
      return (
        <Select
          value={value}
          onValueChange={(nextValue) => {
            onChange(nextValue);
            onBlur();
          }}
          onOpenChange={(open) => {
            if (!open) {
              onBlur();
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger
            id={fieldId}
            aria-invalid={invalid}
            onBlur={onBlur}
            className={inputClassName}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === 'textarea') {
      return (
        <Textarea
          id={fieldId}
          placeholder={placeholder}
          disabled={disabled}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={invalid}
          className={inputClassName}
          rows={rows}
        />
      );
    }

    const commonProps = {
      id: fieldId,
      placeholder,
      disabled,
      value,
      onChange,
      onBlur,
      'aria-invalid': invalid,
      className: inputClassName,
    };

    if (type === 'password') {
      return <PasswordInput {...commonProps} />;
    }

    return <Input type={type} {...commonProps} />;
  };

  return (
    <Controller
      name={name as Path<T>}
      control={control}
      render={({ field: { value, onChange, onBlur }, fieldState: { error, invalid } }) => {
        return (
          <Field data-invalid={invalid} className='text-sm' data-disabled={disabled}>
            {type === 'checkbox' ? (
              <div className='flex items-center gap-3'>
                {renderInput(value, onChange, onBlur, invalid)}
                {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
              </div>
            ) : (
              <>
                {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
                {renderInput(value || '', onChange, onBlur, invalid)}
              </>
            )}
            {showError && error && <FieldErrorComponent errors={[error as FieldError]} />}
          </Field>
        );
      }}
    />
  );
}

FormFieldComponent.displayName = 'FormField';

export { FormFieldComponent as FormField };
