import { DEFAULT_TIMEZONE, TIMEZONES } from '@halaqa/shared';
import { withRole } from '@/hoc/withRole';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageHeader } from '@/components/ui/page-header';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { FormField } from '@/components/forms/form-field';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { TimezoneDisplay } from '@/components/ui/timezone-display';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Edit2, Loader2, Trash2, UserPlus } from 'lucide-react';
import { useUsersViewModel } from '../viewmodels/users.viewmodel';
import { ROLE_CONFIG } from '../utils/user.util';
import { UserBadge } from '../components/UserBadge';

function UsersView() {
  const vm = useUsersViewModel();

  if (!vm.user) {
    return null;
  }

  if (vm.queryError) {
    return (
      <Alert className='border-danger/30 bg-danger/10 text-danger'>
        <AlertDescription>{vm.queryError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-4'>
      <Dialog open={vm.isDialogOpen} onOpenChange={vm.setIsDialogOpen}>
        <PageHeader
          title='إدارة المستخدمين'
          description='إدارة المشرفين والمعلمين والصلاحيات'
          actions={
            <DialogTrigger asChild>
              <Button onClick={vm.openCreateDialog} className='gap-2' size='sm'>
                <UserPlus className='w-4 h-4' />
                <span>إضافة مستخدم</span>
              </Button>
            </DialogTrigger>
          }
        />
        <DialogContent className='w-full sm:max-w-md' dir='rtl'>
          <DialogHeader>
            <DialogTitle>
              {vm.editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
            </DialogTitle>
            <DialogDescription>
              {vm.editingUser
                ? 'قم بتعديل بيانات المستخدم'
                : 'أدخل بيانات المستخدم الجديد'}
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

              {!vm.editingUser && (
                <FormField
                  control={vm.form.control}
                  name='password'
                  label='كلمة المرور'
                  type='password'
                  placeholder='••••••••'
                  disabled={vm.isSubmitting}
                  inputClassName='text-left'
                />
              )}

              <FormField
                control={vm.form.control}
                name='role'
                label='الدور'
                type='select'
                disabled={
                  vm.isSubmitting ||
                  Boolean(
                    vm.editingUser?.role === 'ADMIN' &&
                    vm.user.role === 'MODERATOR'
                  )
                }
                options={vm.availableRoles.map((role) => ({
                  value: role,
                  label:
                    ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]?.label || role
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
                  label: tz.label
                }))}
              />
            </div>

            <DialogFooter>
              <Button
                type='submit'
                disabled={vm.isSubmitting || !vm.canSubmitForm}
              >
                {vm.editingUser ? 'حفظ التعديلات' : 'إضافة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Table className='rounded-lg border bg-card shadow-sm'>
        <TableHeader className='bg-muted/40'>
          <TableRow>
            <TableHead className='px-4 py-3 text-right text-xs'>
              الاسم
            </TableHead>
            <TableHead className='px-4 py-3 text-right text-xs'>
              اسم الحساب
            </TableHead>
            <TableHead className='px-4 py-3 text-right text-xs'>
              الدور
            </TableHead>
            <TableHead className='px-4 py-3 text-right text-xs'>
              المنطقة الزمنية
            </TableHead>
            <TableHead className='px-4 py-3 text-left text-xs'>
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
              <TableCell
                colSpan={5}
                className='py-10 text-center text-muted-foreground'
              >
                لا يوجد مستخدمون
              </TableCell>
            </TableRow>
          ) : (
            vm.users.map((userItem) => {
              const userTimezone = userItem.timezone || DEFAULT_TIMEZONE;
              const canManage = vm.canManageUser(userItem);

              return (
                <TableRow key={userItem.id}>
                  <TableCell className='px-4 py-3'>
                    <div className='text-sm'>{userItem.name}</div>
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <div className='text-sm'>{userItem.username}</div>
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <UserBadge role={userItem.role} size='sm' />
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <TimezoneDisplay timezone={userTimezone} />
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
        intent='destructive'
        onConfirm={vm.confirmDelete}
      />
    </div>
  );
}

export default withRole(UsersView, ['ADMIN', 'MODERATOR']);
