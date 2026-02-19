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
import { StudentTableItem } from '@/components/ui/student-table-item';
import {
  StudentMainInfoModal,
} from '@/components/ui/student-main-info-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useLearnersViewModel } from '../viewmodels/learners.viewmodel';

export default function LearnersView() {
  const vm = useLearnersViewModel();

  if (vm.queryError) {
    return (
      <Alert variant='soft' color='danger'>
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
        className='max-w-md'
      />

      <Table className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
        <TableHeader className='bg-gray-50 dark:bg-gray-900/50'>
          <TableRow>
            <TableHead className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
              الاسم
            </TableHead>
            <TableHead className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
              المنطقة الزمنية
            </TableHead>
            <TableHead className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
              ملاحظات
            </TableHead>
            <TableHead className='px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300'>
              الإجراءات
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vm.isLoading ? (
            <TableRow>
              <TableCell colSpan={4}>
                <div className='flex items-center justify-center py-8 gap-2 text-muted-foreground'>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  جاري التحميل...
                </div>
              </TableCell>
            </TableRow>
          ) : vm.learners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <div className='flex flex-col items-center justify-center py-10 text-muted-foreground gap-2'>
                  <Users className='w-6 h-6 opacity-70' />
                  <span>
                    {vm.searchQuery ? 'لا توجد نتائج مطابقة' : 'لا يوجد متعلمون حالياً'}
                  </span>
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
        page={vm.page}
        totalPages={vm.totalPages}
        onPageChange={vm.setPage}
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
        variant='solid'
        color='danger'
        onConfirm={vm.confirmDeleteLearner}
      />
    </div>
  );
}
