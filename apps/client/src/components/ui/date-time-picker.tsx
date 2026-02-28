import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import {
  type TimeMinutes,
  minutesToInputTimeString,
  timeStringToMinutes,
  parseDateString,
  formatDateToISOString,
  formatDateLongArabic,
} from '@halaqa/shared';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Input } from './input';
import { cn } from '@/lib/utils';

type DateTimePickerMode = 'dateTime' | 'dateOnly' | 'timeOnly';

interface DateTimePickerProps {
  mode?: DateTimePickerMode;
  date?: string;
  time?: number;
  onDateChange?: (date: string) => void;
  onTimeChange?: (time: number) => void;
  onDateBlur?: () => void;
  onTimeBlur?: () => void;
  disabled?: boolean;
  dateLabel?: string;
  timeStep?: number;
  invalid?: boolean;
  disablePastDates?: boolean;
}

export function DateTimePicker({
  mode = 'dateTime',
  date,
  time,
  onDateChange,
  onTimeChange,
  onDateBlur,
  onTimeBlur,
  disabled = false,
  dateLabel = 'اختر التاريخ',
  timeStep = 15,
  invalid = false,
  disablePastDates = false,
}: DateTimePickerProps) {
  const selectedDate = date ? parseDateString(date) : undefined;
  const showDate = mode !== 'timeOnly';
  const showTime = mode !== 'dateOnly';

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && onDateChange) {
      onDateChange(formatDateToISOString(selectedDate));
    }
    onDateBlur?.();
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value;
    if (onTimeChange && timeStr) {
      onTimeChange(timeStringToMinutes(timeStr));
    }
  };

  const displayDate = date ? formatDateLongArabic(date) : dateLabel;

  return (
    <div className='flex flex-col gap-2 sm:flex-row'>
      {showDate ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              color='muted'
              aria-invalid={invalid}
              onBlur={onDateBlur}
              className={cn(
                'w-full justify-start text-right font-normal',
                showTime && 'sm:flex-1',
                !date && 'text-muted-foreground'
              )}
              disabled={disabled}
            >
              <CalendarIcon className='ml-2 h-4 w-4' />
              {displayDate}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={selectedDate}
              onSelect={handleDateSelect}
              disablePastDates={disablePastDates}
              disabled={disabled}
            />
          </PopoverContent>
        </Popover>
      ) : null}

      {showTime ? (
        <div className={cn('relative w-full', showDate && 'sm:w-48')}>
          <div className='pointer-events-none absolute inset-y-0 right-3 flex items-center'>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </div>
          <Input
            type='time'
            value={time !== undefined ? minutesToInputTimeString(time as TimeMinutes) : ''}
            onChange={handleTimeChange}
            onBlur={onTimeBlur}
            aria-invalid={invalid}
            disabled={disabled}
            className='bg-background pr-10 text-right appearance-none [&::-webkit-calendar-picker-indicator]:hidden'
            step={timeStep * 60}
          />
        </div>
      ) : null}
    </div>
  );
}
