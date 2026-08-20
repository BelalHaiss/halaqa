import { Plus } from 'lucide-react';
import { getPaymentStatusLabel } from '@halaqa/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { PageHeader } from '@/components/ui/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateLearnerPaymentModal } from '../components/CreateLearnerPaymentModal';
import { CurrencySelectFilter } from '../components/CurrencySelectFilter';
import { GroupFilterSelect } from '../components/GroupFilterSelect';
import { LearnerPaymentsTable } from '../components/LearnerPaymentsTable';
import { LearnerSearchCombobox } from '../components/LearnerSearchCombobox';
import { PaymentDatePicker } from '../components/PaymentDatePicker';
import { PaymentDetailsModal } from '../components/PaymentDetailsModal';
import { ResetPaymentsFiltersButton } from '../components/ResetPaymentsFiltersButton';
import { useAdminLearnerPaymentsViewModel } from '../viewmodels/admin-learner-payments.viewmodel';

export function AdminLearnerPaymentsView() {
  const vm = useAdminLearnerPaymentsViewModel();

  return (
    <div className='space-y-5'>
      <PageHeader
        title='اشتراكات المتعلمين'
        description='إدارة اشتراكات المتعلمين والمدفوعات'
        actions={
          vm.canManagePayments ? (
            <Button onClick={() => vm.setIsCreateOpen(true)} className='gap-2'>
              <Plus className='w-4 h-4' />
              إنشاء اشتراك متعلم
            </Button>
          ) : null
        }
      />

      <Card className='overflow-hidden border-border/70'>
        <CardContent className='space-y-4 bg-linear-to-l from-muted/60 via-card to-card pt-6'>
          <Badge color='muted' className='h-8 rounded-full px-3'>
            {`إجمالي الاشتراكات: ${vm.meta.total}`}
          </Badge>

          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6'>
            <LearnerSearchCombobox
              value={vm.filters.learnerId}
              onValueChange={vm.setLearnerId}
              selectedName={vm.filters.learnerName}
            />

            <GroupFilterSelect value={vm.filters.groupId} onChange={vm.setGroupId} />

            <PaymentDatePicker
              value={vm.filters.fromDate}
              onChange={vm.setFromDate}
              placeholder='من تاريخ'
              maxDate={vm.filters.toDate || undefined}
            />

            <PaymentDatePicker
              value={vm.filters.toDate}
              onChange={vm.setToDate}
              placeholder='إلى تاريخ'
              minDate={vm.filters.fromDate || undefined}
            />

            <Select
              value={vm.filters.status ?? '__ALL_STATUS__'}
              onValueChange={(value) =>
                vm.setStatus((value === '__ALL_STATUS__' ? '' : value) as 'UNPAID' | 'PAID' | '')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='حالة السداد' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__ALL_STATUS__'>كل الحالات</SelectItem>
                <SelectItem value='UNPAID'>{getPaymentStatusLabel('UNPAID')}</SelectItem>
                <SelectItem value='PAID'>{getPaymentStatusLabel('PAID')}</SelectItem>
              </SelectContent>
            </Select>

            <CurrencySelectFilter value={vm.filters.currency ?? ''} onChange={vm.setCurrency} />

            <ResetPaymentsFiltersButton onClick={vm.clearFilters} />
          </div>
        </CardContent>
      </Card>

      <LearnerPaymentsTable
        rows={vm.payments}
        canDelete={vm.canDeletePayments}
        isLoading={vm.isLoading}
        sortBy={vm.filters.sortBy}
        sortOrder={vm.filters.sortOrder}
        onSort={vm.setSort}
        onView={(payment) => vm.setSelectedPaymentId(payment.id)}
        onDelete={vm.setPaymentPendingDelete}
      />

      <PaginationControls
        value={vm.meta.page}
        totalPages={vm.meta.totalPages}
        onValueChange={vm.setPage}
        disabled={vm.isLoading}
        className='mt-4'
      />

      <CreateLearnerPaymentModal
        open={vm.isCreateOpen}
        onOpenChange={vm.setIsCreateOpen}
        onSubmit={vm.createPayment}
        isSubmitting={vm.isCreatingPayment}
      />

      <PaymentDetailsModal
        open={Boolean(vm.selectedPaymentId)}
        onOpenChange={(open) => {
          if (!open) vm.setSelectedPaymentId(null);
        }}
        learnerPayment={vm.paymentDetails}
      />

      <ConfirmDialog
        open={Boolean(vm.paymentPendingDelete)}
        onOpenChange={(open) => {
          if (!open) vm.setPaymentPendingDelete(null);
        }}
        title='حذف اشتراك متعلم'
        description='هل أنت متأكد من حذف هذا الاشتراك؟'
        confirmText='حذف'
        cancelText='إلغاء'
        intent='destructive'
        onConfirm={vm.confirmDelete}
      />
    </div>
  );
}
