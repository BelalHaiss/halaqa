import { CurrencyCode, SUPPORTED_CURRENCIES, getCurrencyLabel } from '@halaqa/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL_VALUE = '__ALL_CURRENCIES__';

type CurrencySelectFilterProps = {
  value: CurrencyCode | '';
  onChange: (value: CurrencyCode | '') => void;
  placeholder?: string;
};

export function CurrencySelectFilter({
  value,
  onChange,
  placeholder = 'العملة',
}: CurrencySelectFilterProps) {
  return (
    <Select
      value={value || ALL_VALUE}
      onValueChange={(v) => onChange(v === ALL_VALUE ? '' : (v as CurrencyCode))}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>كل العملات</SelectItem>
        {SUPPORTED_CURRENCIES.map((c) => (
          <SelectItem key={c} value={c}>
            {getCurrencyLabel(c)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
