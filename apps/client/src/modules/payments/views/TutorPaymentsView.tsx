import { Card, CardContent } from '@/components/ui/card';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { PageHeader } from '@/components/ui/page-header';
import { PaymentDatePicker } from '../components/PaymentDatePicker';
import { PaymentDetailsModal } from '../components/PaymentDetailsModal';
import { ResetPaymentsFiltersButton } from '../components/ResetPaymentsFiltersButton';
import { TutorPaymentsTable } from '../components/TutorPaymentsTable';
import { useTutorPaymentsViewModel } from '../viewmodels/tutor-payments.viewmodel';

export function TutorPaymentsView() {
  const vm = useTutorPaymentsViewModel();

  return (
    <div className='space-y-5'>
      <PageHeader title='أجور المعلمين' description='عرض سجل أجورك خلال الفترات السابقة' />

      <Card className='overflow-hidden border-border/70'>
        <CardContent className='space-y-4 bg-linear-to-l from-muted/60 via-card to-card pt-6'>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
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

            <ResetPaymentsFiltersButton onClick={vm.clearFilters} />
          </div>
        </CardContent>
      </Card>

      <TutorPaymentsTable
        rows={vm.tutorPayments}
        canDelete={vm.canDeletePayments}
        isLoading={vm.isTutorPaymentsLoading}
        sortBy={vm.filters.tutorSortBy}
        sortOrder={vm.filters.tutorSortOrder}
        onSort={vm.setTutorSort}
        onView={(payment) => vm.setSelectedTutorPaymentId(payment.id)}
        onDelete={vm.setTutorPaymentPendingDelete}
      />

      <PaginationControls
        value={vm.tutorMeta.page}
        totalPages={vm.tutorMeta.totalPages}
        onValueChange={vm.setPage}
        disabled={vm.isTutorPaymentsLoading}
        className='mt-4'
      />

      <PaymentDetailsModal
        open={Boolean(vm.selectedTutorPaymentId)}
        onOpenChange={(open) => {
          if (!open) {
            vm.setSelectedTutorPaymentId(null);
          }
        }}
        tutorPayment={vm.tutorPaymentDetails}
      />
    </div>
  );
}
