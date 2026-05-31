import { Loader2 } from 'lucide-react';
import { getCurrencyLabel, formatDateLongArabic } from '@halaqa/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { PaymentDatePicker } from './PaymentDatePicker';
import { TutorLazySelect } from './TutorLazySelect';
import { useCreateTutorPaymentViewModel } from '../viewmodels/create-tutor-payment.viewmodel';

type CreateTutorPaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTutorId?: string;
};

export function CreateTutorPaymentModal({
  open,
  onOpenChange,
  defaultTutorId,
}: CreateTutorPaymentModalProps) {
  const vm = useCreateTutorPaymentViewModel({ open, defaultTutorId });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إنشاء أجر معلم</DialogTitle>
        </DialogHeader>

        <form className='space-y-4'>
          <Field>
            <FieldLabel>المعلم</FieldLabel>
            <TutorLazySelect
              value={vm.form.watch('tutorId')}
              onValueChange={(value) => {
                vm.form.setValue('tutorId', value, { shouldValidate: true });
                vm.triggerPreviewIfReady({ ...vm.form.getValues(), tutorId: value });
              }}
              placeholder='اختر المعلم أولاً'
              disabled={Boolean(defaultTutorId) || vm.isSubmitting}
            />
          </Field>

          {vm.tutorId ? (
            <Field>
              <FieldLabel>من</FieldLabel>
              {vm.isLoadingLatestDate ? (
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  جاري تحديد أول تاريخ متاح...
                </div>
              ) : vm.nextAllowedFrom ? (
                <Badge color='blue' className='w-fit'>
                  {formatDateLongArabic(vm.nextAllowedFrom)} (أول تاريخ متاح)
                </Badge>
              ) : (
                <>
                  <PaymentDatePicker
                    value={vm.periodFrom}
                    onChange={(value) => {
                      vm.form.setValue('periodFrom', value, { shouldValidate: true });
                      vm.triggerPreviewIfReady({ ...vm.form.getValues(), periodFrom: value });
                    }}
                    placeholder='اختر بداية الفترة'
                    disabled={vm.isSubmitting}
                  />
                  <FieldError errors={[vm.form.formState.errors.periodFrom]} />
                </>
              )}
            </Field>
          ) : null}

          {vm.periodFrom ? (
            <Field>
              <FieldLabel>إلى</FieldLabel>
              <PaymentDatePicker
                value={vm.periodTo}
                onChange={(value) => {
                  vm.form.setValue('periodTo', value, { shouldValidate: true });
                  vm.triggerPreviewIfReady({ ...vm.form.getValues(), periodTo: value });
                }}
                minDate={vm.periodFrom}
                placeholder='اختر نهاية الفترة'
                disabled={vm.isSubmitting}
              />
              <FieldError errors={[vm.form.formState.errors.periodTo]} />
            </Field>
          ) : null}

          {vm.isPreviewLoading || vm.isPreviewFresh || vm.hasNoSessions ? (
            <div className='rounded-md border border-border bg-muted/40 p-3 text-sm'>
              {vm.isPreviewLoading ? (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  جاري حساب الأجور...
                </div>
              ) : vm.hasNoSessions ? (
                <p className='text-center text-muted-foreground'>لا توجد جلسات في هذه الفترة</p>
              ) : vm.isPreviewFresh && vm.preview ? (
                <div className='space-y-2'>
                  {vm.preview.breakdowns.map((b) => (
                    <div key={b.currency} className='flex items-center justify-between gap-4'>
                      <span className='font-medium'>{getCurrencyLabel(b.currency)}</span>
                      <span>{b.sessionsCount} جلسة</span>
                      <span className='font-medium'>{b.totalAmount}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className='flex items-center justify-between gap-2 pt-1'>
            <Button
              type='button'
              variant='outline'
              color='muted'
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button
              type='button'
              onClick={vm.handleSubmit}
              disabled={!vm.isPreviewFresh || vm.isSubmitting}
            >
              {vm.isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء التحويل'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
