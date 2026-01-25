import { useState, useEffect } from 'react';
import { groupService } from '../services/group.service';
import { Group, User, CreateGroup, GroupStatus } from '@halaqa/shared';
import { toast } from 'sonner';

export const useGroupsViewModel = (currentUser: User) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await groupService.getAllGroups();

      if (response.success && response.data) {
        // Filter by user role
        const filteredGroups =
          currentUser.role === 'tutor'
            ? response.data.filter((g) => g.tutorId === currentUser.id)
            : response.data;

        setGroups(filteredGroups);
      } else {
        setError(response.error || 'فشل تحميل الحلقات');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async (group: CreateGroup) => {
    try {
      const response = await groupService.createGroup(group);

      if (response.success && response.data) {
        setGroups([...groups, response.data]);
        toast.success('تم إضافة الحلقة بنجاح');
        return { success: true };
      } else {
        toast.error(response.error || 'فشل إضافة الحلقة');
        return { success: false, error: response.error };
      }
    } catch (err: any) {
      toast.error('حدث خطأ غير متوقع');
      return { success: false, error: err.message };
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      const response = await groupService.deleteGroup(id);

      if (response.success) {
        setGroups(groups.filter((g) => g.id !== id));
        toast.success('تم حذف الحلقة بنجاح');
        return { success: true };
      } else {
        toast.error(response.error || 'فشل حذف الحلقة');
        return { success: false };
      }
    } catch (err: any) {
      toast.error('حدث خطأ غير متوقع');
      return { success: false };
    }
  };
  
  const updateGroupStatus = async (groupId: string, status: GroupStatus) => {
    try {
      const response = await groupService.updateGroupStatus(groupId, status);

      if (response.success && response.data) {
        // Update the local state
        setGroups(groups.map(g => 
          g.id === groupId ? { ...g, status } : g
        ));
        toast.success('تم تحديث حالة الحلقة بنجاح');
        return { success: true };
      } else {
        toast.error(response.error || 'فشل تحديث حالة الحلقة');
        return { success: false, error: response.error };
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ غير متوقع');
      return { success: false, error: err.message };
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    groups: filteredGroups,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    createGroup,
    deleteGroup,
    updateGroupStatus,
    refreshGroups: loadGroups
  };
};
