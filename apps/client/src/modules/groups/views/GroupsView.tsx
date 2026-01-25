import { Link } from 'react-router-dom';
import { User } from '@halaqa/shared';
import { useGroupsViewModel } from '../viewmodels/groups.viewmodel';
import { Plus, Users as UsersIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusDropdown } from '@/components/ui/status-dropdown';
import { dayNames } from '@/lib/mockData';

interface GroupsViewProps {
  user: User;
  onCreateGroup: () => void;
}

export const GroupsView = ({ user, onCreateGroup }: GroupsViewProps) => {
  const { groups, isLoading, error, searchQuery, setSearchQuery, updateGroupStatus } =
    useGroupsViewModel(user);

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

  return (
    <div>
      <div className='flex items-center justify-between mb-5'>
        <div>
          <h1 className='text-2xl text-gray-800 dark:text-gray-100 mb-1'>
            الحلقات
          </h1>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            إدارة حلقات تحفيظ القرآن
          </p>
        </div>
        {(user.role === 'admin' || user.role === 'moderator') && (
          <Button onClick={onCreateGroup} className='gap-2'>
            <Plus className='w-4 h-4' />
            إضافة حلقة
          </Button>
        )}
      </div>

      {/* Search */}
      <div className='mb-4'>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="بحث عن حلقة..."
        />
      </div>

      {/* Groups Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {groups.map((group) => {
          const scheduleDays = group.schedule.days
            .map((d) => dayNames[d])
            .join(' و ');
          
          const groupStatus = (group as any).status || 'active';
          const canEdit = user.role === 'admin' || user.role === 'moderator';

          return (
            <div key={group.id} className="relative group">
              <Link
                to={`/groups/${group.id}`}
                className='block transition-shadow hover:shadow-md'
              >
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg'>
                        <UsersIcon className='w-5 h-5 text-emerald-600 dark:text-emerald-400' />
                      </div>
                    </div>

                    <h3 className='text-lg text-gray-800 dark:text-gray-100 mb-2'>
                      {group.name}
                    </h3>

                    <div className='space-y-1.5 text-xs text-gray-600 dark:text-gray-400'>
                      <div className='flex items-center justify-between'>
                        <span>عدد الطلاب:</span>
                        <span className='text-gray-800 dark:text-gray-100'>
                          {group.students.length}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span>الموعد:</span>
                        <span className='text-gray-800 dark:text-gray-100'>
                          {group.schedule.time}
                        </span>
                      </div>
                      <div className='pt-1.5 border-t border-gray-200 dark:border-gray-700'>
                        <div className='text-xs text-gray-500 dark:text-gray-500'>
                          {scheduleDays}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Status Dropdown - positioned absolutely */}
              <div className="absolute top-4 left-4 z-10" onClick={(e) => e.preventDefault()}>
                <StatusDropdown
                  currentStatus={groupStatus}
                  onStatusChange={(status) => updateGroupStatus(group.id, status)}
                  disabled={!canEdit}
                />
              </div>
            </div>
          );
        })}
      </div>

      {groups.length === 0 && (
        <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
          <UsersIcon className='w-12 h-12 mx-auto mb-3 opacity-50' />
          <p>لا توجد حلقات</p>
        </div>
      )}
    </div>
  );
};
