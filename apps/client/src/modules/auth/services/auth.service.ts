// import { apiClient } from '@/services';
import { User, LoginCredentials, ApiResponse } from '@halaqa/shared';

export class AuthService {
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    // For now, using mock data. Replace with actual API call
    // return apiClient.post('/auth/login', credentials);

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUsers = [
          {
            id: '1',
            name: 'أحمد محمود',
            email: 'admin@halaqa.com',
            role: 'admin' as const
          },
          {
            id: '2',
            name: 'فاطمة أحمد',
            email: 'mod@halaqa.com',
            role: 'moderator' as const
          },
          {
            id: '3',
            name: 'محمد علي',
            email: 'tutor1@halaqa.com',
            role: 'tutor' as const
          },
          {
            id: '4',
            name: 'خديجة حسن',
            email: 'tutor2@halaqa.com',
            role: 'tutor' as const
          }
        ];

        const user = mockUsers.find((u) => u.email === credentials.email);

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
