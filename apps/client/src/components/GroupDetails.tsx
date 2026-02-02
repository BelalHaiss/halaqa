import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User } from '@halaqa/shared';
import {
  groups,
  students,
  users,
  generateSessions,
  dayNames
} from '../lib/mockData';
import {
  ArrowRight,
  Calendar,
  Clock,
  Users as UsersIcon,
  Phone,
  UserPlus,
  Trash2
} from 'lucide-react';
import LearnerSelector from './LearnerSelector';
import { StatusBadge } from './ui/status-badge';
import { StatusDropdown } from './ui/status-dropdown';
import { Button } from './ui/button';
import { GroupStatus } from '@halaqa/shared';

interface GroupDetailsProps {
  user: User;
}

export default function GroupDetails({ user }: GroupDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const group = groups.find((g) => g.id === id);
  const [showLearnerSelector, setShowLearnerSelector] = useState(false);
  const [groupStudentIds, setGroupStudentIds] = useState<string[]>(
    group?.students || []
  );
  const [groupStatus, setGroupStatus] = useState<GroupStatus>(
    (group?.status as GroupStatus) || 'ACTIVE'
  );

  if (!group) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-600'>الحلقة غير موجودة</p>
        <Link
          to='/groups'
          className='text-emerald-600 hover:text-emerald-700 mt-4 inline-block'
        >
          العودة للحلقات
        </Link>
      </div>
    );
  }

  const tutor = users.find((u) => u.id === group.tutorId);
  const groupStudents = students.filter((s) => groupStudentIds.includes(s.id));
  const sessions = generateSessions();
  const groupSessions = sessions
    .filter((s) => s.groupId === group.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const scheduleDays = group.schedule.days.map((d) => dayNames[d]).join(' و ');

  const handleAddLearner = (studentId: string) => {
    // In a real app, this would update the backend
    setGroupStudentIds([...groupStudentIds, studentId]);
  };

  const handleRemoveLearner = (studentId: string) => {
    if (confirm('هل أنت متأكد من إزالة هذا المتعلم من الحلقة؟')) {
      setGroupStudentIds(groupStudentIds.filter((id) => id !== studentId));
    }
  };

  const handleStatusChange = (newStatus: GroupStatus) => {
    setGroupStatus(newStatus);
    // In a real app, this would update the backend
    console.log(`تم تغيير حالة الحلقة إلى: ${newStatus}`);
  };

  return (
    <div>
      {/* Header */}
      <div className='mb-8'>
        <Link
          to='/groups'
          className='flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4'
        >
          <ArrowRight className='w-5 h-5' />
          العودة للحلقات
        </Link>
        <div className='flex items-start justify-between mb-2'>
          <h1 className='text-3xl text-gray-800 dark:text-gray-100'>
            {group.name}
          </h1>
          {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
            <div className='flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                حالة الحلقة:
              </span>
              <StatusDropdown
                currentStatus={groupStatus}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}
          {user.role === 'TUTOR' && (
            <div className='flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                حالة الحلقة:
              </span>
              <StatusBadge status={groupStatus} />
            </div>
          )}
        </div>
        <p className='text-gray-600'>تفاصيل الحلقة والطلاب</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Info */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Group Info Card */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <h2 className='text-xl text-gray-800 mb-4'>معلومات الحلقة</h2>
            <div className='space-y-4'>
              <div className='flex items-start gap-4'>
                <div className='bg-emerald-100 p-2 rounded-lg'>
                  <UsersIcon className='w-5 h-5 text-emerald-600' />
                </div>
                <div className='flex-1'>
                  <div className='text-sm text-gray-600 mb-1'>المعلم</div>
                  <div className='text-gray-800'>{tutor?.name}</div>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='bg-blue-100 p-2 rounded-lg'>
                  <Calendar className='w-5 h-5 text-blue-600' />
                </div>
                <div className='flex-1'>
                  <div className='text-sm text-gray-600 mb-1'>أيام الحلقة</div>
                  <div className='text-gray-800'>{scheduleDays}</div>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='bg-purple-100 p-2 rounded-lg'>
                  <Clock className='w-5 h-5 text-purple-600' />
                </div>
                <div className='flex-1'>
                  <div className='text-sm text-gray-600 mb-1'>الوقت والمدة</div>
                  <div className='text-gray-800'>
                    {group.schedule.time} ({group.schedule.duration} دقيقة)
                  </div>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='bg-gray-100 p-2 rounded-lg'>
                  <div className='w-5 h-5 flex items-center justify-center'>
                    <div className='w-2 h-2 rounded-full bg-gray-600'></div>
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='text-sm text-gray-600 mb-1'>حالة الحلقة</div>
                  <StatusBadge status={groupStatus} />
                </div>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200'>
            <div className='p-6 border-b border-gray-200 flex items-center justify-between'>
              <h2 className='text-xl text-gray-800'>
                الطلاب ({groupStudents.length})
              </h2>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowLearnerSelector(true)}
                className='gap-2'
              >
                <UserPlus className='w-4 h-4' />
                إضافة متعلم
              </Button>
            </div>
            <div className='p-6'>
              <div className='space-y-3'>
                {groupStudents.length === 0 ? (
                  <div className='text-center py-8 text-gray-500'>
                    لا يوجد طلاب في هذه الحلقة
                  </div>
                ) : (
                  groupStudents.map((student) => (
                    <div
                      key={student.id}
                      className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center'>
                          <span className='text-gray-600 text-sm'>
                            {student.name[0]}
                          </span>
                        </div>
                        <div>
                          <div className='text-gray-800'>{student.name}</div>
                          {student.profile?.phone && (
                            <div className='text-sm text-gray-600 flex items-center gap-1'>
                              <Phone className='w-3 h-3' />
                              {student.profile.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleRemoveLearner(student.id)}
                        className='text-red-600 hover:text-red-700 hover:bg-red-50'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Upcoming Sessions */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-xl text-gray-800'>الجلسات القادمة</h2>
            </div>
            <div className='p-6'>
              <div className='space-y-3'>
                {groupSessions.slice(0, 5).map((session) => {
                  const sessionDate = new Date(session.date);
                  const dayName = dayNames[sessionDate.getDay()];
                  const dateStr = sessionDate.toLocaleDateString('ar-SA');

                  return (
                    <Link
                      key={session.id}
                      to={`/attendance/${session.id}`}
                      className='block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      <div className='text-sm text-gray-600 mb-1'>
                        {dayName}
                      </div>
                      <div className='text-gray-800 mb-1'>{dateStr}</div>
                      <div className='text-sm text-gray-600'>
                        {session.time}
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          session.status === 'COMPLETED'
                            ? 'text-green-600'
                            : session.status === 'CANCELED'
                              ? 'text-red-600'
                              : 'text-blue-600'
                        }`}
                      >
                        {session.status === 'COMPLETED'
                          ? 'منتهية'
                          : session.status === 'CANCELED'
                            ? 'ملغية'
                            : 'مجدولة'}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learner Selector */}
      <LearnerSelector
        open={showLearnerSelector}
        onOpenChange={setShowLearnerSelector}
        onSelect={handleAddLearner}
        excludeIds={groupStudentIds}
        groupId={group.id}
      />
    </div>
  );
}
