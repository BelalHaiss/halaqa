import { GroupStatus } from '@halaqa/shared';

export const dayNames = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
] as const;

export const STATUS_LABELS: Record<GroupStatus, string> = {
  ACTIVE: 'الحلقات النشطة',
  INACTIVE: 'الحلقات غير النشطة',
  COMPLETED: 'الحلقات المكتملة',
};

export const STATUS_ORDER: GroupStatus[] = ['ACTIVE', 'INACTIVE', 'COMPLETED'];
