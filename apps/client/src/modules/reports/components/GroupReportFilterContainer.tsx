import { GroupSelectOptionDto } from '@halaqa/shared';
import { HistoryDateInput } from '@/modules/session';
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

type GroupReportFilterContainerProps = {
  groupId: string;
  fromDate: string;
  toDate: string;
  groupOptions: GroupSelectOptionDto[];
  disabled?: boolean;
  onGroupChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onClear: () => void;
};

export function GroupReportFilterContainer({
  groupId,
  fromDate,
  toDate,
  groupOptions,
  disabled = false,
  onGroupChange,
  onFromDateChange,
  onToDateChange,
  onClear,
}: GroupReportFilterContainerProps) {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle size='lg'>الفلاتر</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <div className='space-y-1'>
            <Typography as='label' size='xs' className='text-muted-foreground'>
              الحلقة
            </Typography>
            <Select value={groupId} onValueChange={onGroupChange} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder='اختر الحلقة' />
              </SelectTrigger>
              <SelectContent>
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
        </div>

        <div className='flex justify-end'>
          <Button variant='outline' color='muted' size='sm' onClick={onClear} disabled={disabled}>
            مسح الفلاتر
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
