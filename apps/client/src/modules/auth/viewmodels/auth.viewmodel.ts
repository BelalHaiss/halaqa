import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { storageService } from '@/services';
import { User, LoginCredentials } from '@halaqa/shared';
import { toast } from 'sonner';

export const useAuthViewModel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);

      if (response.success && response.data) {
        const { user, token } = response.data;

        // Save to storage
        storageService.saveUser(user);
        storageService.saveToken(token);

        toast.success(`مرحباً، ${user.name}`);

        return { success: true, user };
      } else {
        setError(response.error || 'فشل تسجيل الدخول');
        toast.error(response.error || 'فشل تسجيل الدخول');
        return { success: false, error: response.error };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'حدث خطأ غير متوقع';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      storageService.clearAll();
      toast.success('تم تسجيل الخروج بنجاح');
      navigate('/login');
    } catch (err: any) {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const getCurrentUser = (): User | null => {
    return storageService.getUser();
  };

  return {
    isLoading,
    error,
    login,
    logout,
    getCurrentUser
  };
};
