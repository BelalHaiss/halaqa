import { Calendar as CalendarIcon } from 'lucide-react';
import { formatDateLongArabic, formatDateToISOString, parseDateString } from '@halaqa/shared';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type HistoryDateInputProps = {
  value: string;
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function HistoryDateInput({
  value,
  placeholder,
  disabled = false,
  onChange,
}: HistoryDateInputProps) {
  const selectedDate = value ? parseDateString(value) : undefined;

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
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={selectedDate}
          onSelect={(date) => onChange(date ? formatDateToISOString(date) : '')}
          initialFocus
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
