// ============================================================================
// DTOs (Public Types)
// ============================================================================

import { ISODateString } from './types/api.types';

export type UserRole = 'ADMIN' | 'MODERATOR' | 'TUTOR' | 'STUDENT';
export type UserAuthRole = Exclude<UserRole, 'STUDENT'>;
export interface UserProfile {
  userId: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  notes?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserAuthType;
}

export type UserAuthType = {
  id: string;
  username: string | null;
  name: string;
  role: UserAuthRole;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  timezone: string;
};

export interface LoginCredentialsDto {
  username: string;
  password: string;
}

export interface CreateUserDto {
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  password: string;
  profile?: {
    phone?: string;
    whatsapp?: string;
    telegram?: string;
    notes?: string;
  };
}

export interface UpdateUserDto {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  password?: string;
}

export interface UpdateUserProfileDto {
  userId: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  notes?: string;
}

export interface UserFilterDto {
  role?: UserRole;
  search?: string;
}

export type UserWithOptionalCredentials = {
  id: string;
  name: string;
  role: UserRole;
  username?: string | null;
  password?: string | null;
  timezone?: string;
};

export type LearnerUser = UserWithOptionalCredentials & {
  role: 'STUDENT';
  username?: null;
  password?: null;
};

export type NonLearnerUserWithCredentials = UserWithOptionalCredentials & {
  role: UserAuthRole;
  username: string;
  password: string;
};

export const isLearnerUser = (
  user: UserWithOptionalCredentials,
): user is LearnerUser => {
  return (
    user.role === 'STUDENT' &&
    (user.username === null || user.username === undefined) &&
    (user.password === null || user.password === undefined)
  );
};

export const isNonLearnerUserWithCredentials = (
  user: UserWithOptionalCredentials,
): user is NonLearnerUserWithCredentials => {
  return (
    user.role !== 'STUDENT' &&
    typeof user.username === 'string' &&
    user.username.length > 0 &&
    typeof user.password === 'string' &&
    user.password.length > 0
  );
};
