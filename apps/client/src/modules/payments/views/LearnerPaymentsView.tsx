import { getPaymentStatusLabel } from '@halaqa/shared';
import { Card, CardContent } from '@/components/ui/card';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { PageHeader } from '@/components/ui/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LearnerPaymentsTable } from '../components/LearnerPaymentsTable';
import { PaymentDatePicker } from '../components/PaymentDatePicker';
import { PaymentDetailsModal } from '../components/PaymentDetailsModal';
import { ResetPaymentsFiltersButton } from '../components/ResetPaymentsFiltersButton';
import { useLearnerPaymentsViewModel } from '../viewmodels/learner-payments.viewmodel';

export function LearnerPaymentsView() {
  const vm = useLearnerPaymentsViewModel();

  return (
    <div className='space-y-5'>
      <PageHeader title='اشتراكات المتعلمين' description='عرض اشتراكاتك والمدفوعات المرتبطة بها' />

      <Card className='overflow-hidden border-border/70'>
        <CardContent className='space-y-4 bg-linear-to-l from-muted/60 via-card to-card pt-6'>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5'>
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
                vm.setStatus(
                  (value === '__ALL_STATUS__' ? '' : value) as 'UNPAID' | 'PARTIAL' | 'PAID' | ''
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='حالة السداد' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__ALL_STATUS__'>كل الحالات</SelectItem>
                <SelectItem value='UNPAID'>{getPaymentStatusLabel('UNPAID')}</SelectItem>
                <SelectItem value='PARTIAL'>{getPaymentStatusLabel('PARTIAL')}</SelectItem>
                <SelectItem value='PAID'>{getPaymentStatusLabel('PAID')}</SelectItem>
              </SelectContent>
            </Select>

            <ResetPaymentsFiltersButton onClick={vm.clearFilters} />
          </div>
        </CardContent>
      </Card>

      <LearnerPaymentsTable
        rows={vm.learnerPayments}
        canDelete={false}
        canPay={false}
        isLoading={vm.isLearnerPaymentsLoading}
        sortBy={vm.filters.learnerSortBy}
        sortOrder={vm.filters.learnerSortOrder}
        onSort={vm.setLearnerSort}
        onView={(payment) => vm.setSelectedLearnerPaymentId(payment.id)}
        onPay={() => undefined}
        onDelete={() => undefined}
      />

      <PaginationControls
        value={vm.learnerMeta.page}
        totalPages={vm.learnerMeta.totalPages}
        onValueChange={vm.setPage}
        disabled={vm.isLearnerPaymentsLoading}
        className='mt-4'
      />

      <PaymentDetailsModal
        open={Boolean(vm.selectedLearnerPaymentId)}
        onOpenChange={(open) => {
          if (!open) {
            vm.setSelectedLearnerPaymentId(null);
          }
        }}
        learnerPayment={vm.learnerPaymentDetails}
      />
    </div>
  );
}
