import { useState, useEffect } from 'react';
import { groupService } from '../services/group.service';
import { Group, Student, User as UserType, UpdateGroup } from '@halaqa/shared';
import { toast } from 'sonner';

export const useGroupDetailsViewModel = (groupId: string) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
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
        setStudents(groupStudents as Student[]);

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

  const updateGroup = async (updatedGroup: UpdateGroup) => {
    try {
      const response = await groupService.updateGroup(updatedGroup);

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
