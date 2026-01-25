import { Badge } from './badge';

export type StatusType = 'active' | 'inactive' | 'suspended' | 'completed';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  active: {
    label: 'نشط',
    variant: 'default' as const,
    className:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
  },
  inactive: {
    label: 'غير نشط',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  },
  suspended: {
    label: 'متوقف',
    variant: 'destructive' as const,
    className:
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
  },
  completed: {
    label: 'مكتمل',
    variant: 'outline' as const,
    className:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
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
