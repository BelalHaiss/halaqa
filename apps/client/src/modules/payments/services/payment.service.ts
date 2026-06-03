import {
  ApplyLearnerPaymentDto,
  CreateLearnerPaymentDto,
  CreateTutorPaymentDto,
  GroupSelectOptionDto,
  GroupTutorSummaryDto,
  LearnerPaymentSummaryDto,
  PreviewTutorPaymentDto,
  QueryLearnerPaymentsDto,
  QueryTutorPaymentsDto,
  TutorLatestAllowedDateDto,
  TutorPaymentPreviewDto,
  TutorPaymentSummaryDto,
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
  queryTutorOptions: async (): Promise<UnifiedApiResponse<GroupTutorSummaryDto[]>> => {
    return apiClient.get<GroupTutorSummaryDto[]>('/groups/tutors');
  },

  queryGroupOptions: async (): Promise<UnifiedApiResponse<GroupSelectOptionDto[]>> => {
    return apiClient.get<GroupSelectOptionDto[]>('/groups/options');
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

  applyLearnerPayment: async (
    id: string,
    data: ApplyLearnerPaymentDto
  ): Promise<UnifiedApiResponse<LearnerPaymentSummaryDto>> => {
    return apiClient.post<LearnerPaymentSummaryDto>(`/payments/learner/${id}/pay`, data);
  },

  deleteLearnerPayment: async (id: string): Promise<UnifiedApiResponse<null>> => {
    await apiClient.delete<void>(`/payments/learner/${id}`);
    return { success: true, data: null };
  },

  queryTutorPayments: async (
    query: QueryTutorPaymentsDto
  ): Promise<UnifiedApiResponse<TutorPaymentSummaryDto[]>> => {
    const queryString = buildQueryParams({
      page: query.page,
      limit: query.limit,
      tutorId: query.tutorId,
      fromDate: query.fromDate,
      toDate: query.toDate,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      currency: query.currency,
    });

    return apiClient.get<TutorPaymentSummaryDto[]>(`/payments/tutor?${queryString}`);
  },

  getTutorPaymentDetails: async (
    id: string
  ): Promise<UnifiedApiResponse<TutorPaymentSummaryDto>> => {
    return apiClient.get<TutorPaymentSummaryDto>(`/payments/tutor/${id}`);
  },

  getTutorLatestAllowedDate: async (
    tutorId: string
  ): Promise<UnifiedApiResponse<TutorLatestAllowedDateDto>> => {
    return apiClient.get<TutorLatestAllowedDateDto>(
      `/payments/tutor/${tutorId}/latest-allowed-date`
    );
  },

  previewTutorPayment: async (
    data: PreviewTutorPaymentDto
  ): Promise<UnifiedApiResponse<TutorPaymentPreviewDto>> => {
    return apiClient.post<TutorPaymentPreviewDto>('/payments/tutor/preview', data);
  },

  createTutorPayment: async (
    data: CreateTutorPaymentDto
  ): Promise<UnifiedApiResponse<TutorPaymentSummaryDto[]>> => {
    return apiClient.post<TutorPaymentSummaryDto[]>('/payments/tutor', data);
  },

  deleteTutorPayment: async (id: string): Promise<UnifiedApiResponse<null>> => {
    await apiClient.delete<void>(`/payments/tutor/${id}`);
    return { success: true, data: null };
  },
};
