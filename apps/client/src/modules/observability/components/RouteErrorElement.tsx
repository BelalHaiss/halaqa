import { useEffect, useRef } from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { normalizeError } from '@/lib/errors/normalize-error';
import { useClientErrorReportMutation } from '../hooks/useClientErrorReportMutation';
import { buildClientErrorPayload } from '../utils/client-error.util';

export function RouteErrorElement() {
  const routeError = useRouteError();
  const hasReportedRef = useRef(false);
  const { mutate } = useClientErrorReportMutation();

  useEffect(() => {
    if (hasReportedRef.current) {
      return;
    }

    hasReportedRef.current = true;

    mutate(
      buildClientErrorPayload({
        captureChannel: 'router_error_element',
        error: routeError,
      })
    );
  }, [mutate, routeError]);

  const { message } = normalizeError(routeError);

  return (
    <main className='flex min-h-screen items-center justify-center p-4'>
      <Alert alertType='ERROR' className='max-w-xl border-danger/40 bg-danger/5'>
        <TriangleAlert />
        <AlertTitle>Unexpected error</AlertTitle>
        <AlertDescription>
          <Typography as='span' size='sm'>
            {message}
          </Typography>
          <Button asChild variant='soft' color='muted' size='sm'>
            <Link to='/'>Back to dashboard</Link>
          </Button>
        </AlertDescription>
      </Alert>
    </main>
  );
}
