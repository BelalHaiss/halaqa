import type {
  CreateManualTransactionDto,
  FinancialTransactionSummaryDto,
  QueryTransactionsDto,
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

export const transactionService = {
  queryTransactions: async (
    query: QueryTransactionsDto
  ): Promise<UnifiedApiResponse<FinancialTransactionSummaryDto[]>> => {
    const queryString = buildQueryParams({
      page: query.page,
      limit: query.limit,
      fromDate: query.fromDate,
      toDate: query.toDate,
      type: query.type,
      entityType: query.entityType,
      currency: query.currency,
      labelId: query.labelId,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    return apiClient.get<FinancialTransactionSummaryDto[]>(`/payments/transactions?${queryString}`);
  },

  createManualTransaction: async (
    dto: CreateManualTransactionDto
  ): Promise<UnifiedApiResponse<FinancialTransactionSummaryDto>> => {
    return apiClient.post<FinancialTransactionSummaryDto>('/payments/transactions', dto);
  },

  deleteTransaction: async (id: string): Promise<UnifiedApiResponse<void>> => {
    return apiClient.delete<void>(`/payments/transactions/${id}`);
  },
} as const;
