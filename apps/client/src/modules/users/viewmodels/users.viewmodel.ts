import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateStaffUserDto,
  DEFAULT_TIMEZONE,
  StaffUserDto,
  UpdateStaffUserDto,
  UserFormDto,
  UserAuthRole,
} from '@halaqa/shared';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryClient, queryKeys } from '@/lib/query-client';
import { userSchema } from '../schema/user.schema';
import { userService } from '../services/user.service';

const DEFAULT_FORM_VALUES = {
  name: '',
  username: '',
  role: 'TUTOR' as UserAuthRole,
  password: '',
  timezone: DEFAULT_TIMEZONE,
};

export function useUsersViewModel() {
  const { user } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUserDto | null>(null);
  const [pendingSavePayload, setPendingSavePayload] = useState<{
    mode: 'create' | 'update';
    data: CreateStaffUserDto | UpdateStaffUserDto;
  } | null>(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<StaffUserDto | null>(
    null,
  );

  const staffUsersQuery = useApiQuery<StaffUserDto[]>({
    queryKey: queryKeys.users.list({ scope: 'staff' }),
    queryFn: userService.getStaffUsers,
    enabled: Boolean(user),
  });

  const form = useForm<UserFormDto>({
    resolver: zodResolver(userSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const createMutation = useApiMutation<CreateStaffUserDto, StaffUserDto>({
    mutationFn: userService.createStaffUser,
    onSuccess: async () => {
      toast.success('تم إضافة المستخدم بنجاح');
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      setIsDialogOpen(false);
      setConfirmSaveOpen(false);
      setPendingSavePayload(null);
      form.reset(DEFAULT_FORM_VALUES);
    },
    onError: (error) => {
      toast.error(error.message || 'فشل إضافة المستخدم');
    },
  });

  const updateMutation = useApiMutation<
    { id: string; data: UpdateStaffUserDto },
    StaffUserDto
  >({
    mutationFn: ({ id, data }) => userService.updateStaffUser(id, data),
    onSuccess: async () => {
      toast.success('تم تعديل المستخدم بنجاح');
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      setIsDialogOpen(false);
      setConfirmSaveOpen(false);
      setPendingSavePayload(null);
      setEditingUser(null);
      form.reset(DEFAULT_FORM_VALUES);
    },
    onError: (error) => {
      toast.error(error.message || 'فشل تعديل المستخدم');
    },
  });

  const deleteMutation = useApiMutation<string, null>({
    mutationFn: userService.deleteStaffUser,
    onSuccess: async () => {
      toast.success('تم حذف المستخدم بنجاح');
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      setPendingDeleteUser(null);
    },
    onError: (error) => {
      toast.error(error.message || 'فشل حذف المستخدم');
    },
  });

  const isAdmin = user?.role === 'ADMIN';
  const isModerator = user?.role === 'MODERATOR';
  const availableRoles: UserAuthRole[] = isAdmin
    ? ['ADMIN', 'MODERATOR', 'TUTOR']
    : ['MODERATOR', 'TUTOR'];

  const canManageRole = (role: UserAuthRole) => {
    if (isAdmin) {
      return true;
    }
    if (isModerator) {
      return role === 'MODERATOR' || role === 'TUTOR';
    }
    return false;
  };

  const canManageUser = (targetUser: StaffUserDto) => {
    if (!user) {
      return false;
    }
    if (targetUser.id === user.id) {
      return false;
    }
    return canManageRole(targetUser.role);
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    form.reset({
      ...DEFAULT_FORM_VALUES,
      role: availableRoles.includes('TUTOR') ? 'TUTOR' : availableRoles[0],
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (targetUser: StaffUserDto) => {
    if (!canManageUser(targetUser)) {
      return;
    }
    setEditingUser(targetUser);
    form.reset({
      name: targetUser.name,
      username: targetUser.username,
      role: targetUser.role,
      password: '',
      timezone: targetUser.timezone || DEFAULT_TIMEZONE,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = form.handleSubmit((values) => {
    if (!editingUser && !values.password) {
      form.setError('password', {
        message: 'كلمة المرور مطلوبة عند إنشاء مستخدم جديد',
      });
      return;
    }

    if (editingUser) {
      const data: UpdateStaffUserDto = {
        name: values.name,
        username: values.username,
        role: values.role,
        timezone: values.timezone,
        ...(values.password ? { password: values.password } : {}),
      };

      setPendingSavePayload({
        mode: 'update',
        data,
      });
      setConfirmSaveOpen(true);
      return;
    }

    const data: CreateStaffUserDto = {
      name: values.name,
      username: values.username,
      role: values.role,
      password: values.password || '',
      timezone: values.timezone,
    };
    setPendingSavePayload({
      mode: 'create',
      data,
    });
    setConfirmSaveOpen(true);
  });

  const confirmSave = async () => {
    if (!pendingSavePayload) {
      return;
    }

    if (pendingSavePayload.mode === 'create') {
      await createMutation.mutateAsync(pendingSavePayload.data as CreateStaffUserDto);
      return;
    }

    if (!editingUser) {
      return;
    }
    await updateMutation.mutateAsync({
      id: editingUser.id,
      data: pendingSavePayload.data as UpdateStaffUserDto,
    });
  };

  const confirmDelete = async () => {
    if (!pendingDeleteUser) {
      return;
    }
    await deleteMutation.mutateAsync(pendingDeleteUser.id);
  };

  return {
    user,
    form,
    users: staffUsersQuery.data?.data ?? [],
    queryError: staffUsersQuery.error?.message ?? null,
    isLoading: staffUsersQuery.isPending,
    isRefreshing: staffUsersQuery.isFetching,

    isDialogOpen,
    setIsDialogOpen,
    editingUser,
    openCreateDialog,
    openEditDialog,
    onSubmit,

    availableRoles,
    canManageUser,

    confirmSaveOpen,
    setConfirmSaveOpen,
    confirmSave,
    pendingSavePayload,

    pendingDeleteUser,
    setPendingDeleteUser,
    confirmDelete,

    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
