import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboard.service';
import { DashboardStats, User } from '@halaqa/shared';

export const useDashboardViewModel = (user: User) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [user.id]);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await dashboardService.getStats(user.id, user.role);

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'فشل تحميل الإحصائيات');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stats,
    isLoading,
    error,
    refreshStats: loadStats
  };
};
