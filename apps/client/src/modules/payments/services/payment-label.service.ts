import type {
  QueryTransactionLabelsDto,
  TransactionLabelDto,
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

export const paymentLabelService = {
  searchLabels: async (
    query: QueryTransactionLabelsDto
  ): Promise<UnifiedApiResponse<TransactionLabelDto[]>> => {
    const queryString = buildQueryParams({
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
    return apiClient.get<TransactionLabelDto[]>(`/payments/labels?${queryString}`);
  },
} as const;
