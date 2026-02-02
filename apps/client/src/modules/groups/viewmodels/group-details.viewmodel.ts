import { useState, useEffect } from 'react';
import { groupService } from '../services/group.service';
import { Group, User as UserType } from '@halaqa/shared';
import { StudentUser } from '@/lib/mockData';
import { toast } from 'sonner';

export const useGroupDetailsViewModel = (groupId: string) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [tutor, setTutor] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  const loadGroupDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await groupService.getGroupById(groupId);

      if (response.success && response.data) {
        setGroup(response.data);

        // Load related data
        const groupStudents = await groupService.getGroupStudents(groupId);
        setStudents(groupStudents as StudentUser[]);

        const groupTutor = await groupService.getGroupTutor(
          response.data.tutorId
        );
        setTutor(groupTutor as UserType);
      } else {
        setError(response.error || 'فشل تحميل بيانات الحلقة');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroup = async (updatedGroup: Partial<Group> & { id: string }) => {
    try {
      const response = await groupService.updateGroup(updatedGroup as any);

      if (response.success && response.data) {
        setGroup(response.data);
        toast.success('تم تحديث الحلقة بنجاح');
        return { success: true };
      } else {
        toast.error(response.error || 'فشل تحديث الحلقة');
        return { success: false };
      }
    } catch (err: any) {
      toast.error('حدث خطأ غير متوقع');
      return { success: false };
    }
  };

  return {
    group,
    students,
    tutor,
    isLoading,
    error,
    updateGroup,
    refreshGroup: loadGroupDetails
  };
};
