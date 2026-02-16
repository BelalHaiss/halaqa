import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  CreateGroupDto,
  DEFAULT_TIMEZONE,
  GroupDetailsDto,
  GroupStatus,
  GroupTutorSummaryDto,
  TIMEZONES,
  UpdateGroupDto,
  timeToStartMinutes
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
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/ui/typography';
import { dayNames } from '../constants';
import { createGroupSchema, updateGroupSchema } from '../schema/group.schema';

type BaseGroupFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutors?: GroupTutorSummaryDto[];
  group?: GroupDetailsDto | null;
  isLoading?: boolean;
};

type CreateGroupFormModalProps = BaseGroupFormModalProps & {
  mode: 'create';
  onSubmit: (payload: CreateGroupDto) => Promise<void> | void;
};

type EditGroupFormModalProps = BaseGroupFormModalProps & {
  mode: 'edit';
  onSubmit: (payload: UpdateGroupDto) => Promise<void> | void;
};

type GroupFormModalProps = CreateGroupFormModalProps | EditGroupFormModalProps;

type GroupFormValues = {
  name: string;
  description: string;
  tutorId: string;
  timezone: string;
  status: GroupStatus;
  time: string;
  durationMinutes: string;
  selectedDays: number[];
};

const groupStatusOptions = [
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'INACTIVE', label: 'غير نشط' },
  { value: 'COMPLETED', label: 'مكتمل' }
];

export function GroupFormModal({
  open,
  onOpenChange,
  mode,
  tutors = [],
  group,
  isLoading = false,
  onSubmit
}: GroupFormModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues = useMemo<GroupFormValues>(() => {
    const firstSchedule = group?.scheduleDays[0];

    return {
      name: group?.name ?? '',
      description: group?.description ?? '',
      tutorId: group?.tutorId ?? '',
      timezone: group?.timezone ?? DEFAULT_TIMEZONE,
      status: group?.status ?? 'ACTIVE',
      time:
        firstSchedule && Number.isFinite(firstSchedule.startMinutes)
          ? `${String(Math.floor(firstSchedule.startMinutes / 60)).padStart(2, '0')}:${String(firstSchedule.startMinutes % 60).padStart(2, '0')}`
          : '17:00',
      durationMinutes: String(firstSchedule?.durationMinutes ?? 60),
      selectedDays: group?.scheduleDays.map((day) => day.dayOfWeek) ?? []
    };
  }, [group]);

  const form = useForm<GroupFormValues>({
    values: defaultValues,
    mode: 'onBlur'
  });

  const handleSave = async () => {
    const values = form.getValues();

    const durationMinutes = Number(values.durationMinutes);
    if (!Number.isFinite(durationMinutes) || durationMinutes < 15) {
      setErrorMessage('المدة يجب أن تكون 15 دقيقة أو أكثر');
      return;
    }

    if (values.selectedDays.length === 0) {
      setErrorMessage('يجب اختيار يوم واحد على الأقل');
      return;
    }

    const scheduleDays = values.selectedDays.map((dayOfWeek) => ({
      dayOfWeek,
      startMinutes: timeToStartMinutes(values.time),
      durationMinutes
    }));

    try {
      setErrorMessage(null);

      if (mode === 'create') {
        const payload: CreateGroupDto = {
          name: values.name.trim(),
          description: values.description.trim() || undefined,
          tutorId: values.tutorId,
          timezone: values.timezone,
          status: values.status,
          scheduleDays
        };

        const parsed = createGroupSchema.safeParse(payload);
        if (!parsed.success) {
          setErrorMessage(
            parsed.error.issues[0]?.message ?? 'تعذر التحقق من البيانات'
          );
          return;
        }

        await onSubmit(parsed.data);
      } else {
        const payload: UpdateGroupDto = {
          name: values.name.trim(),
          description: values.description.trim() || undefined,
          tutorId: values.tutorId,
          timezone: values.timezone,
          status: values.status,
          scheduleDays
        };

        const parsed = updateGroupSchema.safeParse(payload);
        if (!parsed.success) {
          setErrorMessage(
            parsed.error.issues[0]?.message ?? 'تعذر التحقق من البيانات'
          );
          return;
        }

        await onSubmit(parsed.data);
      }

      setConfirmOpen(false);
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'تعذر حفظ بيانات الحلقة'
      );
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setErrorMessage(null);
          if (!nextOpen) {
            form.reset(defaultValues);
          }
          onOpenChange(nextOpen);
        }}
      >
        <DialogContent dir='rtl' className='sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'إضافة حلقة' : 'تعديل الحلقة'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'أدخل بيانات الحلقة ثم أكد الإضافة'
                : 'قم بتعديل البيانات ثم احفظ التغييرات'}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(() => setConfirmOpen(true))}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              id='group-name'
              label='اسم الحلقة'
              type='text'
              placeholder='أدخل اسم الحلقة'
              disabled={isLoading}
            />

            <FormField
              control={form.control}
              name='description'
              id='group-description'
              label='الوصف'
              type='textarea'
              placeholder='وصف مختصر للحلقة'
              rows={3}
              disabled={isLoading}
            />

            <FormField
              control={form.control}
              name='tutorId'
              id='group-tutor-id'
              label='المعلم'
              type='select'
              placeholder='اختر المعلم'
              disabled={isLoading}
              options={tutors.map((tutor) => ({
                value: tutor.id,
                label: tutor.name
              }))}
            />

            <FormField
              control={form.control}
              name='timezone'
              id='group-timezone'
              label='المنطقة الزمنية'
              type='select'
              placeholder='اختر المنطقة الزمنية'
              disabled={isLoading}
              options={TIMEZONES}
            />

            <FormField
              control={form.control}
              name='status'
              id='group-status'
              label='الحالة'
              type='select'
              disabled={isLoading}
              options={groupStatusOptions}
            />

            <div className='space-y-2'>
              <Typography as='div' size='sm'>
                الأيام
              </Typography>
              <Controller
                control={form.control}
                name='selectedDays'
                render={({ field }) => (
                  <div className='grid grid-cols-4 gap-2'>
                    {dayNames.map((day, dayIndex) => {
                      const isSelected = field.value.includes(dayIndex);
                      return (
                        <Button
                          key={day}
                          type='button'
                          variant={isSelected ? 'solid' : 'outline'}
                          color={isSelected ? 'primary' : 'muted'}
                          onClick={() => {
                            if (isSelected) {
                              field.onChange(
                                field.value.filter(
                                  (value) => value !== dayIndex
                                )
                              );
                              return;
                            }
                            field.onChange(
                              [...field.value, dayIndex].sort((a, b) => a - b)
                            );
                          }}
                          disabled={isLoading}
                        >
                          {day}
                        </Button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <Controller
                control={form.control}
                name='time'
                render={({ field }) => (
                  <div className='space-y-2'>
                    <Typography as='div' size='sm'>
                      الوقت
                    </Typography>
                    <Input
                      type='time'
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name='durationMinutes'
                render={({ field }) => (
                  <div className='space-y-2'>
                    <Typography as='div' size='sm'>
                      المدة (دقيقة)
                    </Typography>
                    <Input
                      type='number'
                      min={15}
                      max={720}
                      step={15}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </div>
                )}
              />
            </div>

            {errorMessage ? (
              <Typography as='div' size='sm' color='danger'>
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
                إلغاء
              </Button>
              <Button type='submit' disabled={isLoading}>
                {mode === 'create' ? 'إضافة الحلقة' : 'حفظ التعديلات'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={mode === 'create' ? 'تأكيد إضافة الحلقة' : 'تأكيد حفظ التعديلات'}
        description={
          mode === 'create'
            ? 'هل تريد إنشاء الحلقة بهذه البيانات؟'
            : 'هل تريد حفظ التعديلات على الحلقة؟'
        }
        confirmText={mode === 'create' ? 'إضافة' : 'حفظ'}
        cancelText='إلغاء'
        variant='solid'
        color='primary'
        onConfirm={handleSave}
      />
    </>
  );
}
