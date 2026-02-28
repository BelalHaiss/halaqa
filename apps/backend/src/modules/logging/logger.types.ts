import type { ClientErrorLogDto } from '@halaqa/shared';

export type BackendErrorLogEvent = {
  source: 'backend';
  context: string;
  message: string;
  timestamp: string;
  statusCode: number;
  method: string;
  path: string;
  stack?: string;
  requestId?: string;
  userId?: string;
};

type ClientLogPayload = Pick<
  ClientErrorLogDto,
  'message' | 'name' | 'stack' | 'path' | 'url' | 'captureChannel' | 'userAgent' | 'metadata'
>;

export type ClientErrorLogEvent = ClientLogPayload & {
  source: 'client';
  context: 'client-report';
  timestamp: string;
  clientTimestamp: string;
  ip?: string;
};
