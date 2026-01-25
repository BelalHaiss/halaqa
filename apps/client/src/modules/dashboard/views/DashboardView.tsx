import { User } from '@halaqa/shared';
import { useDashboardViewModel } from '../viewmodels/dashboard.viewmodel';
import {
  Users as UsersIcon,
  Calendar,
  AlertCircle,
  BookOpen,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardViewProps {
  user: User;
}

export const DashboardView = ({ user }: DashboardViewProps) => {
  const { stats, isLoading, error } = useDashboardViewModel(user);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin text-emerald-600' />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <div className='mb-5'>
        <h1 className='text-2xl text-gray-800 dark:text-gray-100 mb-1'>
          مرحباً، {user.name}
        </h1>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          نظرة عامة على اليوم
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5'>
        <Card>
          <CardContent className='p-3 lg:p-4'>
            <div className='flex items-center justify-between mb-2'>
              <div className='bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg'>
                <Calendar className='w-4 h-4 text-blue-600 dark:text-blue-400' />
              </div>
            </div>
            <div className='text-xl lg:text-2xl text-gray-800 dark:text-gray-100 mb-0.5'>
              {stats.todaySessions}
            </div>
            <div className='text-xs text-gray-600 dark:text-gray-400'>
              جلسات اليوم
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-3 lg:p-4'>
            <div className='flex items-center justify-between mb-2'>
              <div className='bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg'>
                <BookOpen className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
              </div>
            </div>
            <div className='text-xl lg:text-2xl text-gray-800 dark:text-gray-100 mb-0.5'>
              {stats.totalGroups}
            </div>
            <div className='text-xs text-gray-600 dark:text-gray-400'>
              إجمالي الحلقات
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-3 lg:p-4'>
            <div className='flex items-center justify-between mb-2'>
              <div className='bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg'>
                <UsersIcon className='w-4 h-4 text-purple-600 dark:text-purple-400' />
              </div>
            </div>
            <div className='text-xl lg:text-2xl text-gray-800 dark:text-gray-100 mb-0.5'>
              {stats.totalStudents}
            </div>
            <div className='text-xs text-gray-600 dark:text-gray-400'>
              عدد الطلاب
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-3 lg:p-4'>
            <div className='flex items-center justify-between mb-2'>
              <div className='bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg'>
                <AlertCircle className='w-4 h-4 text-amber-600 dark:text-amber-400' />
              </div>
            </div>
            <div className='text-xl lg:text-2xl text-gray-800 dark:text-gray-100 mb-0.5'>
              {stats.studentsNeedingFollowUp}
            </div>
            <div className='text-xs text-gray-600 dark:text-gray-400'>
              يحتاجون متابعة
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
