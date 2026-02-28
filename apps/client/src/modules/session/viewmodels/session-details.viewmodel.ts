import {
  SessionDetailsDTO,
  UpdateSessionActionDTO,
  SessionAttendanceUpdateDTO,
  TimeMinutes,
  ISODateOnlyString,
} from '@halaqa/shared';
import { toast } from 'sonner';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import { queryClient, queryKeys } from '@/lib/query-client';
import { sessionService } from '../services/session.service';

export const useSessionDetailsViewModel = (sessionId: string) => {
  const sessionQuery = useApiQuery<SessionDetailsDTO>({
    queryKey: queryKeys.sessions.detail(sessionId),
    queryFn: async () => sessionService.getSessionDetails(sessionId),
  });

  const updateSessionMutation = useApiMutation<UpdateSessionActionDTO, SessionDetailsDTO>({
    mutationFn: async (payload) => sessionService.updateSession(sessionId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.all,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.groups.all,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'فشل تحديث الجلسة');
    },
  });

  const saveAttendance = async (attendance: SessionAttendanceUpdateDTO[]) => {
    await updateSessionMutation.mutateAsync({
      action: 'ATTENDANCE',
      attendance,
    });

    toast.success('تم حفظ الحضور بنجاح');
  };

  const cancelSession = async () => {
    await updateSessionMutation.mutateAsync({
      action: 'CANCEL',
    });

    toast.success('تم إلغاء الجلسة بنجاح');
  };

  const rescheduleSession = async (date: string, time: TimeMinutes) => {
    await updateSessionMutation.mutateAsync({
      action: 'RESCHEDULE',
      date: date as ISODateOnlyString,
      time,
    });

    toast.success('تم إعادة جدولة الجلسة بنجاح');
  };

  return {
    session: sessionQuery.data?.data ?? null,
    isLoading: sessionQuery.isPending,
    error: sessionQuery.error?.message ?? null,
    saveAttendance,
    cancelSession,
    rescheduleSession,
    isUpdating: updateSessionMutation.isPending,
  };
};
