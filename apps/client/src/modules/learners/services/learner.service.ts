import { apiClient } from '@/services';
import {
  CreateLearnerDto,
  LearnerDto,
  QueryLearnersDto,
  ResponseDto,
  UnifiedApiResponse,
  UpdateLearnerDto,
} from '@halaqa/shared';
import type { PaginationResponseMeta } from '@halaqa/shared';

type LearnersPaginationMeta = PaginationResponseMeta['meta'];

export type LearnersListDto = {
  items: LearnerDto[];
  meta: LearnersPaginationMeta;
};

type RawLearnersQueryResponse = {
  success: boolean;
  data?: LearnerDto[];
  error?: string;
  message?: string;
  meta?: LearnersPaginationMeta;
};

const ensureSuccess = <T extends { success: boolean; error?: string; message?: string }>(
  response: T,
): void => {
  if (!response.success) {
    throw new Error(response.error || response.message || 'تعذر إكمال العملية');
  }
};

const buildLearnerQueryParams = (query: QueryLearnersDto): string => {
  const params = new URLSearchParams();
  params.set('page', String(query.page ?? 1));
  params.set('limit', String(query.limit ?? 10));

  const searchValue = query.search?.trim();
  if (searchValue) {
    params.set('search', searchValue);
  }

  return params.toString();
};

const getFallbackMeta = (query: QueryLearnersDto): LearnersPaginationMeta => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  return {
    total: 0,
    page,
    limit,
    totalPages: 1,
  };
};

export const learnerService = {
  queryLearners: async (
    query: QueryLearnersDto,
  ): Promise<ResponseDto<LearnersListDto>> => {
    const queryParams = buildLearnerQueryParams(query);
    const response = (await apiClient.get<LearnerDto[]>(
      `/user/learner?${queryParams}`,
    )) as RawLearnersQueryResponse;

    ensureSuccess(response);

    return {
      success: true,
      data: {
        items: response.data ?? [],
        meta: response.meta ?? getFallbackMeta(query),
      },
    };
  },

  createLearner: async (
    data: CreateLearnerDto,
  ): Promise<UnifiedApiResponse<LearnerDto>> => {
    const response = await apiClient.post<LearnerDto>('/user/learner', data);
    ensureSuccess(response);

    return {
      success: true,
      data: response.data as LearnerDto,
    };
  },

  updateLearner: async (
    id: string,
    data: UpdateLearnerDto,
  ): Promise<UnifiedApiResponse<LearnerDto>> => {
    const response = await apiClient.patch<LearnerDto>(`/user/learner/${id}`, data);
    ensureSuccess(response);

    return {
      success: true,
      data: response.data as LearnerDto,
    };
  },

  deleteLearner: async (id: string): Promise<UnifiedApiResponse<null>> => {
    const response = await apiClient.delete<void>(`/user/learner/${id}`);
    ensureSuccess(response);

    return {
      success: true,
      data: null,
    };
  },
};
