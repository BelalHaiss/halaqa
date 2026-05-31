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

const ALL_VALUE = '__ALL_TUTORS__';

type TutorLazySelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  includeAllOption?: boolean;
  disabled?: boolean;
};

export function TutorLazySelect({
  value,
  onValueChange,
  placeholder,
  includeAllOption = false,
  disabled,
}: TutorLazySelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const tutorsQuery = useApiQuery({
    queryKey: queryKeys.groups.tutors(),
    queryFn: () => paymentService.queryTutorOptions(),
    enabled: isOpen || Boolean(value),
  });

  const options = useMemo(() => tutorsQuery.data?.data ?? [], [tutorsQuery.data?.data]);

  return (
    <Select
      value={value || (includeAllOption ? ALL_VALUE : undefined)}
      onValueChange={(nextValue) => {
        if (includeAllOption && nextValue === ALL_VALUE) {
          onValueChange('');
          return;
        }

        onValueChange(nextValue);
      }}
      onOpenChange={setIsOpen}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption ? <SelectItem value={ALL_VALUE}>كل المعلمين</SelectItem> : null}
        {tutorsQuery.isPending ? (
          <SelectItem value='__loading__' disabled>
            <span className='inline-flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' />
              جاري تحميل المعلمين...
            </span>
          </SelectItem>
        ) : options.length > 0 ? (
          options.map((tutor) => (
            <SelectItem key={tutor.id} value={tutor.id}>
              {tutor.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value='__empty__' disabled>
            لا يوجد معلمون
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
