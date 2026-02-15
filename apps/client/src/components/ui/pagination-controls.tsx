import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
};

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className,
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const canGoNext = page < safeTotalPages && !disabled;
  const canGoPrevious = page > 1 && !disabled;

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <Button
        variant='outline'
        color='muted'
        size='sm'
        disabled={!canGoPrevious}
        onClick={() => onPageChange(page - 1)}
      >
        السابق
      </Button>

      <span className='text-sm text-muted-foreground'>
        صفحة {Math.min(page, safeTotalPages)} من {safeTotalPages}
      </span>

      <Button
        variant='outline'
        color='muted'
        size='sm'
        disabled={!canGoNext}
        onClick={() => onPageChange(page + 1)}
      >
        التالي
      </Button>
    </div>
  );
}
