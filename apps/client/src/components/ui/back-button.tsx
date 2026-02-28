import { ArrowLeft } from 'lucide-react';
import { useNavigate, type To } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type BackButtonProps = {
  to?: To;
  fallbackTo?: To;
  label?: string;
  className?: string;
};

function BackButton({ to, fallbackTo = '/', label = 'العودة', className }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo, { replace: true });
  };

  return (
    <Button
      type='button'
      variant='outline'
      color='muted'
      size='xs'
      onClick={handleBack}
      className={cn(
        'gap-1.5 rounded-full border-border/70 bg-background/90 px-2.5 text-xs shadow-xs hover:border-primary/30 hover:bg-primary/10',
        className
      )}
      aria-label={label}
    >
      <ArrowLeft className='h-3.5 w-3.5' />
      {label}
    </Button>
  );
}

export { BackButton };
