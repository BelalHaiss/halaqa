import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryKeys } from '@/lib/query-client';
import { paymentService } from '../services/payment.service';

const ALL_VALUE = '__ALL_GROUPS__';

type GroupFilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function GroupFilterSelect({
  value,
  onChange,
  placeholder = 'الحلقة',
}: GroupFilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const groupsQuery = useApiQuery({
    queryKey: queryKeys.groups.options(undefined, true),
    queryFn: () => paymentService.queryGroupOptions(undefined, true),
    enabled: isOpen || Boolean(value),
  });

  const options = useMemo(() => groupsQuery.data?.data ?? [], [groupsQuery.data?.data]);

  return (
    <Select
      value={value || ALL_VALUE}
      onValueChange={(v) => onChange(v === ALL_VALUE ? '' : v)}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>كل الحلقات</SelectItem>
        {groupsQuery.isPending ? (
          <SelectItem value='__loading__' disabled>
            <span className='inline-flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' />
              جاري تحميل الحلقات...
            </span>
          </SelectItem>
        ) : (
          options.map((group) => (
            <SelectItem key={group.value} value={group.value}>
              {group.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
