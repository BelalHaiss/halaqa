import type {
  ClientErrorCaptureChannel,
  ClientErrorLogDto,
  ClientErrorMetadata,
} from '@halaqa/shared';
import { getNowAsUTC } from '@halaqa/shared';
import { normalizeError } from '@/lib/errors/normalize-error';
import { storageService } from '@/services';

const MAX_STACK_LENGTH = 8000;
const MAX_MESSAGE_LENGTH = 3000;

export const buildClientErrorPayload = ({
  captureChannel,
  error,
  metadata,
}: {
  captureChannel: ClientErrorCaptureChannel;
  error: unknown;
  metadata?: ClientErrorMetadata;
}): ClientErrorLogDto => {
  const errorInfo = normalizeError(error);
  const currentUser = storageService.getUser();

  const mergedMetadata: ClientErrorMetadata = {
    ...(metadata ?? {}),
    ...(currentUser?.id ? { userId: currentUser.id } : {}),
  };

  return {
    message: clamp(errorInfo.message, MAX_MESSAGE_LENGTH),
    name: errorInfo.name,
    stack: errorInfo.stack ? clamp(errorInfo.stack, MAX_STACK_LENGTH) : undefined,
    path: `${window.location.pathname}${window.location.search}`,
    url: window.location.href,
    captureChannel,
    userAgent: window.navigator.userAgent,
    timestamp: getNowAsUTC(),
    metadata: Object.keys(mergedMetadata).length > 0 ? mergedMetadata : undefined,
  };
};

const clamp = (value: string, maxLength: number): string =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
