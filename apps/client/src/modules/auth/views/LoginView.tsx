import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthViewModel } from "../viewmodels/auth.viewmodel";
import { LoginFormData, loginSchema } from "../schema/login.schema";
import { FormField } from "@/components/forms/form-field";
import { FormError } from "@/components/forms/form-error";

export const LoginView = () => {
  const navigate = useNavigate();
  const { user } = useApp(); // Check if user is already authenticated
  const { login, isLoading, error, isError } = useAuthViewModel();

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Initialize React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onBlur",
  });

  // Form submission handler
  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        // Navigate to home after successful login
        navigate("/", { replace: true });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center mb-5">
          <CardTitle as="h2" size="2xl">
            نظام إدارة الحلقات
          </CardTitle>
          <CardDescription>قم بتسجيل الدخول للمتابعة</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Display API errors */}
            {isError && error && (
              <FormError error={{ message: error.message }} />
            )}

            {/* Username Field */}
            <FormField
              control={control}
              name="username"
              label="اسم المستخدم"
              type="text"
              placeholder="admin"
              disabled={isLoading}
              id="username"
              inputClassName="text-left"
            />

            {/* Password Field */}
            <FormField
              control={control}
              name="password"
              label="كلمة المرور"
              type="password"
              placeholder="********"
              disabled={isLoading}
              id="password"
              inputClassName="text-left"
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full my-5" disabled={isLoading}>
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
