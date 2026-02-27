import { GroupSelectOptionDto, SessionRecordStatus } from '@halaqa/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Typography } from '@/components/ui/typography';
import { HistoryDateInput } from './HistoryDateInput';

const SESSION_STATUS_OPTIONS: Array<{
  value: SessionRecordStatus;
  label: string;
}> = [
  { value: 'RESCHEDULED', label: 'معاد جدولتها' },
  { value: 'COMPLETED', label: 'مكتملة' },
  { value: 'CANCELED', label: 'ملغية' },
  { value: 'MISSED', label: 'فائتة' },
];

type HistoryFilterContainerProps = {
  fromDate: string;
  toDate: string;
  groupId: string;
  status: SessionRecordStatus | '';
  groupOptions: GroupSelectOptionDto[];
  disabled?: boolean;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
};

export function HistoryFilterContainer({
  fromDate,
  toDate,
  groupId,
  status,
  groupOptions,
  disabled = false,
  onFromDateChange,
  onToDateChange,
  onGroupChange,
  onStatusChange,
  onClear,
}: HistoryFilterContainerProps) {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle size='lg'>الفلاتر</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
          <div className='space-y-1'>
            <Typography as='label' size='xs' className='text-muted-foreground'>
              من تاريخ
            </Typography>
            <HistoryDateInput
              value={fromDate}
              placeholder='اختر تاريخ البداية'
              disabled={disabled}
              onChange={onFromDateChange}
            />
          </div>

          <div className='space-y-1'>
            <Typography as='label' size='xs' className='text-muted-foreground'>
              إلى تاريخ
            </Typography>
            <HistoryDateInput
              value={toDate}
              placeholder='اختر تاريخ النهاية'
              disabled={disabled}
              onChange={onToDateChange}
            />
          </div>

          <div className='space-y-1'>
            <Typography as='label' size='xs' className='text-muted-foreground'>
              الحلقة
            </Typography>
            <Select
              value={groupId || 'ALL'}
              onValueChange={(value) => onGroupChange(value === 'ALL' ? '' : value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder='كل الحلقات' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>كل الحلقات</SelectItem>
                {groupOptions.map((groupOption) => (
                  <SelectItem key={groupOption.value} value={groupOption.value}>
                    {groupOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1'>
            <Typography as='label' size='xs' className='text-muted-foreground'>
              حالة الجلسة
            </Typography>
            <Select
              value={status || 'ALL'}
              onValueChange={(value) => onStatusChange(value === 'ALL' ? '' : value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder='كل الحالات' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>كل الحالات</SelectItem>
                {SESSION_STATUS_OPTIONS.map((statusOption) => (
                  <SelectItem key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex justify-end'>
          <Button
            variant='outline'
            color='muted'
            size='sm'
            onClick={onClear}
            disabled={disabled}
          >
            مسح الفلاتر
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
