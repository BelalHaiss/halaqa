import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/back-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, AlertCircle } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  ChangeOwnPasswordDto,
  TIMEZONES,
  UpdateOwnProfileDto
} from '@halaqa/shared';
import {
  changeOwnPasswordSchema,
  updateOwnProfileSchema
} from '../schema/user-profile.schema';
import { FormField } from '@/components/forms/form-field';
import { TimezoneDisplay } from '@/components/ui/timezone-display';
import { UserBadge } from '../components/UserBadge';
import { useUserProfileViewModel } from '../viewmodels/user-profile.viewmodel';

export function UserProfileView() {
  const { user, setUser } = useApp();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const profileForm = useForm<UpdateOwnProfileDto>({
    resolver: zodResolver(updateOwnProfileSchema),
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      timezone: user?.timezone || 'Africa/Cairo'
    },
    mode: 'onTouched'
  });

  // Password form
  const passwordForm = useForm<ChangeOwnPasswordDto>({
    resolver: zodResolver(changeOwnPasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    mode: 'onTouched'
  });

  const vm = useUserProfileViewModel({
    user,
    setUser,
    resetPasswordForm: () => passwordForm.reset()
  });

  if (!user) return null;

  return (
    <div className='mx-auto max-w-4xl space-y-6'>
      <PageHeader
        title='الإعدادات الشخصية'
        description='إدارة معلومات حسابك وإعداداتك'
        actions={<BackButton />}
      />

      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center gap-4'>
            <Avatar size='lg'>
              <AvatarFallback className='text-2xl font-bold'>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
                {user.name}
              </h2>
              <div className='flex items-center gap-2 mt-1'>
                <UserBadge role={user.role} />
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  •
                </span>
                <TimezoneDisplay timezone={user.timezone} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='profile' className='gap-2'>
            <User className='w-4 h-4' />
            معلومات الحساب
          </TabsTrigger>
          <TabsTrigger value='security' className='gap-2'>
            <Lock className='w-4 h-4' />
            الأمان
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value='profile'>
          <Card>
            <CardHeader>
              <CardTitle>معلومات الحساب</CardTitle>
              <CardDescription>
                قم بتحديث بيانات الحساب الخاصة بك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit(vm.requestProfileUpdate)}
                className='space-y-4'
              >
                <FormField
                  control={profileForm.control}
                  name='name'
                  label='الاسم'
                  type='text'
                  placeholder='الاسم'
                  disabled={vm.isUpdatingProfile}
                />

                {/* Username */}
                <FormField
                  control={profileForm.control}
                  name='username'
                  label='اسم المستخدم'
                  type='text'
                  placeholder='username'
                  disabled={vm.isUpdatingProfile}
                  inputClassName='text-left'
                />

                <FormField
                  control={profileForm.control}
                  name='timezone'
                  label='المنطقة الزمنية'
                  type='select'
                  disabled={vm.isUpdatingProfile}
                  options={TIMEZONES}
                />

                <Button
                  type='submit'
                  className='w-full bg-emerald-600 hover:bg-emerald-700'
                  disabled={
                    vm.isUpdatingProfile ||
                    !profileForm.formState.isDirty ||
                    !profileForm.formState.isValid
                  }
                >
                  {vm.isUpdatingProfile ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value='security'>
          <Card>
            <CardHeader>
              <CardTitle>تغيير كلمة المرور</CardTitle>
              <CardDescription>
                قم بتحديث كلمة المرور الخاصة بك للحفاظ على أمان حسابك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className='mb-4'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  تأكد من استخدام كلمة مرور قوية تحتوي على حروف كبيرة وصغيرة
                  وأرقام.
                </AlertDescription>
              </Alert>

              <form
                onSubmit={passwordForm.handleSubmit(vm.requestPasswordChange)}
                className='space-y-4'
              >
                {/* Current Password */}
                <FormField
                  control={passwordForm.control}
                  name='currentPassword'
                  label='كلمة المرور الحالية'
                  type='password'
                  placeholder='••••••••'
                  disabled={vm.isChangingPassword}
                />

                {/* New Password */}
                <FormField
                  control={passwordForm.control}
                  name='newPassword'
                  label='كلمة المرور الجديدة'
                  type='password'
                  placeholder='••••••••'
                  disabled={vm.isChangingPassword}
                />

                {/* Confirm Password */}
                <FormField
                  control={passwordForm.control}
                  name='confirmPassword'
                  label='تأكيد كلمة المرور الجديدة'
                  type='password'
                  placeholder='••••••••'
                  disabled={vm.isChangingPassword}
                />

                <div className='pt-2'>
                  <Button
                    type='submit'
                    className='w-full bg-emerald-600 hover:bg-emerald-700'
                    disabled={
                      vm.isChangingPassword ||
                      !passwordForm.formState.isDirty ||
                      !passwordForm.formState.isValid
                    }
                  >
                    {vm.isChangingPassword
                      ? 'جاري التحديث...'
                      : 'تحديث كلمة المرور'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={vm.confirmProfileOpen}
        onOpenChange={vm.setConfirmProfileOpen}
        title='تأكيد تحديث الملف الشخصي'
        description='هل تريد حفظ التغييرات على ملفك الشخصي؟'
        confirmText='حفظ'
        cancelText='إلغاء'
        onConfirm={vm.confirmProfileUpdate}
      />

      <ConfirmDialog
        open={vm.confirmPasswordOpen}
        onOpenChange={vm.setConfirmPasswordOpen}
        title='تأكيد تغيير كلمة المرور'
        description='هل تريد تحديث كلمة المرور الآن؟'
        confirmText='تحديث'
        cancelText='إلغاء'
        intent='destructive'
        onConfirm={vm.confirmPasswordChange}
      />
    </div>
  );
}
