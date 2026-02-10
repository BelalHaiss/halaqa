import { Search } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Input } from './input';

const searchInputVariants = cva('relative', {
  variants: {
    variant: {
      solid: '',
      ghost: '',
      outline: '',
      soft: ''
    },
    color: {
      primary: '',
      success: '',
      danger: '',
      muted: ''
    }
  },
  compoundVariants: [
    { variant: 'solid', color: 'muted', className: '' },
    { variant: 'solid', color: 'primary', className: '' },
    { variant: 'solid', color: 'success', className: '' },
    { variant: 'solid', color: 'danger', className: '' },

    { variant: 'ghost', color: 'muted', className: '' },
    { variant: 'ghost', color: 'primary', className: '' },
    { variant: 'ghost', color: 'success', className: '' },
    { variant: 'ghost', color: 'danger', className: '' },

    { variant: 'outline', color: 'muted', className: '' },
    { variant: 'outline', color: 'primary', className: '' },
    { variant: 'outline', color: 'success', className: '' },
    { variant: 'outline', color: 'danger', className: '' },

    { variant: 'soft', color: 'muted', className: '' },
    { variant: 'soft', color: 'primary', className: '' },
    { variant: 'soft', color: 'success', className: '' },
    { variant: 'soft', color: 'danger', className: '' }
  ],
  defaultVariants: {
    variant: 'outline',
    color: 'muted'
  }
});

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
} & VariantProps<typeof searchInputVariants>;

export const SearchInput = ({
  value,
  onChange,
  placeholder = 'بحث...',
  className,
  variant,
  color
}: SearchInputProps) => {
  return (
    <div className={cn(searchInputVariants({ variant, color }), className)}>
      <Search className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4' />
      <Input
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        variant={variant ?? 'outline'}
        color={color ?? 'muted'}
        className='pr-9'
      />
    </div>
  );
};
