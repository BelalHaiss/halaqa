import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createTutorPaymentSchema,
  CreateTutorPaymentDto,
  TutorPaymentPreviewDto,
} from '@halaqa/shared';
import z from 'zod';
import { toast } from 'sonner';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryClient, queryKeys } from '@/lib/query-client';
import { paymentService } from '../services/payment.service';

const schema = createTutorPaymentSchema('ar');
type FormValues = z.input<typeof schema>;
type PreviewKey = { tutorId: string; periodFrom: string; periodTo: string };

export function useCreateTutorPaymentViewModel({
  open,
  defaultTutorId,
}: {
  open: boolean;
  defaultTutorId?: string;
}) {
  const [preview, setPreview] = useState<TutorPaymentPreviewDto | null>(null);
  const [previewedFor, setPreviewedFor] = useState<PreviewKey | null>(null);

  const form = useForm<FormValues, unknown, CreateTutorPaymentDto>({
    resolver: zodResolver(schema),
    defaultValues: { tutorId: defaultTutorId ?? '', periodFrom: '', periodTo: '' },
  });

  const tutorId = form.watch('tutorId');
  const periodFrom = form.watch('periodFrom');
  const periodTo = form.watch('periodTo');

  const latestAllowedDateQuery = useApiQuery({
    queryKey: queryKeys.payments.tutorLatestAllowedDate(tutorId),
    queryFn: () => paymentService.getTutorLatestAllowedDate(tutorId),
    enabled: open && Boolean(tutorId),
  });

  const nextAllowedFrom = latestAllowedDateQuery.data?.data.nextAllowedFrom;

  // Sync defaultTutorId into form when it changes
  useEffect(() => {
    if (defaultTutorId) form.setValue('tutorId', defaultTutorId, { shouldValidate: true });
  }, [defaultTutorId, form]);

  // Clear period and preview when tutor changes
  useEffect(() => {
    if (!tutorId) return;
    form.setValue('periodFrom', '');
    form.setValue('periodTo', '');
    setPreview(null);
    setPreviewedFor(null);
  }, [tutorId]);

  // Auto-set periodFrom once the allowed date resolves
  useEffect(() => {
    if (nextAllowedFrom) form.setValue('periodFrom', nextAllowedFrom, { shouldValidate: true });
  }, [tutorId, nextAllowedFrom]);
  // Reset everything when modal closes
  useEffect(() => {
    if (!open) {
      form.reset({ tutorId: defaultTutorId ?? '', periodFrom: '', periodTo: '' });
      setPreview(null);
      setPreviewedFor(null);
    }
  }, [open]);
  const onPreviewRef = useRef((_payload: CreateTutorPaymentDto) => {});

  const previewMutation = useApiMutation<CreateTutorPaymentDto, TutorPaymentPreviewDto>({
    mutationFn: paymentService.previewTutorPayment,
    onSuccess: (res) => setPreview(res.data),
    onError: (error) => {
      setPreview(null);
      setPreviewedFor(null);
      toast.error(error.message);
    },
  });

  const createMutation = useApiMutation<CreateTutorPaymentDto, unknown>({
    mutationFn: paymentService.createTutorPayment,
    onSuccess: async () => {
      toast.success('تم إنشاء أجور المعلم بنجاح');
      setPreview(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  onPreviewRef.current = (payload) => {
    setPreviewedFor({
      tutorId: payload.tutorId,
      periodFrom: payload.periodFrom,
      periodTo: payload.periodTo,
    });
    previewMutation.mutate(payload);
  };

  const isPreviewFresh =
    preview != null &&
    preview.breakdowns.length > 0 &&
    !previewMutation.isPending &&
    previewedFor?.tutorId === tutorId &&
    previewedFor?.periodFrom === periodFrom &&
    previewedFor?.periodTo === periodTo;

  const hasNoSessions =
    preview != null &&
    preview.breakdowns.length === 0 &&
    !previewMutation.isPending &&
    previewedFor?.tutorId === tutorId &&
    previewedFor?.periodFrom === periodFrom &&
    previewedFor?.periodTo === periodTo;

  const triggerPreviewIfReady = (values: FormValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success || parsed.data.periodFrom > parsed.data.periodTo) return;
    onPreviewRef.current(parsed.data);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) return;
    await createMutation.mutateAsync(parsed.data);
  });

  const isDatePickerAllowed =
    !latestAllowedDateQuery.isPending && !nextAllowedFrom && Boolean(tutorId);

  return {
    form,
    tutorId,
    periodFrom,
    periodTo,
    nextAllowedFrom,
    isLoadingLatestDate: latestAllowedDateQuery.isPending && Boolean(tutorId),
    isDatePickerAllowed,
    preview,
    isPreviewFresh,
    hasNoSessions,
    isPreviewLoading: previewMutation.isPending,
    isSubmitting: createMutation.isPending,
    defaultTutorId,
    triggerPreviewIfReady,
    handleSubmit,
  };
}
