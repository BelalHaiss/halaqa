import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { storageService } from "@/services";
import authService from "../services/auth.service";
import { LoginCredentialsDto } from "@halaqa/shared";
import { useApp } from "@/contexts/AppContext";

export const useAuthViewModel = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentialsDto) =>
      authService.login(credentials),
    onSuccess: (response) => {
      if (response.success && response.data) {
        const { user, accessToken } = response.data;

        // Save to storage
        storageService.saveToken(accessToken);
        storageService.saveUser({
          ...user,
          username: user.username ?? "",
        });

        // Update context
        setUser({
          ...user,
          username: user.username ?? "",
        });

        // Show success message
        toast.success(`مرحباً، ${user.name}`);

        // Navigate to home or dashboard
        navigate("/");
      } else {
        // Handle unsuccessful response
        const errorMessage =
          response.error || response.message || "فشل تسجيل الدخول";
        toast.error(errorMessage);
      }
    },
    onError: (error: Error) => {
      // Handle error
      const errorMessage = error.message || "حدث خطأ غير متوقع";
      toast.error(errorMessage);
    },
  });

  const logout = async () => {
    try {
      await authService.logout();
      storageService.clearAll();
      setUser(null);

      toast.success("تم تسجيل الخروج بنجاح");
      navigate("/login");
    } catch (error: any) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
      // Still logout locally even if API fails
      storageService.clearAll();
      setUser(null);
      navigate("/login");
    }
  };

  return {
    // Login mutation state
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    isError: loginMutation.isError,
    isSuccess: loginMutation.isSuccess,

    // Other functions
    logout,
  };
};
