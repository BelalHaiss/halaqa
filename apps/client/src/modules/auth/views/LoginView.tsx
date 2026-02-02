import { useState } from 'react';
import { useAuthViewModel } from '../viewmodels/auth.viewmodel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView = ({ onLoginSuccess }: LoginViewProps) => {
  const { isLoading, error, login } = useAuthViewModel();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await login({ usernameOrEmail: email, password });

    if (result.success) {
      onLoginSuccess();
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>نظام إدارة الحلقات</CardTitle>
          <CardDescription>قم بتسجيل الدخول للمتابعة</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className='space-y-2'>
              <Label htmlFor='email'>البريد الإلكتروني</Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='admin@halaqa.com'
                required
                disabled={isLoading}
                dir='ltr'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>كلمة المرور</Label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='******'
                required
                disabled={isLoading}
                dir='ltr'
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>

            <div className='text-xs text-center text-gray-500 dark:text-gray-400 mt-4'>
              <p className='mb-1'>حسابات تجريبية:</p>
              <p>مدير: admin@halaqa.com / 123456</p>
              <p>مشرف: mod@halaqa.com / 123456</p>
              <p>معلم: tutor1@halaqa.com / 123456</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
