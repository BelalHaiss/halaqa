import { DEFAULT_TIMEZONE, TIMEZONES } from '@halaqa/shared';
import { withRole } from '@/hoc/withRole';
import { roleColorMap } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FormField } from '@/components/forms/form-field';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TimezoneDisplay } from '@/components/ui/timezone-display';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Edit2, GraduationCap, Loader2, Shield, Trash2, UserCog, UserPlus } from 'lucide-react';
import { useUsersViewModel } from '../viewmodels/users.viewmodel';

const roleLabels: Record<string, string> = {
  ADMIN: 'مدير',
  MODERATOR: 'مشرف',
  TUTOR: 'معلم',
};

const roleIcons: Record<string, typeof Shield> = {
  ADMIN: Shield,
  MODERATOR: UserCog,
  TUTOR: GraduationCap,
};

function UsersView() {
  const vm = useUsersViewModel();

  if (!vm.user) {
    return null;
  }

  if (vm.queryError) {
    return (
      <Alert variant='soft' color='danger'>
        <AlertDescription>{vm.queryError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl text-gray-800 dark:text-gray-100 mb-1'>إدارة المستخدمين</h1>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            إدارة المشرفين والمعلمين والصلاحيات
          </p>
        </div>

        <Dialog open={vm.isDialogOpen} onOpenChange={vm.setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={vm.openCreateDialog}
              className='gap-2 bg-emerald-600 hover:bg-emerald-700 text-white'
              size='sm'
            >
              <UserPlus className='w-4 h-4' />
              <span>إضافة مستخدم</span>
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-md' dir='rtl'>
            <DialogHeader>
              <DialogTitle>{vm.editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</DialogTitle>
              <DialogDescription>
                {vm.editingUser ? 'قم بتعديل بيانات المستخدم' : 'أدخل بيانات المستخدم الجديد'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={vm.onSubmit}>
              <div className='space-y-4 py-4'>
                <FormField
                  control={vm.form.control}
                  name='name'
                  label='الاسم'
                  type='text'
                  placeholder='أدخل الاسم'
                  disabled={vm.isSubmitting}
                  inputClassName='text-right'
                />

                <FormField
                  control={vm.form.control}
                  name='username'
                  label='اسم الحساب'
                  type='text'
                  placeholder='username'
                  disabled={vm.isSubmitting}
                  inputClassName='text-left'
                />

                <FormField
                  control={vm.form.control}
                  name='password'
                  label={
                    vm.editingUser
                      ? 'كلمة المرور (اتركها فارغة للإبقاء على الحالية)'
                      : 'كلمة المرور'
                  }
                  type='password'
                  placeholder='••••••••'
                  disabled={vm.isSubmitting}
                />

                <FormField
                  control={vm.form.control}
                  name='role'
                  label='الدور'
                  type='select'
                  disabled={
                    vm.isSubmitting ||
                    Boolean(vm.editingUser?.role === 'ADMIN' && vm.user.role === 'MODERATOR')
                  }
                  options={vm.availableRoles.map((role) => ({
                    value: role,
                    label: roleLabels[role],
                  }))}
                />

                <FormField
                  control={vm.form.control}
                  name='timezone'
                  label='المنطقة الزمنية'
                  type='select'
                  disabled={vm.isSubmitting}
                  options={TIMEZONES.map((tz) => ({
                    value: tz.value,
                    label: tz.label,
                  }))}
                />
              </div>

              <DialogFooter>
                <Button
                  type='submit'
                  className='bg-emerald-600 hover:bg-emerald-700'
                  disabled={vm.isSubmitting}
                >
                  {vm.editingUser ? 'حفظ التعديلات' : 'إضافة'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
        <TableHeader className='bg-gray-50 dark:bg-gray-900/50'>
          <TableRow>
            <TableHead className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
              الاسم
            </TableHead>
            <TableHead className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
              اسم الحساب
            </TableHead>
            <TableHead className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
              الدور
            </TableHead>
            <TableHead className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
              المنطقة الزمنية
            </TableHead>
            <TableHead className='px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300'>
              الإجراءات
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vm.isLoading ? (
            <TableRow>
              <TableCell colSpan={5}>
                <div className='flex items-center justify-center py-8 gap-2 text-muted-foreground'>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  جاري التحميل...
                </div>
              </TableCell>
            </TableRow>
          ) : vm.users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className='text-center py-10 text-gray-500 dark:text-gray-400'>
                لا يوجد مستخدمون
              </TableCell>
            </TableRow>
          ) : (
            vm.users.map((userItem) => {
              const RoleIcon = roleIcons[userItem.role];
              const userTimezone = userItem.timezone || DEFAULT_TIMEZONE;
              const canManage = vm.canManageUser(userItem);

              return (
                <TableRow key={userItem.id}>
                  <TableCell className='px-4 py-3'>
                    <div className='text-sm text-gray-900 dark:text-gray-100'>{userItem.name}</div>
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <div className='text-sm text-gray-900 dark:text-gray-100'>
                      {userItem.username}
                    </div>
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <Badge variant='soft' color={roleColorMap[userItem.role]}>
                      <RoleIcon className='w-3 h-3' />
                      {roleLabels[userItem.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <TimezoneDisplay
                      timezone={userTimezone}
                      variant='soft'
                      color='muted'
                      size='sm'
                    />
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <div className='flex items-center justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => vm.openEditDialog(userItem)}
                        disabled={!canManage}
                        className='h-8 w-8 p-0'
                      >
                        <Edit2 className='w-4 h-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => vm.setPendingDeleteUser(userItem)}
                        disabled={!canManage}
                        className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={vm.confirmSaveOpen}
        onOpenChange={vm.setConfirmSaveOpen}
        title={vm.editingUser ? 'تأكيد حفظ التعديلات' : 'تأكيد إضافة المستخدم'}
        description={
          vm.editingUser
            ? 'هل تريد حفظ التعديلات على بيانات المستخدم؟'
            : 'هل تريد إضافة المستخدم الجديد؟'
        }
        confirmText={vm.editingUser ? 'حفظ' : 'إضافة'}
        cancelText='إلغاء'
        variant='solid'
        color='primary'
        onConfirm={vm.confirmSave}
      />

      <ConfirmDialog
        open={Boolean(vm.pendingDeleteUser)}
        onOpenChange={(open) => {
          if (!open) {
            vm.setPendingDeleteUser(null);
          }
        }}
        title='تأكيد حذف المستخدم'
        description={
          vm.pendingDeleteUser
            ? `هل أنت متأكد من حذف "${vm.pendingDeleteUser.name}"؟`
            : 'هل أنت متأكد من حذف هذا المستخدم؟'
        }
        confirmText='حذف'
        cancelText='إلغاء'
        variant='solid'
        color='danger'
        onConfirm={vm.confirmDelete}
      />
    </div>
  );
}

export default withRole(UsersView, ['ADMIN', 'MODERATOR']);
