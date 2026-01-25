import { User } from '@halaqa/shared';

class StorageService {
  private readonly USER_KEY = 'halaqa_user';
  private readonly TOKEN_KEY = 'halaqa_token';

  // User
  saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Token
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Clear all
  clearAll(): void {
    this.removeUser();
    this.removeToken();
  }
}

export const storageService = new StorageService();
export default storageService;
