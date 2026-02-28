import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateLearnerDto,
  DEFAULT_TIMEZONE,
  LearnerDto,
  TIMEZONES,
  UpdateLearnerDto,
} from '@halaqa/shared';
import { FormField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Typography } from '@/components/ui/typography';
import {
  studentMainInfoFormSchema,
  type StudentMainInfoFormValues,
} from './student-main-info.schema';
import { LearnerGroupsReadonlyPanel } from './LearnerGroupsReadonlyPanel';

export type StudentMainInfoMode = 'view' | 'edit' | 'create';

export type StudentMainInfoLearner = Pick<
  LearnerDto,
  'id' | 'name' | 'timezone' | 'contact' | 'groupCount' | 'groups'
>;

export type StudentMainInfoSubmitArgs =
  | {
      mode: 'create';
      addToGroupId?: string;
      data: CreateLearnerDto;
    }
  | {
      mode: 'edit';
      learnerId?: string;
      data: UpdateLearnerDto;
    };

type StudentMainInfoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: StudentMainInfoMode;
  learner?: StudentMainInfoLearner | null;
  addToGroupId?: string;
  onSubmit?: (args: StudentMainInfoSubmitArgs) => Promise<void> | void;
  isLoading?: boolean;
};

export function StudentMainInfoModal({
  open,
  onOpenChange,
  mode,
  learner,
  addToGroupId,
  onSubmit,
  isLoading = false,
}: StudentMainInfoModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingSubmitArgs, setPendingSubmitArgs] = useState<StudentMainInfoSubmitArgs | null>(
    null
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';

  const defaultValues = useMemo<StudentMainInfoFormValues>(
    () => ({
      name: learner && !isCreateMode ? learner.name : '',
      timezone: learner && !isCreateMode ? learner.timezone || DEFAULT_TIMEZONE : DEFAULT_TIMEZONE,
      notes: learner && !isCreateMode ? learner.contact.notes || '' : '',
    }),
    [learner, isCreateMode]
  );

  const form = useForm<StudentMainInfoFormValues>({
    resolver: zodResolver(studentMainInfoFormSchema),
    values: defaultValues,
    mode: 'onTouched',
  });

  const handleFormSubmit = (values: StudentMainInfoFormValues) => {
    if (isViewMode || !onSubmit) {
      onOpenChange(false);
      return;
    }

    const submitData: StudentMainInfoSubmitArgs = isCreateMode
      ? {
          mode: 'create',
          addToGroupId,
          data: {
            name: values.name.trim(),
            timezone: values.timezone,
            contact: values.notes.trim() ? { notes: values.notes.trim() } : undefined,
          },
        }
      : {
          mode: 'edit',
          learnerId: learner?.id,
          data: {
            name: values.name.trim(),
            timezone: values.timezone,
            contact: { notes: values.notes.trim() || undefined },
          },
        };

    setPendingSubmitArgs(submitData);
    setConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    if (!pendingSubmitArgs || !onSubmit) {
      return;
    }

    setErrorMessage(null);

    try {
      await onSubmit(pendingSubmitArgs);
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'تعذر حفظ بيانات المتعلم');
    }
  };

  const title =
    mode === 'create' ? 'إضافة متعلم' : mode === 'edit' ? 'تعديل بيانات المتعلم' : 'بيانات المتعلم';

  const description =
    mode === 'create'
      ? 'أدخل البيانات الأساسية للمتعلم الجديد'
      : mode === 'edit'
        ? 'يمكنك تعديل البيانات وحفظها'
        : 'عرض البيانات الأساسية للمتعلم';

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setErrorMessage(null);
          setConfirmOpen(false);
          setPendingSubmitArgs(null);
          onOpenChange(nextOpen);
        }}
      >
        <DialogContent dir='rtl' className='w-full sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleFormSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              id='student-name'
              label='الاسم'
              type='text'
              placeholder='اسم المتعلم'
              disabled={isViewMode || isLoading}
            />

            <FormField
              control={form.control}
              name='timezone'
              id='student-timezone'
              label='المنطقة الزمنية'
              type='select'
              placeholder='اختر المنطقة الزمنية'
              disabled={isViewMode || isLoading}
              options={TIMEZONES.map((tz) => ({
                value: tz.value,
                label: tz.label,
              }))}
            />

            <FormField
              control={form.control}
              name='notes'
              id='student-notes'
              label='ملاحظات'
              type='textarea'
              placeholder='ملاحظات عن المتعلم'
              disabled={isViewMode || isLoading}
              rows={4}
            />

            {isViewMode ? (
              <LearnerGroupsReadonlyPanel
                groups={learner?.groups}
                groupCount={learner?.groupCount}
              />
            ) : null}

            {errorMessage ? (
              <Typography as='div' size='sm' className='text-danger' role='alert'>
                {errorMessage}
              </Typography>
            ) : null}

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                color='muted'
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                إغلاق
              </Button>

              {!isViewMode ? (
                <Button
                  type='submit'
                  disabled={isLoading || !form.formState.isDirty || !form.formState.isValid}
                >
                  {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
              ) : null}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isCreateMode ? 'تأكيد إضافة متعلم' : 'تأكيد تعديل المتعلم'}
        description={
          isCreateMode ? 'هل أنت متأكد من إضافة هذا المتعلم؟' : 'هل أنت متأكد من حفظ التعديلات؟'
        }
        confirmText={isCreateMode ? 'إضافة' : 'حفظ'}
        cancelText='إلغاء'
        onConfirm={confirmSubmit}
      />
    </>
  );
}
