// ============================================================================
// DTOs (Public Types)
// ============================================================================

export type UserRole = 'ADMIN' | 'MODERATOR' | 'TUTOR' | 'STUDENT';

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

export interface LoginCredentialsDto {
  usernameOrEmail: string;
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

export interface AuthResponseDto {
  user: User;
  token: string;
}

export interface UserFilterDto {
  role?: UserRole;
  search?: string;
}
