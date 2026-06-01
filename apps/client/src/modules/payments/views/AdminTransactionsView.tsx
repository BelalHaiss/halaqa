import { Plus } from 'lucide-react';
import {
  getCurrencyLabel,
  getTransactionEntityTypeLabel,
  getTransactionTypeLabel,
  SUPPORTED_CURRENCIES,
} from '@halaqa/shared';
import type { CurrencyCode, TransactionEntityType, TransactionType } from '@halaqa/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CreatableCombobox } from '@/components/ui/creatable-combobox';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationControls } from '@/components/ui/pagination-controls';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateTransactionModal } from '../components/CreateTransactionModal';
import { PaymentDatePicker } from '../components/PaymentDatePicker';
import { ResetPaymentsFiltersButton } from '../components/ResetPaymentsFiltersButton';
import { TransactionsTable } from '../components/TransactionsTable';
import { useAdminTransactionsViewModel } from '../viewmodels/admin-transactions.viewmodel';

const ALL_VALUE = '__ALL__';

export function AdminTransactionsView() {
  const vm = useAdminTransactionsViewModel();

  return (
    <div className='space-y-5'>
      <PageHeader
        title='المعاملات المالية'
        description='عرض وإدارة جميع المعاملات المالية'
        actions={
          <Button onClick={() => vm.setIsCreateOpen(true)} className='gap-2'>
            <Plus className='h-4 w-4' />
            إضافة معاملة
          </Button>
        }
      />

      {/* Filters */}
      <Card className='overflow-hidden border-border/70'>
        <CardContent className='space-y-4 bg-linear-to-l from-muted/60 via-card to-card pt-6'>
          <Badge color='muted' className='h-8 rounded-full px-3'>
            {`إجمالي المعاملات: ${vm.meta.total}`}
          </Badge>

          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5'>
            {/* Date range */}
            <PaymentDatePicker
              value={vm.filters.fromDate ?? ''}
              onChange={vm.setFromDate}
              placeholder='من تاريخ'
              maxDate={vm.filters.toDate || undefined}
            />
            <PaymentDatePicker
              value={vm.filters.toDate ?? ''}
              onChange={vm.setToDate}
              placeholder='إلى تاريخ'
              minDate={vm.filters.fromDate || undefined}
            />

            {/* Transaction type */}
            <Select
              value={vm.filters.type ?? ALL_VALUE}
              onValueChange={(v) => vm.setType(v === ALL_VALUE ? '' : (v as TransactionType))}
            >
              <SelectTrigger>
                <SelectValue placeholder='نوع المعاملة' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>كل الأنواع</SelectItem>
                <SelectItem value='INCOME'>{getTransactionTypeLabel('INCOME')}</SelectItem>
                <SelectItem value='EXPENSE'>{getTransactionTypeLabel('EXPENSE')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Entity type */}
            <Select
              value={vm.filters.entityType ?? ALL_VALUE}
              onValueChange={(v) =>
                vm.setEntityType(v === ALL_VALUE ? '' : (v as TransactionEntityType))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='المصدر' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>كل المصادر</SelectItem>
                <SelectItem value='LEARNER_PAYMENT'>
                  {getTransactionEntityTypeLabel('LEARNER_PAYMENT')}
                </SelectItem>
                <SelectItem value='TUTOR_PAYMENT'>
                  {getTransactionEntityTypeLabel('TUTOR_PAYMENT')}
                </SelectItem>
                <SelectItem value='MANUAL'>{getTransactionEntityTypeLabel('MANUAL')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Currency */}
            <Select
              value={vm.filters.currency ?? ALL_VALUE}
              onValueChange={(v) => vm.setCurrency(v === ALL_VALUE ? '' : (v as CurrencyCode))}
            >
              <SelectTrigger>
                <SelectValue placeholder='العملة' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>كل العملات</SelectItem>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {getCurrencyLabel(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Label filter */}
            <CreatableCombobox
              value={
                vm.selectedFilterLabel
                  ? {
                      id: vm.selectedFilterLabel.id,
                      label: vm.selectedFilterLabel.name,
                      isNew: false,
                    }
                  : null
              }
              onChange={(v) => vm.setLabelId(v ? { id: v.id, name: v.label } : null)}
              onSearch={vm.setLabelSearch}
              options={vm.labels.map((l) => ({ id: l.id, name: l.name }))}
              isLoading={vm.isLabelsLoading}
              placeholder='فلتر بالتصنيف...'
              allowCreate={false}
            />

            <ResetPaymentsFiltersButton onClick={vm.clearFilters} />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <TransactionsTable
        rows={vm.transactions}
        canDelete={vm.canDelete}
        isLoading={vm.isLoading}
        sortBy={vm.filters.sortBy}
        sortOrder={vm.filters.sortOrder}
        onSort={vm.setSort}
        onDelete={vm.setPendingDelete}
      />

      {/* Pagination */}
      <PaginationControls
        value={vm.meta.page}
        totalPages={vm.meta.totalPages}
        onValueChange={vm.setPage}
        disabled={vm.isLoading}
      />

      {/* Create modal */}
      <CreateTransactionModal
        open={vm.isCreateOpen}
        onOpenChange={vm.setIsCreateOpen}
        onSubmit={vm.createTransaction}
        isSubmitting={vm.isCreating}
        labels={vm.labels}
        isLabelsLoading={vm.isLabelsLoading}
        onLabelSearch={vm.setLabelSearch}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!vm.pendingDelete}
        onOpenChange={(open) => !open && vm.setPendingDelete(null)}
        title='حذف المعاملة'
        description='هل أنت متأكد من حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.'
        confirmText='حذف'
        intent='destructive'
        onConfirm={vm.confirmDelete}
      />
    </div>
  );
}
