// ============================================================================
// DTOs (Public Types)
// ============================================================================

import { ISODateString } from './types/api.types';

export type UserRole = 'ADMIN' | 'MODERATOR' | 'TUTOR' | 'STUDENT';
export type UserAuthRole = Exclude<UserRole, 'STUDENT'>;
export type AuthenticatedUserRole = UserRole;

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserAuthType;
}

export type UserAuthType = {
  id: string;
  phone: string | null;
  name: string;
  role: AuthenticatedUserRole;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  timezone: string;
};

export interface LoginCredentialsDto {
  phone: string;
  password: string;
}

export interface CreateUserDto {
  phone: string;
  name: string;
  role: UserRole;
  timezone: string;
  password: string;
}

export interface UpdateUserDto {
  id: string;
  phone?: string;
  name?: string;
  role?: UserRole;
  timezone?: string;
  password?: string;
}

export interface StaffUserDto {
  id: string;
  phone: string;
  name: string;
  role: UserAuthRole;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffUserDto {
  phone: string;
  name: string;
  role: UserAuthRole;
  password: string;
  timezone: string;
}

export interface UpdateStaffUserDto {
  phone?: string;
  name?: string;
  role?: UserAuthRole;
  timezone?: string;
}

export type StaffUsersResponseDto = StaffUserDto[];

export interface UpdateOwnProfileDto {
  name: string;
  phone: string;
  timezone: string;
}

export interface ChangeOwnPasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SetLearnerCredentialsDto {
  phone: string;
  password: string;
}

export interface UserFilterDto {
  role?: UserRole;
  search?: string;
}

export type UserWithOptionalCredentials = {
  id: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  password?: string | null;
  timezone?: string;
};

export type LearnerUser = UserWithOptionalCredentials & {
  role: 'STUDENT';
  phone?: null;
  password?: null;
};

export type NonLearnerUserWithCredentials = UserWithOptionalCredentials & {
  role: UserAuthRole;
  phone: string;
  password: string;
};

export const isLearnerUser = (user: UserWithOptionalCredentials): user is LearnerUser => {
  return (
    user.role === 'STUDENT' &&
    (user.phone === null || user.phone === undefined) &&
    (user.password === null || user.password === undefined)
  );
};

export const isNonLearnerUserWithCredentials = (
  user: UserWithOptionalCredentials
): user is NonLearnerUserWithCredentials => {
  return (
    user.role !== 'STUDENT' &&
    typeof user.phone === 'string' &&
    user.phone.length > 0 &&
    typeof user.password === 'string' &&
    user.password.length > 0
  );
};
