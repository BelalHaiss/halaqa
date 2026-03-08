import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';
import { CalendarDays, Loader2, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginCredentialsDto } from '@halaqa/shared';
import { useApp } from '@/contexts/AppContext';
import { AppLogo } from '@/components/AppLogo';
import { FormError } from '@/components/forms/form-error';
import { FormField } from '@/components/forms/form-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { loginSchema } from '@halaqa/shared';
import { useAuthViewModel } from '../viewmodels/auth.viewmodel';

export const LoginView = () => {
  const { user } = useApp();
  const { login, isLoading, error, isError } = useAuthViewModel();

  const highlights = [
    {
      title: 'إدارة الحلقات',
      description: 'عرض المجموعات وتنظيم جدول كل حلقة بسهولة.',
      icon: Users,
    },
    {
      title: 'جلسات يومية',
      description: 'متابعة الحضور والتحديثات اللحظية لكل جلسة.',
      icon: CalendarDays,
    },
    {
      title: 'بيئة موثوقة',
      description: 'صلاحيات واضحة وحماية للحسابات والبيانات.',
      icon: ShieldCheck,
    },
  ];

  if (user) {
    return <Navigate to='/' replace />;
  }

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid },
  } = useForm<LoginCredentialsDto>({
    resolver: zodResolver(loginSchema()),
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = (data: LoginCredentialsDto) => login(data);
  const canSubmit = isDirty && isValid;

  return (
    <div dir='rtl' className='min-h-screen bg-muted/30 p-4 sm:p-6'>
      <div className='mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center gap-6 lg:flex-row'>
        <Card className='w-full max-w-md border-border/80 bg-muted/30 shadow-xl backdrop-blur lg:w-96'>
          <CardHeader className='space-y-4 text-center'>
            <AppLogo className='mx-auto' />
            <div className='space-y-2'>
              <Badge variant='outline' color='muted' className='mx-auto w-fit'>
                تسجيل الدخول
              </Badge>
              <CardTitle as='h2' size='xl'>
                أهلاً بعودتك
              </CardTitle>
              <CardDescription>أدخل بياناتك للوصول إلى لوحة التحكم</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
              {isError && error ? <FormError error={{ message: error.message }} /> : null}
              <div className='space-y-4 rounded-xl border border-border bg-background/80 p-4'>
                <FormField
                  control={control}
                  name='username'
                  label='اسم المستخدم'
                  type='text'
                  placeholder='admin'
                  disabled={isLoading}
                  id='username'
                  inputClassName='text-left'
                />

                <FormField
                  control={control}
                  name='password'
                  label='كلمة المرور'
                  type='password'
                  placeholder='********'
                  disabled={isLoading}
                  id='password'
                  inputClassName='text-left'
                />
              </div>

              <Button
                type='submit'
                className='w-full gap-2 shadow-sm'
                size='lg'
                disabled={isLoading || !canSubmit}
              >
                {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>

              <Typography as='div' size='sm' className='text-center text-muted-foreground'>
                تسجيل سريع وآمن للوصول إلى جميع أدوات الإدارة.
              </Typography>
            </form>
          </CardContent>
        </Card>

        <Card className='hidden flex-1 border-primary/25 bg-primary/5 lg:flex lg:min-h-96 lg:flex-col lg:justify-between'>
          <CardHeader className='space-y-5'>
            <Badge variant='soft' color='primary' className='w-fit gap-1'>
              <Sparkles className='h-3.5 w-3.5' />
              منصة إدارة الحلقات
            </Badge>
            <div className='space-y-3'>
              <CardTitle as='h1' size='2xl'>
                نظام إدارة الحلقات
              </CardTitle>
              <CardDescription className='max-w-xl'>
                تجربة إدارة حديثة للحلقات القرآنية مع تنظيم الجلسات والحضور في واجهة واضحة وسريعة.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className='grid grid-cols-3 gap-3'>
            {highlights.map((item) => (
              <div
                key={item.title}
                className='flex min-h-44 flex-col justify-between rounded-xl border border-primary/20 bg-card/75 p-5'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                  <item.icon className='h-4 w-4' />
                </div>
                <div className='space-y-1'>
                  <Typography as='div' size='md' weight='semibold'>
                    {item.title}
                  </Typography>
                  <Typography as='div' size='sm' className='text-muted-foreground'>
                    {item.description}
                  </Typography>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
