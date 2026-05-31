import { useState } from 'react';
import { ChevronDown, Loader2, Search } from 'lucide-react';
import type { LearnerDto } from '@halaqa/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryKeys } from '@/lib/query-client';
import { learnerService } from '@/modules/learners/services/learner.service';

type LearnerSearchComboboxProps = {
  value: string;
  onValueChange: (id: string, name: string) => void;
  placeholder?: string;
  selectedName?: string;
  disabled?: boolean;
};

export function LearnerSearchCombobox({
  value,
  onValueChange,
  placeholder = 'ابحث عن متعلم...',
  selectedName,
  disabled,
}: LearnerSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const debouncedSearch = useDebounce(inputValue.trim(), 300);

  const learnersQuery = useApiQuery<LearnerDto[]>({
    queryKey: queryKeys.learners.list({ search: debouncedSearch || undefined, limit: 10 }),
    queryFn: () =>
      learnerService.queryLearners({ search: debouncedSearch || undefined, limit: 10 }),
    enabled: open,
    placeholderData: (prev) => prev,
  });

  const learners = learnersQuery.data?.data ?? [];

  function handleSelect(learner: LearnerDto) {
    onValueChange(learner.id, learner.name);
    setOpen(false);
    setInputValue('');
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setInputValue('');
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          color='muted'
          disabled={disabled}
          className='w-full justify-between font-normal'
        >
          <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
            {value && selectedName ? selectedName : placeholder}
          </span>
          <ChevronDown className='size-4 text-muted-foreground' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-(--radix-popover-trigger-width) p-0' align='start'>
        <div className='border-b border-border p-2'>
          <div className='relative'>
            <Search className='absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className='pr-8'
            />
          </div>
        </div>
        <div className='max-h-56 overflow-y-auto p-1'>
          {learnersQuery.isPending ? (
            <div className='flex items-center justify-center py-4'>
              <Loader2 className='size-4 animate-spin text-muted-foreground' />
            </div>
          ) : learners.length === 0 ? (
            <p className='py-4 text-center text-sm text-muted-foreground'>لا توجد نتائج</p>
          ) : (
            learners.map((learner) => (
              <button
                key={learner.id}
                type='button'
                onClick={() => handleSelect(learner)}
                className='w-full rounded-sm px-3 py-2 text-right text-sm hover:bg-accent hover:text-accent-foreground'
              >
                {learner.name}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
