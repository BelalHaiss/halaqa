import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PaginationControlsProps = {
  value: number;
  totalPages: number;
  onValueChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
};

export function PaginationControls({
  value,
  totalPages,
  onValueChange,
  disabled = false,
  className,
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const safeCurrentPage = Math.min(Math.max(value, 1), safeTotalPages);
  const canGoNext = safeCurrentPage < safeTotalPages && !disabled;
  const canGoPrevious = safeCurrentPage > 1 && !disabled;

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <Button
        variant='outline'
        color='muted'
        size='sm'
        disabled={!canGoPrevious}
        onClick={() => onValueChange(safeCurrentPage - 1)}
      >
        السابق
      </Button>

      <span className='text-sm text-muted-foreground'>
        صفحة {safeCurrentPage} من {safeTotalPages}
      </span>

      <Button
        variant='outline'
        color='muted'
        size='sm'
        disabled={!canGoNext}
        onClick={() => onValueChange(safeCurrentPage + 1)}
      >
        التالي
      </Button>
    </div>
  );
}
