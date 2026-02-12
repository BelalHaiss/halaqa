import { useState } from "react";
import { useAuthViewModel } from "../viewmodels/auth.viewmodel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView = ({ onLoginSuccess }: LoginViewProps) => {
  const { isLoading, error, login } = useAuthViewModel();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await login({ usernameOrEmail: userName, password });

    if (result.success) {
      onLoginSuccess();
    }
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="soft" color="danger">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="userName">اسم المستخدم</Label>
              <Input
                id="userName"
                type="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="admin@halaqa.com"
                required
                disabled={isLoading}
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                required
                disabled={isLoading}
                dir="ltr"
              />
            </div>

            <Button type="submit" className="w-full my-5" disabled={isLoading}>
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
