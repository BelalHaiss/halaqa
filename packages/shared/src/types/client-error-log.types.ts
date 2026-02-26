export type ClientErrorCaptureChannel =
  | 'router_error_element'
  | 'window_error'
  | 'unhandled_rejection';

export type ClientErrorMetadata = Record<string, string | number | boolean | null>;

export type ClientErrorLogDto = {
  message: string;
  name?: string;
  stack?: string;
  path: string;
  url: string;
  captureChannel: ClientErrorCaptureChannel;
  userAgent: string;
  timestamp: string;
  metadata?: ClientErrorMetadata;
};

export type ClientErrorLogResponseDto = {
  accepted: true;
};
