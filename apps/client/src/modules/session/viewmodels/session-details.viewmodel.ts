import { useState } from 'react';
import {
  SessionDetailsDTO,
  UpdateSessionActionDTO,
  AttendanceStatus
} from '@halaqa/shared';
import { toast } from 'sonner';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { useApiMutation } from '@/lib/hooks/useApiMutation';
import { queryClient, queryKeys } from '@/lib/query-client';
import { sessionService } from '../services/session.service';

export const useSessionDetailsViewModel = (sessionId: string) => {
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus; notes?: string }>
  >({});

  const sessionQuery = useApiQuery<SessionDetailsDTO>({
    queryKey: queryKeys.sessions.detail(sessionId),
    queryFn: async () => sessionService.getSessionDetails(sessionId)
  });

  const updateSessionMutation = useApiMutation<
    UpdateSessionActionDTO,
    SessionDetailsDTO
  >({
    mutationFn: async (payload) =>
      sessionService.updateSession(sessionId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.all
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.groups.all
      });
    },
    onError: (error) => {
      toast.error(error.message || 'فشل تحديث الجلسة');
    }
  });

  const initializeAttendanceMap = (session: SessionDetailsDTO) => {
    const map: Record<string, { status: AttendanceStatus; notes?: string }> =
      {};
    session.attendance.forEach((att) => {
      map[att.studentId] = {
        status: att.status,
        notes: att.notes
      };
    });
    setAttendanceMap(map);
  };

  const updateAttendanceStatus = (
    studentId: string,
    status: AttendanceStatus
  ) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const updateAttendanceNotes = (studentId: string, notes: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const saveAttendance = async () => {
    const attendance = Object.entries(attendanceMap).map(
      ([studentId, data]) => ({
        studentId,
        status: data.status,
        notes: data.notes
      })
    );

    await updateSessionMutation.mutateAsync({
      action: 'ATTENDANCE',
      attendance
    });

    toast.success('تم حفظ الحضور بنجاح');
  };

  const cancelSession = async () => {
    await updateSessionMutation.mutateAsync({
      action: 'CANCEL'
    });

    toast.success('تم إلغاء الجلسة بنجاح');
  };

  const rescheduleSession = async (date: string, time: string) => {
    await updateSessionMutation.mutateAsync({
      action: 'RESCHEDULE',
      date: date as any,
      time: time as any
    });

    toast.success('تم إعادة جدولة الجلسة بنجاح');
  };

  return {
    session: sessionQuery.data?.data ?? null,
    isLoading: sessionQuery.isPending,
    error: sessionQuery.error?.message ?? null,
    attendanceMap,
    initializeAttendanceMap,
    updateAttendanceStatus,
    updateAttendanceNotes,
    saveAttendance,
    cancelSession,
    rescheduleSession,
    isUpdating: updateSessionMutation.isPending
  };
};
