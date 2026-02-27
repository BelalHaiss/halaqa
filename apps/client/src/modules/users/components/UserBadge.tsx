import { UserRole } from '@halaqa/shared';
import { Badge } from '@/components/ui/badge';
import { ROLE_CONFIG } from '../utils/user.util';
import type { InteractiveVariant } from '@/components/ui/interactive-variants';

interface UserBadgeProps {
  role: UserRole;
  size?: 'sm' | 'default';
  variant?: InteractiveVariant;
  showIcon?: boolean;
  showLabel?: boolean;
}

export function UserBadge({
  role,
  size = 'default',
  variant = 'soft',
  showIcon = true,
  showLabel = true
}: UserBadgeProps) {
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;

  return (
    <Badge
      variant={variant}
      color={config.color}
      className={size === 'sm' ? 'text-xs' : ''}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
      {showLabel && config.label}
    </Badge>
  );
}
