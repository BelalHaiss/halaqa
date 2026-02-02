import { Badge } from './badge';
import { GroupStatus, SessionStatus, AttendanceStatus } from '@halaqa/shared';

export type StatusType = GroupStatus | SessionStatus | AttendanceStatus;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className: string;
  }
> = {
  ACTIVE: {
    label: 'نشط',
    variant: 'default' as const,
    className:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
  },
  INACTIVE: {
    label: 'غير نشط',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  },
  COMPLETED: {
    label: 'مكتمل',
    variant: 'outline' as const,
    className:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
  },
  SCHEDULED: {
    label: 'مجدولة',
    variant: 'default' as const,
    className:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
  },
  CANCELED: {
    label: 'ملغية',
    variant: 'destructive' as const,
    className:
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
  },
  ATTENDED: {
    label: 'حضر',
    variant: 'default' as const,
    className:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
  },
  MISSED: {
    label: 'غاب',
    variant: 'destructive' as const,
    className:
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
  },
  EXCUSED: {
    label: 'عذر',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
};

export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  );
};
