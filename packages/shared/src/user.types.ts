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
