// import { apiClient } from '@/services';
import { User, LoginCredentialsDto, ApiResponse } from '@halaqa/shared';

export class AuthService {
  async login(
    credentials: LoginCredentialsDto
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    // For now, using mock data. Replace with actual API call
    // return apiClient.post('/auth/login', credentials);

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUsers: User[] = [
          {
            id: '1',
            username: 'admin',
            name: 'أحمد محمود',
            email: 'admin@halaqa.com',
            role: 'ADMIN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            username: 'fatima_mod',
            name: 'فاطمة أحمد',
            email: 'mod@halaqa.com',
            role: 'MODERATOR',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '3',
            username: 'mohamed_tutor',
            name: 'محمد علي',
            email: 'tutor1@halaqa.com',
            role: 'TUTOR',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '4',
            username: 'khadija_tutor',
            name: 'خديجة حسن',
            email: 'tutor2@halaqa.com',
            role: 'TUTOR',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        const user = mockUsers.find(
          (u) =>
            u.email === credentials.usernameOrEmail ||
            u.username === credentials.usernameOrEmail
        );

        if (user && credentials.password === '123456') {
          resolve({
            success: true,
            data: {
              user,
              token: 'mock_token_' + user.id
            }
          });
        } else {
          resolve({
            success: false,
            error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          });
        }
      }, 500);
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    // return apiClient.post('/auth/logout');
    return Promise.resolve({ success: true });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    // return apiClient.get('/auth/me');
    return Promise.resolve({
      success: false,
      error: 'Not implemented'
    });
  }
}

export const authService = new AuthService();
