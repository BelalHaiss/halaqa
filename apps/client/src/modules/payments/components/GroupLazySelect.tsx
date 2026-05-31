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

type GroupLazySelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
};

export function GroupLazySelect({
  value,
  onValueChange,
  placeholder,
  disabled,
}: GroupLazySelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const groupsQuery = useApiQuery({
    queryKey: queryKeys.groups.options(),
    queryFn: () => paymentService.queryGroupOptions(),
    enabled: isOpen || Boolean(value),
  });

  const options = useMemo(() => groupsQuery.data?.data ?? [], [groupsQuery.data?.data]);

  return (
    <Select
      value={value || undefined}
      onValueChange={onValueChange}
      onOpenChange={setIsOpen}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {groupsQuery.isPending ? (
          <SelectItem value='__loading__' disabled>
            <span className='inline-flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' />
              جاري تحميل الحلقات...
            </span>
          </SelectItem>
        ) : options.length > 0 ? (
          options.map((group) => (
            <SelectItem key={group.value} value={group.value}>
              {group.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value='__empty__' disabled>
            لا توجد حلقات
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
