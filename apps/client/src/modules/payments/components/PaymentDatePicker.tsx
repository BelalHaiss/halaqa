import { Calendar as CalendarIcon } from 'lucide-react';
import { formatDateLongArabic, formatDateToISOString, parseDateString } from '@halaqa/shared';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type PaymentDatePickerProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
};

export function PaymentDatePicker({
  value,
  placeholder,
  onChange,
  minDate,
  maxDate,
  disabled,
}: PaymentDatePickerProps) {
  const selectedDate = value ? parseDateString(value) : undefined;
  const minDateObj = minDate ? parseDateString(minDate) : undefined;
  const maxDateObj = maxDate ? parseDateString(maxDate) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          color='muted'
          className={cn(
            'w-full justify-start text-right font-normal',
            !value && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <CalendarIcon className='ml-2 h-4 w-4' />
          {value ? formatDateLongArabic(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start' side='bottom' avoidCollisions={false}>
        <Calendar
          mode='single'
          selected={selectedDate}
          onSelect={(date) => onChange(date ? formatDateToISOString(date) : '')}
          disabled={(date) => {
            if (minDateObj && date < minDateObj) {
              return true;
            }

            if (maxDateObj && date > maxDateObj) {
              return true;
            }

            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
