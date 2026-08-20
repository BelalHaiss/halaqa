import { getPaymentStatusLabel, PaymentStatus } from '@halaqa/shared';
import { Badge } from '@/components/ui/badge';

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

const statusColor: Record<PaymentStatus, 'danger' | 'success'> = {
  UNPAID: 'danger',
  PAID: 'success',
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return <Badge color={statusColor[status]}>{getPaymentStatusLabel(status)}</Badge>;
}
