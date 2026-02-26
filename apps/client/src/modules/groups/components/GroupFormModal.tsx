import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateGroupDto,
  DEFAULT_TIMEZONE,
  GroupDetailsDto,
  GroupTutorSummaryDto,
  TIMEZONES,
  type TimeMinutes,
  UpdateGroupDto,
  minutesToInputTimeString,
  timeToStartMinutes
} from '@halaqa/shared';
import { FormField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Field, FieldError } from '@/components/ui/field';
import { dayNames } from '../constants';
import { createGroupSchema, updateGroupSchema } from '../schema/group.schema';
import {
  groupFormSchema,
  type GroupFormValues
} from '../schema/group-form.schema';

type BaseGroupFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutors: GroupTutorSummaryDto[];
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

const groupStatusOptions = [
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'INACTIVE', label: 'غير نشط' },
  { value: 'COMPLETED', label: 'مكتمل' }
];

const DEFAULT_GROUP_TIME = '17:00';

const buildUniformDayTimes = (time: string) =>
  Array.from({ length: dayNames.length }, () => time);

export function GroupFormModal({
  open,
  onOpenChange,
  mode,
  tutors,
  group,
  isLoading = false,
  onSubmit
}: GroupFormModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues = useMemo<GroupFormValues>(() => {
    const firstSchedule = group?.scheduleDays[0];
    const defaultTime =
      firstSchedule && Number.isFinite(firstSchedule.startMinutes)
        ? minutesToInputTimeString(firstSchedule.startMinutes as TimeMinutes)
        : DEFAULT_GROUP_TIME;
    const dayTimes = buildUniformDayTimes(defaultTime);

    for (const scheduleDay of group?.scheduleDays ?? []) {
      dayTimes[scheduleDay.dayOfWeek] = minutesToInputTimeString(
        scheduleDay.startMinutes as TimeMinutes
      );
    }

    const hasSameTimeForAllDays =
      new Set((group?.scheduleDays ?? []).map((day) => day.startMinutes))
        .size <= 1;

    return {
      name: group?.name ?? '',
      description: group?.description ?? '',
      tutorId: group?.tutorId ?? '',
      timezone: group?.timezone ?? DEFAULT_TIMEZONE,
      status: group?.status ?? 'ACTIVE',
      sameTimeForAllDays: hasSameTimeForAllDays,
      time: defaultTime,
      dayTimes,
      durationMinutes: String(firstSchedule?.durationMinutes ?? 60),
      selectedDays: group?.scheduleDays.map((day) => day.dayOfWeek) ?? []
    };
  }, [group]);

  const form = useForm<GroupFormValues>({
    values: defaultValues,
    resolver: zodResolver(groupFormSchema),
    mode: 'onTouched'
  });
  const selectedDays = form.watch('selectedDays');
  const sameTimeForAllDays = form.watch('sameTimeForAllDays');
  const dayTimes = form.watch('dayTimes');

  const canSubmit =
    !isLoading && form.formState.isDirty && form.formState.isValid;

  const handleSave = async () => {
    const values = form.getValues();

    const durationMinutes = Number(values.durationMinutes);

    const scheduleDays = [...values.selectedDays]
      .sort((a, b) => a - b)
      .map((dayOfWeek) => ({
        dayOfWeek,
        startMinutes: timeToStartMinutes(
          values.sameTimeForAllDays
            ? values.time
            : (values.dayTimes[dayOfWeek] ?? values.time)
        ),
        durationMinutes
      }));

    try {
      setErrorMessage(null);

      if (mode === 'create') {
        const payload: CreateGroupDto = {
          name: values.name.trim(),
          description: values.description?.trim() || undefined,
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
          description: values.description?.trim() || undefined,
          tutorId: values.tutorId || undefined,
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
        <DialogContent dir='rtl' className='w-full sm:max-w-xl'>
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
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className='space-y-2'
                  >
                    <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
                      {dayNames.map((day, dayIndex) => {
                        const isSelected = field.value.includes(dayIndex);
                        return (
                          <Button
                            key={day}
                            type='button'
                            variant={isSelected ? 'solid' : 'outline'}
                            color={isSelected ? 'primary' : 'muted'}
                            aria-invalid={fieldState.invalid}
                            className={
                              fieldState.invalid ? 'border-danger' : undefined
                            }
                            onClick={() => {
                              if (isSelected) {
                                field.onChange(
                                  field.value.filter(
                                    (value) => value !== dayIndex
                                  )
                                );
                                field.onBlur();
                                return;
                              }
                              const nextValue = [...field.value, dayIndex].sort(
                                (a, b) => a - b
                              );
                              field.onChange(nextValue);
                              field.onBlur();
                            }}
                            disabled={isLoading}
                          >
                            {day}
                          </Button>
                        );
                      })}
                    </div>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <div className='space-y-3 rounded-xl border border-border bg-muted/20 p-3'>
              <Controller
                control={form.control}
                name='sameTimeForAllDays'
                render={({ field }) => (
                  <Field orientation='horizontal' className='items-center'>
                    <Checkbox
                      id='group-same-time-for-days'
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true;
                        field.onChange(isChecked);
                        field.onBlur();

                        if (!isChecked) {
                          return;
                        }

                        const nextTime =
                          form.getValues('dayTimes')[selectedDays[0] ?? 0] ??
                          form.getValues('time');
                        form.setValue('time', nextTime, {
                          shouldDirty: true,
                          shouldValidate: true
                        });
                        form.setValue(
                          'dayTimes',
                          buildUniformDayTimes(nextTime),
                          {
                            shouldDirty: true,
                            shouldValidate: true
                          }
                        );
                      }}
                      disabled={isLoading}
                    />
                    <Typography as='div' size='sm'>
                      وقت موحّد
                    </Typography>
                  </Field>
                )}
              />

              {sameTimeForAllDays ? (
                <Controller
                  control={form.control}
                  name='time'
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className='space-y-2'
                    >
                      <Typography as='div' size='sm'>
                        الوقت
                      </Typography>
                      <DateTimePicker
                        mode='timeOnly'
                        time={timeToStartMinutes(field.value)}
                        onTimeChange={(nextTime) => {
                          const nextTimeString = minutesToInputTimeString(
                            nextTime as TimeMinutes
                          );
                          field.onChange(nextTimeString);
                          form.setValue(
                            'dayTimes',
                            buildUniformDayTimes(nextTimeString),
                            { shouldDirty: true, shouldValidate: true }
                          );
                        }}
                        onTimeBlur={field.onBlur}
                        invalid={fieldState.invalid}
                        disabled={isLoading}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              ) : (
                <div className='space-y-2'>
                  {selectedDays.map((dayIndex) => (
                    <div
                      key={dayNames[dayIndex]}
                      className='flex flex-col gap-2 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between'
                    >
                      <Typography as='div' size='sm' className='text-muted-foreground'>
                        {dayNames[dayIndex]}
                      </Typography>
                      <DateTimePicker
                        mode='timeOnly'
                        time={timeToStartMinutes(
                          dayTimes[dayIndex] ?? form.getValues('time')
                        )}
                        onTimeChange={(nextTime) => {
                          const nextDayTimes = [...form.getValues('dayTimes')];
                          nextDayTimes[dayIndex] = minutesToInputTimeString(
                            nextTime as TimeMinutes
                          );
                          form.setValue('dayTimes', nextDayTimes, {
                            shouldDirty: true,
                            shouldValidate: true
                          });
                        }}
                        disabled={isLoading}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Controller
              control={form.control}
              name='durationMinutes'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='space-y-2'>
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
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                    disabled={isLoading}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {errorMessage ? (
              <Typography as='div' size='sm' className='text-danger'>
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
              <Button type='submit' disabled={!canSubmit}>
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
        onConfirm={handleSave}
      />
    </>
  );
}
