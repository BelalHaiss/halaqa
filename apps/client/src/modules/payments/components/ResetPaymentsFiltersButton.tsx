import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ResetPaymentsFiltersButtonProps = {
  onClick: () => void;
};

export function ResetPaymentsFiltersButton({ onClick }: ResetPaymentsFiltersButtonProps) {
  return (
    <Button
      type='button'
      variant='outline'
      color='muted'
      onClick={onClick}
      className='h-10 gap-2 rounded-full border-dashed px-4'
    >
      <RotateCcw className='h-4 w-4' />
      إعادة تعيين الفلاتر
    </Button>
  );
}
