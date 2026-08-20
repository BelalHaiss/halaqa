import { useState, useMemo } from 'react';
import PhoneInputPrimitive, {
  type Country,
  getCountries,
  getCountryCallingCode,
} from 'react-phone-number-input';
import arLabels from 'react-phone-number-input/locale/ar.json';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

// ─── Country Selector ─────────────────────────────────────────────────────────

const countryFlag = (code: string) =>
  [...code.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join('');

type CountrySelectorProps = {
  value?: Country;
  onChange: (country: Country) => void;
  disabled?: boolean;
};

function CountrySelector({ value, onChange, disabled }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const allCountries = useMemo(() => getCountries(), []);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter((code) => {
      const label = (arLabels as Record<string, string>)[code]?.toLowerCase() ?? '';
      return label.includes(q) || code.toLowerCase().includes(q);
    });
  }, [allCountries, search]);

  const callingCode = value ? `+${getCountryCallingCode(value)}` : '';
  const flag = value ? countryFlag(value) : '🌍';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          disabled={disabled}
          className='border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 shrink-0 items-center gap-1 rounded-md border bg-transparent px-1.5 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50'
          dir='ltr'
        >
          <span className='text-base leading-none'>{flag}</span>
          <span className='text-xs font-medium tabular-nums text-foreground'>
            {callingCode || ''}
          </span>
          <ChevronDown className='size-3 opacity-40' />
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-72 p-0' align='start' dir='rtl'>
        <div className='border-b p-2'>
          <Input
            placeholder='ابحث عن الدولة...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-8 text-sm'
            dir='rtl'
            autoFocus
          />
        </div>
        <div className='max-h-56 overflow-y-auto p-1'>
          {filteredCountries.map((code) => {
            const label = (arLabels as Record<string, string>)[code] ?? code;
            const calling = `+${getCountryCallingCode(code)}`;
            const isSelected = value === code;
            return (
              <button
                key={code}
                type='button'
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                  isSelected && 'bg-accent text-accent-foreground font-medium'
                )}
                onClick={() => {
                  onChange(code);
                  setSearch('');
                  setOpen(false);
                }}
              >
                <span className='text-base leading-none'>{countryFlag(code)}</span>
                <span className='flex-1 text-right'>{label}</span>
                <span className='text-muted-foreground font-mono text-xs tabular-nums shrink-0'>
                  {calling}
                </span>
              </button>
            );
          })}
          {filteredCountries.length === 0 && (
            <p className='text-muted-foreground py-4 text-center text-sm'>لا توجد نتائج</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Phone Input ──────────────────────────────────────────────────────────────

export type PhoneInputProps = {
  value?: string;
  onChange?: (value: string | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  className?: string;
  'aria-invalid'?: boolean;
};

export function PhoneInput({
  value,
  onChange,
  onBlur,
  disabled,
  id,
  placeholder,
  className,
  'aria-invalid': invalid,
}: PhoneInputProps) {
  return (
    <PhoneInputPrimitive
      style={{ direction: 'ltr' }}
      international={false}
      id={id}
      value={value}
      onChange={onChange as (value: string | undefined) => void}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder ?? 'رقم الهاتف'}
      countrySelectComponent={CountrySelector}
      inputComponent={Input}
      aria-invalid={invalid}
      className={cn('flex gap-1', className)}
      numberInputProps={{
        'aria-invalid': invalid,
        dir: 'ltr',
      }}
    />
  );
}
