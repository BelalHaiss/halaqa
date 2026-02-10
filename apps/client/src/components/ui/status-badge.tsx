import { GroupStatus, SessionStatus, AttendanceStatus } from '@halaqa/shared';
import { Badge } from '@/components/ui/badge';

export type StatusType = GroupStatus | SessionStatus | AttendanceStatus;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { label: string; variant: 'solid' | 'ghost' | 'outline' | 'soft'; color: 'primary' | 'success' | 'danger' | 'muted' }
> = {
  ACTIVE: { label: 'نشط', variant: 'soft', color: 'success' },
  INACTIVE: { label: 'غير نشط', variant: 'soft', color: 'muted' },
  COMPLETED: { label: 'مكتمل', variant: 'soft', color: 'primary' },
  SCHEDULED: { label: 'مجدولة', variant: 'soft', color: 'primary' },
  CANCELED: { label: 'ملغية', variant: 'soft', color: 'danger' },
  ATTENDED: { label: 'حضر', variant: 'soft', color: 'success' },
  MISSED: { label: 'غاب', variant: 'soft', color: 'danger' },
  EXCUSED: { label: 'عذر', variant: 'soft', color: 'muted' }
};

export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      color={config.color}
      className={className}
    >
      {config.label}
    </Badge>
  );
};
