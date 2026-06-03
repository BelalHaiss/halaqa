import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { PageHeader } from '@/components/ui/page-header';
import { CreateTutorPaymentModal } from '../components/CreateTutorPaymentModal';
import { CurrencySelectFilter } from '../components/CurrencySelectFilter';
import { PaymentDatePicker } from '../components/PaymentDatePicker';
import { PaymentDetailsModal } from '../components/PaymentDetailsModal';
import { ResetPaymentsFiltersButton } from '../components/ResetPaymentsFiltersButton';
import { TutorLazySelect } from '../components/TutorLazySelect';
import { TutorPaymentsTable } from '../components/TutorPaymentsTable';
import { useAdminTutorPaymentsViewModel } from '../viewmodels/admin-tutor-payments.viewmodel';

export function AdminTutorPaymentsView() {
  const vm = useAdminTutorPaymentsViewModel();

  return (
    <div className='space-y-5'>
      <PageHeader
        title='أجور المعلمين'
        description='إدارة أجور المعلمين وسجلات الدفع'
        actions={
          vm.canManagePayments ? (
            <Button onClick={() => vm.setIsCreateOpen(true)} className='gap-2'>
              <Plus className='w-4 h-4' />
              إنشاء أجر معلم
            </Button>
          ) : null
        }
      />

      <Card className='overflow-hidden border-border/70'>
        <CardContent className='space-y-4 bg-linear-to-l from-muted/60 via-card to-card pt-6'>
          <Badge color='muted' className='h-8 rounded-full px-3'>
            {`إجمالي الأجور: ${vm.meta.total}`}
          </Badge>

          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5'>
            <TutorLazySelect
              value={vm.filters.selectedTutorId}
              onValueChange={vm.setTutorId}
              placeholder='اختر المعلم'
              includeAllOption
            />

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

            <CurrencySelectFilter value={vm.filters.currency ?? ''} onChange={vm.setCurrency} />

            <ResetPaymentsFiltersButton onClick={vm.clearFilters} />
          </div>
        </CardContent>
      </Card>

      <TutorPaymentsTable
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

      <CreateTutorPaymentModal
        open={vm.isCreateOpen}
        onOpenChange={vm.setIsCreateOpen}
        defaultTutorId={vm.filters.selectedTutorId}
      />

      <PaymentDetailsModal
        open={Boolean(vm.selectedPaymentId)}
        onOpenChange={(open) => {
          if (!open) vm.setSelectedPaymentId(null);
        }}
        tutorPayment={vm.paymentDetails}
      />

      <ConfirmDialog
        open={Boolean(vm.paymentPendingDelete)}
        onOpenChange={(open) => {
          if (!open) vm.setPaymentPendingDelete(null);
        }}
        title='حذف أجر معلم'
        description='هل أنت متأكد من حذف هذا السجل؟'
        confirmText='حذف'
        cancelText='إلغاء'
        intent='destructive'
        onConfirm={vm.confirmDelete}
      />
    </div>
  );
}
