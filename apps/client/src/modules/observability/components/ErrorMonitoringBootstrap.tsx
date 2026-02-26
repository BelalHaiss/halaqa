import { useCallback, useEffect } from 'react';
import type { ClientErrorCaptureChannel } from '@halaqa/shared';
import { buildClientErrorPayload } from '../utils/client-error.util';
import { useClientErrorReportMutation } from '../hooks/useClientErrorReportMutation';

type GlobalMetadata = Record<string, string | number | boolean | null>;

export function ErrorMonitoringBootstrap() {
  const { mutate } = useClientErrorReportMutation();

  const reportError = useCallback(
    (captureChannel: ClientErrorCaptureChannel, error: unknown, metadata?: GlobalMetadata) => {
      const payload = buildClientErrorPayload({
        captureChannel,
        error,
        metadata,
      });

      mutate(payload);
    },
    [mutate]
  );

  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      reportError('window_error', event.error ?? event.message ?? 'Unhandled window error', {
        filename: event.filename || null,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError('unhandled_rejection', event.reason, {
        type: 'promise',
      });
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [reportError]);

  return null;
}
