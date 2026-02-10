import { useDashboardViewModel } from '../viewmodels/dashboard.viewmodel';
import { useApp } from '@/contexts/AppContext';
import {
  Users as UsersIcon,
  Calendar,
  AlertCircle,
  BookOpen,
  Loader2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';

export const DashboardView = () => {
  const { user } = useApp();

  if (!user) return null;
  const { stats, isLoading, error } = useDashboardViewModel(user);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='soft' color='danger'>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <PageHeader title={`مرحباً، ${user.name}`} description='نظرة عامة على اليوم' />

      {/* Stats Cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5'>
        <MetricCard
          color='primary'
          icon={<Calendar className='w-4 h-4' />}
          value={stats.todaySessions}
          label='جلسات اليوم'
        />
        <MetricCard
          color='success'
          icon={<BookOpen className='w-4 h-4' />}
          value={stats.totalGroups}
          label='إجمالي الحلقات'
        />
        <MetricCard
          color='muted'
          icon={<UsersIcon className='w-4 h-4' />}
          value={stats.totalStudents}
          label='عدد الطلاب'
        />
        <MetricCard
          color='danger'
          icon={<AlertCircle className='w-4 h-4' />}
          value={stats.studentsNeedingFollowUp}
          label='يحتاجون متابعة'
        />
      </div>
    </div>
  );
};
