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
      <Alert className='border-danger/30 bg-danger/10 text-danger'>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <PageHeader title={`مرحباً، ${user.name}`} description='نظرة عامة على اليوم' />

      {/* Stats Cards */}
      <div className='mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4'>
        <MetricCard
          icon={<Calendar className='w-4 h-4' />}
          iconClassName='bg-primary/10 text-primary'
          value={stats.todaySessions}
          label='جلسات اليوم'
        />
        <MetricCard
          icon={<BookOpen className='w-4 h-4' />}
          iconClassName='bg-success/10 text-success'
          value={stats.totalGroups}
          label='إجمالي الحلقات'
        />
        <MetricCard
          icon={<UsersIcon className='w-4 h-4' />}
          iconClassName='bg-muted text-muted-foreground'
          value={stats.totalStudents}
          label='عدد الطلاب'
        />
        <MetricCard
          icon={<AlertCircle className='w-4 h-4' />}
          iconClassName='bg-danger/10 text-danger'
          value={stats.studentsNeedingFollowUp}
          label='يحتاجون متابعة'
        />
      </div>
    </div>
  );
};
