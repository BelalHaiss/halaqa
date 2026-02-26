import axios from 'axios';
import { ApiErrorResponse } from '@halaqa/shared';

export type ApiError = {
  message: string;
  statusCode?: number;
  fields?: { field: string; message: string }[];
};

export type NormalizedError = ApiError & {
  name?: string;
  stack?: string;
};

const DEFAULT_MESSAGE = 'حدث خطأ غير متوقع';

export const normalizeError = (error: unknown): NormalizedError => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const apiError = error.response?.data;

    return {
      message: apiError?.message || error.message || DEFAULT_MESSAGE,
      statusCode: apiError?.statusCode || error.response?.status,
      fields: apiError?.fields,
      name: error.name || 'Error',
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || DEFAULT_MESSAGE,
      name: error.name || 'Error',
      stack: error.stack,
    };
  }

  return { message: DEFAULT_MESSAGE, name: 'UnknownError' };
};
