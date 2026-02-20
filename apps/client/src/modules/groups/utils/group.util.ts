import { GroupStatus } from '@halaqa/shared';

interface GroupStatusConfig {
  label: string;
  variant: 'solid' | 'ghost' | 'outline' | 'soft';
  color: 'primary' | 'success' | 'danger' | 'muted';
}

export const GROUP_STATUS_CONFIG: Record<GroupStatus, GroupStatusConfig> = {
  ACTIVE: { label: 'نشط', variant: 'soft', color: 'success' },
  INACTIVE: { label: 'غير نشط', variant: 'soft', color: 'muted' },
  COMPLETED: { label: 'مكتمل', variant: 'soft', color: 'primary' }
};

export const getGroupStatusConfig = (
  status: GroupStatus
): GroupStatusConfig => {
  return GROUP_STATUS_CONFIG[status];
};
