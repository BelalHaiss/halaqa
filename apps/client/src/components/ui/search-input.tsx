import { Search } from 'lucide-react';
import { Input } from './input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = "بحث...",
  className = ""
}: SearchInputProps) => {
  return (
    <div className={`relative ${className}`}>
      <Search className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
      <Input
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='pr-9'
      />
    </div>
  );
};