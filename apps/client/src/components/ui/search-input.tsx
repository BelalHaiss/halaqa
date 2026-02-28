import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from './input';

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export const SearchInput = ({
  value,
  onChange,
  placeholder = 'بحث...',
  className,
}: SearchInputProps) => {
  return (
    <div className={cn('relative', className)}>
      <Search className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4' />
      <Input
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        color='muted'
        className='pr-9'
      />
    </div>
  );
};
