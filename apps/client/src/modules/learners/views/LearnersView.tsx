import { Loader2, UserPlus, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { StudentTableItem } from '@/modules/learners/components/student-table-item';
import { StudentMainInfoModal } from '@/modules/learners/components/student-main-info-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useLearnersViewModel } from '../viewmodels/learners.viewmodel';

export default function LearnersView() {
  const vm = useLearnersViewModel();

  if (vm.queryError) {
    return (
      <Alert alertType='ERROR'>
        <AlertDescription>{vm.queryError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-4'>
      <PageHeader
        title='المتعلمون'
        description='إدارة قائمة المتعلمين'
        actions={
          vm.canManageLearners ? (
            <Button onClick={vm.openCreateModal} className='gap-2'>
              <UserPlus className='w-4 h-4' />
              إضافة متعلم
            </Button>
          ) : null
        }
      />

      <SearchInput
        value={vm.searchQuery}
        onChange={vm.onSearchQueryChange}
        placeholder='بحث بالاسم فقط'
        className='w-full sm:max-w-md'
      />

      <Table className='rounded-lg border bg-card shadow-sm'>
        <TableHeader className='bg-muted/40'>
          <TableRow>
            <TableHead className='px-4 py-3 text-right text-xs'>الاسم</TableHead>
            <TableHead className='px-4 py-3 text-right text-xs'>المنطقة الزمنية</TableHead>
            <TableHead className='px-4 py-3 text-right text-xs'>ملاحظات</TableHead>
            <TableHead className='px-4 py-3 text-right text-xs'>عدد الحلقات</TableHead>
            <TableHead className='px-4 py-3 text-left text-xs'>الإجراءات</TableHead>
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
          ) : vm.learners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <div className='flex flex-col items-center justify-center py-10 text-muted-foreground gap-2'>
                  <Users className='w-6 h-6 opacity-70' />
                  <span>{vm.searchQuery ? 'لا توجد نتائج مطابقة' : 'لا يوجد متعلمون حالياً'}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            vm.learners.map((learner) => (
              <StudentTableItem
                key={learner.id}
                learner={learner}
                showActions={vm.canManageLearners}
                onClick={vm.openViewModal}
                onEdit={vm.openEditModal}
                onDelete={vm.setLearnerPendingDelete}
              />
            ))
          )}
        </TableBody>
      </Table>

      <PaginationControls
        value={vm.page}
        totalPages={vm.totalPages}
        onValueChange={vm.setPage}
        disabled={vm.isLoading || vm.isRefreshing}
      />

      <StudentMainInfoModal
        open={vm.isStudentModalOpen}
        onOpenChange={vm.setIsStudentModalOpen}
        mode={vm.studentModalMode}
        learner={vm.selectedLearner}
        onSubmit={vm.submitLearner}
        isLoading={vm.isSubmittingLearner}
      />

      <ConfirmDialog
        open={Boolean(vm.learnerPendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            vm.setLearnerPendingDelete(null);
          }
        }}
        title='حذف المتعلم'
        description={
          vm.learnerPendingDelete
            ? `هل تريد حذف "${vm.learnerPendingDelete.name}"؟`
            : 'هل تريد حذف هذا المتعلم؟'
        }
        confirmText='حذف'
        cancelText='إلغاء'
        intent='destructive'
        onConfirm={vm.confirmDeleteLearner}
      />
    </div>
  );
}
