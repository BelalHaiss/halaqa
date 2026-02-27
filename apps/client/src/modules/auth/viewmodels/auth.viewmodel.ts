import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthResponseDto, LoginCredentialsDto } from '@halaqa/shared';
import { useApp } from '@/contexts/AppContext';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import { storageService } from '@/services';
import authService from '../services/auth.service';

export const useAuthViewModel = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();

  const loginMutation = useApiMutation<LoginCredentialsDto, AuthResponseDto>({
    mutationFn: (credentials: LoginCredentialsDto) => authService.login(credentials),
    onSuccess: (response) => {
      if (response.success && response.data) {
        const { user, accessToken } = response.data;

        // Save to storage
        storageService.saveToken(accessToken);
        const userWithUsername = {
          ...user,
          username: user.username ?? '',
        };

        storageService.saveUser(userWithUsername);

        // Update context
        setUser(userWithUsername);

        // Show success message
        toast.success(`مرحباً، ${user.name}`);

        // Navigate to home or dashboard
        navigate('/');
      }
    },
  });

  const logout = async () => {
    try {
      await authService.logout();
      storageService.clearAll();
      setUser(null);

      toast.success('تم تسجيل الخروج بنجاح');
      navigate('/login');
    } catch {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
      // Still logout locally even if API fails
      storageService.clearAll();
      setUser(null);
      navigate('/login');
    }
  };

  return {
    // Login mutation state
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    isError: loginMutation.isError,
    isSuccess: loginMutation.isSuccess,

    // Other functions
    logout,
  };
};
