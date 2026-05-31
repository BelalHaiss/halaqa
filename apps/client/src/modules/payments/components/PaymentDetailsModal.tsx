import {
  formatDate,
  getCurrencyLabel,
  getTransactionEntityTypeLabel,
  getTransactionTypeLabel,
  LearnerPaymentSummaryDto,
  TutorPaymentSummaryDto,
} from '@halaqa/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { useApp } from '@/contexts/AppContext';

type PaymentDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learnerPayment?: LearnerPaymentSummaryDto | null;
  tutorPayment?: TutorPaymentSummaryDto | null;
};

export function PaymentDetailsModal({
  open,
  onOpenChange,
  learnerPayment,
  tutorPayment,
}: PaymentDetailsModalProps) {
  const transactions = learnerPayment?.transactions ?? tutorPayment?.transactions ?? [];
  const { user } = useApp();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>
            {learnerPayment ? `تفاصيل اشتراك ${learnerPayment.learnerName}` : null}
            {tutorPayment ? `تفاصيل أجر ${tutorPayment.tutorName}` : null}
          </DialogTitle>
        </DialogHeader>

        {learnerPayment ? (
          <div className='space-y-3'>
            <div className='flex flex-wrap gap-2'>
              <Badge color='muted'>عدد الجلسات: {learnerPayment.sessionsCount}</Badge>
              <Badge color='muted'>الإجمالي: {learnerPayment.totalAmount}</Badge>
              <Badge color='muted'>المدفوع: {learnerPayment.paidAmount}</Badge>
              <Badge color='muted'>العملة: {getCurrencyLabel(learnerPayment.currency)}</Badge>
              <PaymentStatusBadge status={learnerPayment.status} />
            </div>
          </div>
        ) : null}

        {tutorPayment ? (
          <div className='space-y-3'>
            <div className='flex flex-wrap gap-2'>
              <Badge color='muted'>عدد الجلسات: {tutorPayment.sessionsCount}</Badge>
              <Badge color='muted'>الإجمالي: {tutorPayment.totalAmount}</Badge>
              <Badge color='muted'>العملة: {getCurrencyLabel(tutorPayment.currency)}</Badge>
            </div>
          </div>
        ) : null}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-center'>النوع</TableHead>
              <TableHead className='text-center'>الكيان</TableHead>
              <TableHead className='text-center'>المبلغ</TableHead>
              <TableHead className='text-center'>العملة</TableHead>
              <TableHead className='text-center'>التاريخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='py-6 text-center text-muted-foreground'>
                  لا توجد حركات مالية مرتبطة
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className='text-center'>
                    {getTransactionTypeLabel(transaction.type)}
                  </TableCell>
                  <TableCell className='text-center'>
                    {getTransactionEntityTypeLabel(transaction.entityType)}
                  </TableCell>
                  <TableCell className='text-center'>{transaction.amount}</TableCell>
                  <TableCell className='text-center'>
                    {getCurrencyLabel(transaction.currency)}
                  </TableCell>
                  <TableCell className='text-center'>
                    {formatDate({
                      date: transaction.createdAt,
                      token: 'dd/MM/yyyy hh:mm a',
                      locale: 'ar',
                      timezone: user!.timezone,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
