import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useGroupsViewModel } from '../viewmodels/groups.viewmodel';
import { useApp } from '@/contexts/AppContext';
import { Plus, Users as UsersIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusDropdown } from '@/components/ui/status-dropdown';
import { PageHeader } from '@/components/ui/page-header';
import { Typography } from '@/components/ui/typography';
import { dayNames } from '@/lib/mockData';
import CreateGroupModal from '@/components/CreateGroupModal';

export const GroupsView = () => {
  const { user } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!user) return null;
  const {
    groups,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    updateGroupStatus
  } = useGroupsViewModel(user);

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

  return (
    <div>
      <PageHeader
        title='الحلقات'
        description='إدارة حلقات تحفيظ القرآن'
        actions={
          user.role === 'ADMIN' || user.role === 'MODERATOR' ? (
            <Button onClick={() => setShowCreateModal(true)} className='gap-2'>
              <Plus className='w-4 h-4' />
              <Typography as='span' size='sm'>
                إضافة حلقة
              </Typography>
            </Button>
          ) : null
        }
      />

      {/* Search */}
      <div className='mb-4'>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder='بحث عن حلقة...'
        />
      </div>

      {/* Groups Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {groups.map((group) => {
          const scheduleDays = group.scheduleDays
            .map((sd) => dayNames[sd.dayOfWeek])
            .join(' و ');

          const groupStatus = group.status;
          const canEdit = user.role === 'ADMIN' || user.role === 'MODERATOR';

          return (
            <div key={group.id} className='relative group'>
              <Link
                to={`/groups/${group.id}`}
                className='block transition-shadow hover:shadow-md'
              >
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='bg-primary/10 p-2 rounded-lg'>
                        <UsersIcon className='w-5 h-5 text-primary' />
                      </div>
                    </div>

                    <Typography as='h3' size='lg' weight='semibold' className='mb-2'>
                      {group.name}
                    </Typography>

                    <div className='space-y-1.5'>
                      <div className='flex items-center justify-between'>
                        <Typography as='div' size='xs' variant='ghost' color='muted'>
                          عدد الطلاب:
                        </Typography>
                        <Typography as='div' size='xs' weight='medium'>
                          {group.students.length}
                        </Typography>
                      </div>
                      <div className='flex items-center justify-between'>
                        <Typography as='div' size='xs' variant='ghost' color='muted'>
                          الموعد:
                        </Typography>
                        <Typography as='div' size='xs' weight='medium'>
                          {group.scheduleDays[0]?.time || 'غير محدد'}
                        </Typography>
                      </div>
                      <div className='pt-1.5 border-t border-border'>
                        <Typography as='div' size='xs' variant='ghost' color='muted'>
                          {scheduleDays}
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Status Dropdown - positioned absolutely */}
              <div
                className='absolute top-4 left-4 z-10'
                onClick={(e) => e.preventDefault()}
              >
                <StatusDropdown
                  currentStatus={groupStatus}
                  onStatusChange={(status) =>
                    updateGroupStatus(group.id, status)
                  }
                  disabled={!canEdit}
                />
              </div>
            </div>
          );
        })}
      </div>

      {groups.length === 0 && (
        <div className='text-center py-12'>
          <UsersIcon className='w-12 h-12 mx-auto mb-3 opacity-50' />
          <Typography as='div' size='sm' variant='ghost' color='muted'>
            لا توجد حلقات
          </Typography>
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};
