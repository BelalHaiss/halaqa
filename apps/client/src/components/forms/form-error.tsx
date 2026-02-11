import { ApiError } from '@/lib/hooks/useApiMutation';
import { Typography } from '../ui/typography';

interface FormErrorProps {
  error?: ApiError | null;
}

export function FormError({ error }: FormErrorProps) {
  if (!error) return null;

  return (
    <div className='rounded-lg bg-red-50 border border-red-200 px-3 py-2'>
      <Typography as='span' size='sm' className='text-red-600'>
        {error.message}
      </Typography>
    </div>
  );
}
