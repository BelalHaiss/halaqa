import { useState } from 'react';
import { User } from '../App';
import { groups, students, users, dayNames } from '../lib/mockData';
import { Plus, Users as UsersIcon } from 'lucide-react';
import { SearchInput } from './ui/search-input';
import { StatusBadge } from './ui/status-badge';
import { Link } from 'react-router-dom';
import CreateGroupModal from './CreateGroupModal';
import { withRole } from '../hoc/withRole';

interface GroupsProps {
  user: User;
}

function Groups({ user }: GroupsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter groups based on role
  const userGroups =
    user.role === 'tutor'
      ? groups.filter((g) => g.tutorId === user.id)
      : groups;

  // Filter by search
  const filteredGroups = userGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <button
            onClick={() => setShowCreateModal(true)}
            className='flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors text-sm'
          >
            <Plus className='w-4 h-4' />
            إضافة حلقة
          </button>
        )}
      </div>

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
        {filteredGroups.map((group) => {
          const tutor = users.find((u) => u.id === group.tutorId);
          const groupStudents = students.filter((s) =>
            group.students.includes(s.id)
          );
          const scheduleDays = group.schedule.days
            .map((d) => dayNames[d])
            .join(' و ');

          return (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow overflow-hidden'
            >
              <div className='p-4'>
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
                    <span>المعلم:</span>
                    <span className='text-gray-800 dark:text-gray-100'>
                      {tutor?.name}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>عدد الطلاب:</span>
                    <span className='text-gray-800 dark:text-gray-100'>
                      {groupStudents.length}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>الموعد:</span>
                    <span className='text-gray-800 dark:text-gray-100'>
                      {group.schedule.time}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>الحالة:</span>
                    <StatusBadge
                      status={
                        group.status as
                          | 'active'
                          | 'inactive'
                          | 'suspended'
                          | 'completed'
                      }
                    />
                  </div>
                  <div className='pt-1.5 border-t border-gray-200 dark:border-gray-700'>
                    <div className='text-xs text-gray-500 dark:text-gray-500'>
                      {scheduleDays}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className='text-center py-10'>
          <UsersIcon className='w-10 h-10 text-gray-400 dark:text-gray-600 mx-auto mb-3' />
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            لا توجد حلقات
          </p>
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          user={user}
        />
      )}
    </div>
  );
}

export default withRole(Groups, ['admin', 'moderator', 'tutor']);
