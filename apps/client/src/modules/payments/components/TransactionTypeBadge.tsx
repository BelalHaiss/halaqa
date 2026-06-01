import { getTransactionTypeLabel, TransactionType } from '@halaqa/shared';
import { Badge } from '@/components/ui/badge';

type TransactionTypeBadgeProps = {
  type: TransactionType;
};

const typeColor: Record<TransactionType, 'success' | 'danger'> = {
  INCOME: 'success',
  EXPENSE: 'danger',
};

export function TransactionTypeBadge({ type }: TransactionTypeBadgeProps) {
  return <Badge color={typeColor[type]}>{getTransactionTypeLabel(type)}</Badge>;
}
