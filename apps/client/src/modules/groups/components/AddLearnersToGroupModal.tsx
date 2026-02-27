import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AddLearnersToGroupDto,
  CreateLearnerDto,
  DEFAULT_TIMEZONE,
  LearnerDto,
  TIMEZONES
} from '@halaqa/shared';
import { FormField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue
} from '@/components/ui/combobox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimezoneDisplay } from '@/components/ui/timezone-display';
import { Typography } from '@/components/ui/typography';
import { createLearnerSchema } from '@/modules/learners/schema/learner.schema';

type AddLearnersToGroupModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learners: LearnerDto[];
  onAttachExisting: (dto: AddLearnersToGroupDto) => Promise<void> | void;
  onCreateAndAttach: (dto: CreateLearnerDto) => Promise<void> | void;
  isLoadingLearners?: boolean;
  isAttachingExisting?: boolean;
  isCreatingLearner?: boolean;
};

type PendingActionType = 'attach-existing' | 'create-new' | null;
type AddLearnersModalTab = 'existing' | 'create';

const createLearnerDefaultValues: CreateLearnerDto = {
  name: '',
  timezone: DEFAULT_TIMEZONE,
  contact: {
    notes: ''
  }
};

export function AddLearnersToGroupModal({
  open,
  onOpenChange,
  learners,
  onAttachExisting,
  onCreateAndAttach,
  isLoadingLearners = false,
  isAttachingExisting = false,
  isCreatingLearner = false
}: AddLearnersToGroupModalProps) {
  const [comboboxAnchor, setComboboxAnchor] = useState<HTMLDivElement | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<AddLearnersModalTab>('existing');
  const [selectedLearnerIds, setSelectedLearnerIds] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingActionType>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createLearnerForm = useForm<CreateLearnerDto>({
    resolver: zodResolver(createLearnerSchema),
    mode: 'onTouched',
    defaultValues: createLearnerDefaultValues
  });

  const learnerNameById = useMemo(
    () => new Map(learners.map((learner) => [learner.id, learner.name])),
    [learners]
  );

  const learnerById = useMemo(
    () => new Map(learners.map((learner) => [learner.id, learner])),
    [learners]
  );

  const learnerIds = useMemo(
    () => learners.map((learner) => learner.id),
    [learners]
  );
  const comboboxContainer =
    (comboboxAnchor?.closest('[data-slot="dialog-content"]') as HTMLElement | null) ??
    null;

  const resetModalState = () => {
    setActiveTab('existing');
    setSelectedLearnerIds([]);
    setPendingAction(null);
    setConfirmOpen(false);
    setErrorMessage(null);
    createLearnerForm.reset(createLearnerDefaultValues);
  };

  const openAttachExistingConfirmation = () => {
    if (selectedLearnerIds.length === 0 || isAttachingExisting) {
      return;
    }

    setErrorMessage(null);
    setPendingAction('attach-existing');
    setConfirmOpen(true);
  };

  const openCreateLearnerConfirmation = () => {
    if (isCreatingLearner) {
      return;
    }

    setErrorMessage(null);
    setPendingAction('create-new');
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      if (pendingAction === 'attach-existing') {
        await onAttachExisting({
          learnerIds: selectedLearnerIds
        });
      } else if (pendingAction === 'create-new') {
        const values = createLearnerForm.getValues();
        const notes = values.contact?.notes?.trim();

        await onCreateAndAttach({
          name: values.name.trim(),
          timezone: values.timezone,
          contact: notes ? { notes } : undefined
        });
      }

      resetModalState();
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'تعذر إكمال العملية'
      );
    }
  };

  const confirmTitle =
    pendingAction === 'attach-existing'
      ? 'تأكيد إضافة المتعلمين'
      : 'تأكيد إنشاء متعلم جديد';

  const confirmDescription =
    pendingAction === 'attach-existing'
      ? `سيتم إضافة ${selectedLearnerIds.length} متعلم إلى الحلقة`
      : 'سيتم إنشاء متعلم جديد وإضافته إلى الحلقة';

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            resetModalState();
          }
          onOpenChange(nextOpen);
        }}
      >
        <DialogContent dir='rtl' className='w-full sm:max-w-2xl sm:overflow-visible'>
          <DialogHeader>
            <DialogTitle>إضافة متعلمين</DialogTitle>
            <DialogDescription>
              يمكنك اختيار متعلمين موجودين أو إنشاء متعلم جديد وإضافته إلى
              الحلقة
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as AddLearnersModalTab)
            }
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='existing'>من المتعلمين الحاليين</TabsTrigger>
              <TabsTrigger value='create'>إنشاء متعلم جديد</TabsTrigger>
            </TabsList>

            <TabsContent value='existing' className='space-y-4'>
              <Typography as='div' size='sm' className='text-muted-foreground'>
                اختر أكثر من متعلم لإضافتهم دفعة واحدة
              </Typography>

              <Combobox
                multiple
                items={learnerIds}
                value={selectedLearnerIds}
                onValueChange={(value) => setSelectedLearnerIds(value)}
                itemToStringLabel={(learnerId) =>
                  learnerNameById.get(learnerId) ?? learnerId
                }
              >
                <ComboboxChips ref={setComboboxAnchor} className='w-full'>
                  <ComboboxValue>
                    {(values) => (
                      <>
                        {values.map((learnerId: string) => (
                          <ComboboxChip key={learnerId}>
                            {learnerNameById.get(learnerId) ?? learnerId}
                          </ComboboxChip>
                        ))}
                        <ComboboxChipsInput
                          placeholder='ابحث عن متعلم بالاسم...'
                          disabled={isLoadingLearners || isAttachingExisting}
                        />
                      </>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent
                  anchor={comboboxAnchor}
                  container={comboboxContainer}
                  className='rounded-md border bg-popover shadow-md'
                >
                  <ComboboxEmpty>لا يوجد متعلمون متاحون للإضافة</ComboboxEmpty>
                  <ComboboxList className='max-h-80 overflow-y-auto p-2 pt-3 scroll-pt-3'>
                    {(learnerId: string) => {
                      const learner = learnerById.get(learnerId);
                      if (!learner) {
                        return null;
                      }

                      return (
                        <ComboboxItem key={learner.id} value={learner.id}>
                          <div className='flex w-full items-center justify-between gap-2'>
                            <Typography as='span' size='sm' weight='medium'>
                              {learner.name}
                            </Typography>
                            <TimezoneDisplay timezone={learner.timezone} />
                          </div>
                        </ComboboxItem>
                      );
                    }}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              <Typography as='div' size='xs' className='text-muted-foreground'>
                المتعلمون المحددون: {selectedLearnerIds.length}
              </Typography>
            </TabsContent>

            <TabsContent value='create' className='space-y-4'>
              <form
                id='create-learner-form'
                onSubmit={createLearnerForm.handleSubmit(
                  openCreateLearnerConfirmation
                )}
                className='space-y-4'
              >
                <FormField
                  control={createLearnerForm.control}
                  name='name'
                  id='new-learner-name'
                  label='الاسم'
                  type='text'
                  placeholder='اسم المتعلم'
                  disabled={isCreatingLearner}
                />

                <FormField
                  control={createLearnerForm.control}
                  name='timezone'
                  id='new-learner-timezone'
                  label='المنطقة الزمنية'
                  type='select'
                  placeholder='اختر المنطقة الزمنية'
                  disabled={isCreatingLearner}
                  options={TIMEZONES.map((timezone) => ({
                    value: timezone.value,
                    label: timezone.label
                  }))}
                />

                <FormField
                  control={createLearnerForm.control}
                  name='contact.notes'
                  id='new-learner-notes'
                  label='ملاحظات'
                  type='textarea'
                  placeholder='ملاحظات عن المتعلم'
                  rows={3}
                  disabled={isCreatingLearner}
                />
              </form>
            </TabsContent>
          </Tabs>

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
              disabled={isAttachingExisting || isCreatingLearner}
            >
              إلغاء
            </Button>

            {activeTab === 'existing' ? (
              <Button
                type='button'
                onClick={openAttachExistingConfirmation}
                disabled={
                  isLoadingLearners ||
                  isAttachingExisting ||
                  selectedLearnerIds.length === 0
                }
              >
                إضافة المتعلمين المحددين
              </Button>
            ) : (
              <Button
                type='submit'
                form='create-learner-form'
                disabled={
                  isCreatingLearner ||
                  !createLearnerForm.formState.isDirty ||
                  !createLearnerForm.formState.isValid
                }
              >
                إنشاء وإضافة
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmTitle}
        description={confirmDescription}
        confirmText={pendingAction === 'attach-existing' ? 'إضافة' : 'إنشاء'}
        cancelText='إلغاء'
        onConfirm={handleConfirm}
      />
    </>
  );
}
