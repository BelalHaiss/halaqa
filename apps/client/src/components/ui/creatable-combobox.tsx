import { useEffect, useState } from 'react';
import { Check, ChevronDown, Loader2, Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { cn } from '@/lib/utils';

export interface ComboboxValue {
  id: string;
  label: string;
  isNew: boolean;
}

export interface ComboboxOption {
  id: string;
  name: string;
}

interface CreatableComboboxProps {
  value: ComboboxValue | null;
  onChange: (value: ComboboxValue | null) => void;
  onSearch: (query: string) => void;
  options: ComboboxOption[];
  isLoading?: boolean;
  placeholder?: string;
  allowCreate?: boolean;
  disabled?: boolean;
}

export function CreatableCombobox({
  value,
  onChange,
  onSearch,
  options,
  isLoading = false,
  placeholder = 'ابحث أو اختر...',
  allowCreate = true,
  disabled = false,
}: CreatableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const debouncedInput = useDebounce(inputValue.trim(), 300);

  useEffect(() => {
    onSearch(debouncedInput);
  }, [debouncedInput]);

  const hasExactMatch = options.some((o) => o.name.toLowerCase() === debouncedInput.toLowerCase());

  const showCreateOption =
    allowCreate && debouncedInput.length >= 2 && !hasExactMatch && !isLoading;

  function handleSelect(option: ComboboxOption) {
    onChange({ id: option.id, label: option.name, isNew: false });
    setOpen(false);
    setInputValue('');
  }

  function handleCreate() {
    onChange({ id: '', label: inputValue.trim(), isNew: true });
    setOpen(false);
    setInputValue('');
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setInputValue('');
    else onSearch('');
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          color='muted'
          disabled={disabled}
          className='w-full justify-between gap-2 font-normal'
        >
          <span className={cn('truncate', value ? 'text-foreground' : 'text-muted-foreground')}>
            {value ? (
              <span className='flex items-center gap-1.5'>
                {value.isNew && (
                  <span className='rounded-sm bg-primary/10 px-1 py-0.5 text-xs text-primary'>
                    جديد
                  </span>
                )}
                {value.label}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <span className='flex shrink-0 items-center gap-1'>
            {value && (
              <span
                role='button'
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)
                }
                className='rounded-sm p-0.5 text-muted-foreground hover:text-foreground'
              >
                <X className='size-3.5' />
              </span>
            )}
            <ChevronDown className='size-4 text-muted-foreground' />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-(--radix-popover-trigger-width) p-0' align='start'>
        {/* Search input */}
        <div className='border-b border-border p-2'>
          <div className='relative'>
            <Search className='absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              autoFocus
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              className='pr-8'
            />
          </div>
        </div>

        {/* Results list */}
        <div className='max-h-56 overflow-y-auto p-1'>
          {isLoading ? (
            <div className='flex items-center justify-center py-5'>
              <Loader2 className='size-4 animate-spin text-muted-foreground' />
            </div>
          ) : options.length === 0 && !showCreateOption ? (
            <p className='py-5 text-center text-sm text-muted-foreground'>لا توجد نتائج</p>
          ) : (
            <>
              {options.map((option) => (
                <button
                  key={option.id}
                  type='button'
                  onClick={() => handleSelect(option)}
                  className='flex w-full items-center justify-between rounded-sm px-3 py-2 text-right text-sm hover:bg-accent hover:text-accent-foreground'
                >
                  <span>{option.name}</span>
                  {value?.id === option.id && !value.isNew && (
                    <Check className='size-3.5 text-primary' />
                  )}
                </button>
              ))}

              {showCreateOption && (
                <button
                  type='button'
                  onClick={handleCreate}
                  className='flex w-full items-center gap-2 rounded-sm px-3 py-2 text-right text-sm text-primary hover:bg-primary/5'
                >
                  <Plus className='size-3.5 shrink-0' />
                  <span>إضافة &quot;{inputValue.trim()}&quot;</span>
                </button>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
