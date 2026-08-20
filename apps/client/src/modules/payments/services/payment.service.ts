import {
  CreateLearnerPaymentDto,
  GroupSelectOptionDto,
  LearnerPaymentSummaryDto,
  QueryLearnerPaymentsDto,
  UnifiedApiResponse,
} from '@halaqa/shared';
import { apiClient } from '@/services';

const buildQueryParams = (query: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  return params.toString();
};

export const paymentService = {
  queryGroupOptions: async (
    learnerId?: string,
    paidOnly?: boolean
  ): Promise<UnifiedApiResponse<GroupSelectOptionDto[]>> => {
    const queryString = buildQueryParams({ learnerId, paidOnly: paidOnly ? 'true' : undefined });
    return apiClient.get<GroupSelectOptionDto[]>(`/groups/options?${queryString}`);
  },

  queryLearnerPayments: async (
    query: QueryLearnerPaymentsDto
  ): Promise<UnifiedApiResponse<LearnerPaymentSummaryDto[]>> => {
    const queryString = buildQueryParams({
      page: query.page,
      limit: query.limit,
      status: query.status,
      fromDate: query.fromDate,
      toDate: query.toDate,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      currency: query.currency,
      learnerId: query.learnerId,
      groupId: query.groupId,
    });

    return apiClient.get<LearnerPaymentSummaryDto[]>(`/payments/learner?${queryString}`);
  },

  getLearnerPaymentDetails: async (
    id: string
  ): Promise<UnifiedApiResponse<LearnerPaymentSummaryDto>> => {
    return apiClient.get<LearnerPaymentSummaryDto>(`/payments/learner/${id}`);
  },

  createLearnerPayment: async (
    data: CreateLearnerPaymentDto
  ): Promise<UnifiedApiResponse<LearnerPaymentSummaryDto>> => {
    return apiClient.post<LearnerPaymentSummaryDto>('/payments/learner', data);
  },

  deleteLearnerPayment: async (id: string): Promise<UnifiedApiResponse<null>> => {
    await apiClient.delete<void>(`/payments/learner/${id}`);
    return { success: true, data: null };
  },
};
