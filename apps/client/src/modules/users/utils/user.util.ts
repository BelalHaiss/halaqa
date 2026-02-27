import { UserRole } from '@halaqa/shared';
import {
  Shield,
  UserCog,
  GraduationCap,
  BookOpen,
  type LucideIcon
} from 'lucide-react';
import type { InteractiveColor } from '@/components/ui/interactive-variants';

export interface RoleConfig {
  label: string;
  icon: LucideIcon;
  color: InteractiveColor;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'مدير',
  MODERATOR: 'مشرف',
  TUTOR: 'معلم',
  STUDENT: 'طالب'
};

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  ADMIN: {
    label: ROLE_LABELS.ADMIN,
    icon: Shield,
    color: 'purple'
  },
  MODERATOR: {
    label: ROLE_LABELS.MODERATOR,
    icon: UserCog,
    color: 'blue'
  },
  TUTOR: {
    label: ROLE_LABELS.TUTOR,
    icon: GraduationCap,
    color: 'emerald'
  },
  STUDENT: {
    label: ROLE_LABELS.STUDENT,
    icon: BookOpen,
    color: 'teal'
  }
};

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role];
}
export function getRoleIcon(role: UserRole): LucideIcon {
  return ROLE_CONFIG[role].icon;
}

export function getRoleColor(role: UserRole): InteractiveColor {
  return ROLE_CONFIG[role].color;
}
