export enum HttpStatus {
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  EARLYHINTS = 103,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  MULTI_STATUS = 207,
  ALREADY_REPORTED = 208,
  CONTENT_DIFFERENT = 210,
  AMBIGUOUS = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  REQUESTED_RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  I_AM_A_TEAPOT = 418,
  MISDIRECTED = 421,
  UNPROCESSABLE_ENTITY = 422,
  LOCKED = 423,
  FAILED_DEPENDENCY = 424,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  UNRECOVERABLE_ERROR = 456,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
  INSUFFICIENT_STORAGE = 507,
  LOOP_DETECTED = 508
}

export type PaginationQueryType = {
  page?: number;
  limit?: number;
};

export type DateRangeQueryType = {
  fromDate?: ISODateOnlyString;
  toDate?: ISODateOnlyString;
};
export type PaginationResponseMeta = {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type PaginatedResult<T> = {
  data: T;
} & PaginationResponseMeta;

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
} & Partial<PaginationResponseMeta>;

export type UnifiedApiResponse<T> = ApiSuccessResponse<T>;

export type ViewMode = 'list' | 'grid' | 'calendar';

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Calendar date in ISO-like format, e.g. "2026-02-15" (YYYY-MM-DD).
export type ISODateOnlyString = string & { __isoDateOnlyBrand: true };

// Time as minutes from midnight (0-1439), interpreted in group/user timezone - used for data/DTOs
export type TimeMinutes = number & { __timeMinutesBrand: true };

// 12-hour time string for UI display, e.g. "02:30 م" - used for rendering only
export type TimeHHMMString = string & { __timeHHMMBrand: true };

// normalize date strings to Date objects in DTOs for better type safety and easier date manipulation in the application. This utility type recursively transforms all ISODateString fields in a given type T into Date objects, while preserving the structure of the original type.
export type ISODateString = string & { __isoDateBrand: true };

export type DayOfWeek = number; // 0 = Sunday, 6 = Saturday
export type MinutesFromMidnight = number; // minutes from midnight in group timezone

type ToDate<T> = T extends ISODateString
  ? Date
  : T extends null
    ? null
    : T extends undefined
      ? undefined
      : T extends Array<infer U>
        ? Array<DatesAsObjects<U>>
        : T extends object
          ? DatesAsObjects<T>
          : T;

export type DatesAsObjects<T> = {
  [K in keyof T]: ToDate<T[K]>;
};
