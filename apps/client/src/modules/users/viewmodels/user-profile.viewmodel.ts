import { useState } from 'react';
import {
  ChangeOwnPasswordDto,
  UpdateOwnProfileDto,
  User,
  UserAuthType
} from '@halaqa/shared';
import { toast } from 'sonner';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import { userProfileService } from '../services/user-profile.service';

type UseUserProfileViewModelArgs = {
  user: User | null;
  setUser: (nextUser: User | null) => void;
  resetPasswordForm: () => void;
};

export const useUserProfileViewModel = ({
  user,
  setUser,
  resetPasswordForm
}: UseUserProfileViewModelArgs) => {
  const [pendingProfileData, setPendingProfileData] =
    useState<UpdateOwnProfileDto | null>(null);
  const [pendingPasswordData, setPendingPasswordData] =
    useState<ChangeOwnPasswordDto | null>(null);
  const [confirmProfileOpen, setConfirmProfileOpen] = useState(false);
  const [confirmPasswordOpen, setConfirmPasswordOpen] = useState(false);

  const updateProfileMutation = useApiMutation<
    UpdateOwnProfileDto,
    UserAuthType
  >({
    mutationFn: async (data) => {
      if (!user) {
        throw new Error('المستخدم غير متوفر');
      }

      return userProfileService.updateProfile(data);
    },
    onSuccess: (response) => {
      if (!response.data) {
        return;
      }

      if (user) {
        setUser({
          ...user,
          ...response.data,
          username: response.data.username ?? ''
        });
      }
      toast.success('تم تحديث الملف الشخصي بنجاح');
      setConfirmProfileOpen(false);
      setPendingProfileData(null);
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء تحديث الملف الشخصي');
    }
  });

  const changePasswordMutation = useApiMutation<ChangeOwnPasswordDto, void>({
    mutationFn: async (data) => {
      if (!user) {
        throw new Error('المستخدم غير متوفر');
      }

      return userProfileService.changePassword(data);
    },
    onSuccess: () => {
      toast.success('تم تغيير كلمة المرور بنجاح');
      resetPasswordForm();
      setConfirmPasswordOpen(false);
      setPendingPasswordData(null);
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    }
  });

  const requestProfileUpdate = (data: UpdateOwnProfileDto) => {
    setPendingProfileData(data);
    setConfirmProfileOpen(true);
  };

  const requestPasswordChange = (data: ChangeOwnPasswordDto) => {
    setPendingPasswordData(data);
    setConfirmPasswordOpen(true);
  };

  const confirmProfileUpdate = async () => {
    if (!pendingProfileData) {
      return;
    }

    await updateProfileMutation.mutateAsync(pendingProfileData);
  };

  const confirmPasswordChange = async () => {
    if (!pendingPasswordData) {
      return;
    }

    await changePasswordMutation.mutateAsync(pendingPasswordData);
  };

  return {
    confirmProfileOpen,
    setConfirmProfileOpen,
    confirmPasswordOpen,
    setConfirmPasswordOpen,
    requestProfileUpdate,
    requestPasswordChange,
    confirmProfileUpdate,
    confirmPasswordChange,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending
  };
};
