import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { roleColorMap } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, Clock, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import {
  ChangePasswordDto,
  getTimezoneLabel,
  TIMEZONES,
  UpdateProfileDto,
  UserAuthType
} from '@halaqa/shared';
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordFormData,
  type ProfileFormData
} from '../schema/profile.schema';
import { FormField } from '@/components/forms/form-field';
import { profileService } from '../services/profile.service';

const roleLabels: Record<string, string> = {
  ADMIN: 'مدير',
  MODERATOR: 'مشرف',
  TUTOR: 'معلم',
  STUDENT: 'طالب'
};

export function ProfileView() {
  const { user, setUser } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [pendingProfileData, setPendingProfileData] =
    useState<ProfileFormData | null>(null);
  const [pendingPasswordData, setPendingPasswordData] =
    useState<ChangePasswordFormData | null>(null);
  const [confirmProfileOpen, setConfirmProfileOpen] = useState(false);
  const [confirmPasswordOpen, setConfirmPasswordOpen] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      timezone: user?.timezone || 'Africa/Cairo'
    }
  });

  // Password form
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const updateProfileMutation = useApiMutation<UpdateProfileDto, UserAuthType>({
    mutationFn: async (data) => {
      if (!user) {
        throw new Error('المستخدم غير متوفر');
      }

      return profileService.updateProfile(user.id, data);
    },
    onSuccess: (response) => {
      if (!user || !response.data) {
        return;
      }

      setUser({
        ...user,
        username: response.data.username || '',
        timezone: response.data.timezone
      });
      toast.success('تم تحديث الملف الشخصي بنجاح');
      setConfirmProfileOpen(false);
      setPendingProfileData(null);
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء تحديث الملف الشخصي');
    }
  });

  const changePasswordMutation = useApiMutation<ChangePasswordDto, void>({
    mutationFn: async (data) => {
      if (!user) {
        throw new Error('المستخدم غير متوفر');
      }

      return profileService.changePassword(user.id, data);
    },
    onSuccess: () => {
      toast.success('تم تغيير كلمة المرور بنجاح');
      passwordForm.reset();
      setConfirmPasswordOpen(false);
      setPendingPasswordData(null);
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    }
  });

  if (!user) return null;

  const handleProfileUpdate = (data: ProfileFormData) => {
    setPendingProfileData(data);
    setConfirmProfileOpen(true);
  };

  const handlePasswordChange = (data: ChangePasswordFormData) => {
    setPendingPasswordData(data);
    setConfirmPasswordOpen(true);
  };

  return (
    <div className='max-w-4xl mx-auto'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1'>
          الإعدادات الشخصية
        </h1>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          إدارة معلومات حسابك وإعداداتك
        </p>
      </div>

      {/* User Info Card */}
      <Card className='mb-6'>
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
                <Badge variant='soft' color={roleColorMap[user.role]}>
                  <Shield className='w-3 h-3' />
                  {roleLabels[user.role]}
                </Badge>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  •
                </span>
                <span className='text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1'>
                  <Clock className='w-3 h-3' />
                  {getTimezoneLabel(user.timezone || 'Africa/Cairo')}
                </span>
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
                قم بتحديث اسم المستخدم والمنطقة الزمنية الخاصة بك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit(handleProfileUpdate)}
                className='space-y-4'
              >
                {/* Name (Read-only) */}
                <div className='space-y-2'>
                  <Label htmlFor='name'>الاسم</Label>
                  <Input
                    id='name'
                    value={user.name}
                    disabled
                    className='bg-gray-50 dark:bg-gray-900'
                  />
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    لا يمكن تغيير الاسم. اتصل بالمسؤول لتغييره.
                  </p>
                </div>

                {/* Username */}
                <FormField
                  control={profileForm.control}
                  name='username'
                  label='اسم المستخدم'
                  type='text'
                  placeholder='username'
                  disabled={updateProfileMutation.isPending}
                  inputClassName='text-left'
                />

                {/* Timezone */}
                <div className='space-y-2'>
                  <Label htmlFor='timezone' className='flex items-center'>
                    المنطقة الزمنية
                  </Label>
                  <Select
                    value={profileForm.watch('timezone')}
                    onValueChange={(value) =>
                      profileForm.setValue('timezone', value)
                    }
                    disabled={updateProfileMutation.isPending}
                  >
                    <SelectTrigger id='timezone'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          <div className='flex items-center justify-between w-full'>
                            <span>{tz.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {profileForm.formState.errors.timezone && (
                    <p className='text-xs text-red-500'>
                      {profileForm.formState.errors.timezone.message}
                    </p>
                  )}
                </div>

                {/* Role (Read-only) */}
                <div className='space-y-2'>
                  <Label htmlFor='role'>الدور</Label>
                  <Input
                    id='role'
                    value={roleLabels[user.role]}
                    disabled
                    className='bg-gray-50 dark:bg-gray-900'
                  />
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    لا يمكن تغيير الدور. اتصل بالمسؤول لتغييره.
                  </p>
                </div>

                <Button
                  type='submit'
                  className='w-full bg-emerald-600 hover:bg-emerald-700'
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending
                    ? 'جاري الحفظ...'
                    : 'حفظ التغييرات'}
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
                onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
                className='space-y-4'
              >
                {/* Current Password */}
                <FormField
                  control={passwordForm.control}
                  name='currentPassword'
                  label='كلمة المرور الحالية'
                  type='password'
                  placeholder='••••••••'
                  disabled={changePasswordMutation.isPending}
                />

                {/* New Password */}
                <FormField
                  control={passwordForm.control}
                  name='newPassword'
                  label='كلمة المرور الجديدة'
                  type='password'
                  placeholder='••••••••'
                  disabled={changePasswordMutation.isPending}
                />

                {/* Confirm Password */}
                <FormField
                  control={passwordForm.control}
                  name='confirmPassword'
                  label='تأكيد كلمة المرور الجديدة'
                  type='password'
                  placeholder='••••••••'
                  disabled={changePasswordMutation.isPending}
                />

                <div className='pt-2'>
                  <Button
                    type='submit'
                    className='w-full bg-emerald-600 hover:bg-emerald-700'
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending
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
        open={confirmProfileOpen}
        onOpenChange={setConfirmProfileOpen}
        title='تأكيد تحديث الملف الشخصي'
        description='هل تريد حفظ التغييرات على ملفك الشخصي؟'
        confirmText='حفظ'
        cancelText='إلغاء'
        onConfirm={async () => {
          if (!pendingProfileData) {
            return;
          }

          await updateProfileMutation.mutateAsync(pendingProfileData);
        }}
        variant='solid'
        color='primary'
      />

      <ConfirmDialog
        open={confirmPasswordOpen}
        onOpenChange={setConfirmPasswordOpen}
        title='تأكيد تغيير كلمة المرور'
        description='هل تريد تحديث كلمة المرور الآن؟'
        confirmText='تحديث'
        cancelText='إلغاء'
        onConfirm={async () => {
          if (!pendingPasswordData) {
            return;
          }

          await changePasswordMutation.mutateAsync({
            currentPassword: pendingPasswordData.currentPassword,
            newPassword: pendingPasswordData.newPassword
          });
        }}
        variant='solid'
        color='danger'
      />
    </div>
  );
}
