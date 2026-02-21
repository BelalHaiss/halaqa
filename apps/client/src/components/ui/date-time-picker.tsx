import { useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import type { TimeMinutes } from '@halaqa/shared';
import {
  minutesToInputTimeString,
  timeStringToMinutes,
  parseDateString,
  formatDateToISOString,
  formatDateLongArabic
} from '@halaqa/shared';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  date?: string;
  time?: TimeMinutes;
  onDateChange?: (date: string) => void;
  onTimeChange?: (time: TimeMinutes) => void;
  disabled?: boolean;
  dateLabel?: string;
  timeStep?: number;
}

export function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  disabled = false,
  dateLabel = 'اختر التاريخ',
  timeStep = 15
}: DateTimePickerProps) {
  const [internalDate, setInternalDate] = useState<Date | undefined>(
    date ? parseDateString(date) : undefined
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setInternalDate(selectedDate);
    if (selectedDate && onDateChange) {
      onDateChange(formatDateToISOString(selectedDate));
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value;
    if (onTimeChange && timeStr) {
      onTimeChange(timeStringToMinutes(timeStr));
    }
  };

  const displayDate = date ? formatDateLongArabic(date) : dateLabel;

  return (
    <div className='flex gap-2 flex-col sm:flex-row'>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            color='muted'
            className={cn(
              'w-full sm:flex-1 justify-start text-right font-normal',
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
            selected={internalDate}
            onSelect={handleDateSelect}
            initialFocus
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>

      <div className='relative w-full sm:w-48'>
        <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>
          <Clock className='h-4 w-4 text-muted-foreground' />
        </div>
        <Input
          type='time'
          value={time !== undefined ? minutesToInputTimeString(time) : ''}
          onChange={handleTimeChange}
          disabled={disabled}
          className='pr-10 text-right bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden'
          step={timeStep * 60}
        />
      </div>
    </div>
  );
}
