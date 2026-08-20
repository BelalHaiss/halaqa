import { GroupBillingType } from '@halaqa/shared';
import { Badge } from '@/components/ui/badge';

type BillingTypeBadgeProps = {
  billingType: GroupBillingType;
};

const billingTypeConfig: Record<
  GroupBillingType,
  { label: string; variant: 'solid' | 'outline'; color: 'success' | 'muted' }
> = {
  FREE: { label: 'مجاني', variant: 'outline', color: 'muted' },
  MONTHLY: { label: 'شهري', variant: 'solid', color: 'success' },
};

export function BillingTypeBadge({ billingType }: BillingTypeBadgeProps) {
  const config = billingTypeConfig[billingType];
  return (
    <Badge variant={config.variant} color={config.color}>
      {config.label}
    </Badge>
  );
}
