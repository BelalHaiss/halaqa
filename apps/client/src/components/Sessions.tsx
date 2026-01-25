import { useState } from 'react';
import { User } from '../App';
import { groups, generateSessions, users, dayNames } from '../lib/mockData';
import {
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { withRole } from '../hoc/withRole';

interface SessionsProps {
  user: User;
}

function Sessions({ user }: SessionsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());

  const sessions = generateSessions();
  const userGroups =
    user.role === 'tutor'
      ? groups.filter((g) => g.tutorId === user.id)
      : groups;

  const filteredSessions = sessions.filter((s) =>
    userGroups.some((g) => g.id === s.groupId)
  );

  // Get current month sessions for list view
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthSessions = filteredSessions
    .filter((s) => {
      const sessionDate = new Date(s.date);
      return (
        sessionDate.getMonth() === currentMonth &&
        sessionDate.getFullYear() === currentYear
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const getSessionsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredSessions.filter((s) => s.date === dateStr);
  };

  const monthNames = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر'
  ];

  return (
    <div>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5'>
        <div>
          <h1 className='text-2xl text-gray-800 dark:text-gray-100 mb-1'>
            السجل
          </h1>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            سجل الجلسات السابقة
          </p>
        </div>

        <div className='flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg'>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-sm ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <List className='w-4 h-4' />
            <span>قائمة</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-sm ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <CalendarIcon className='w-4 h-4' />
            <span>تقويم</span>
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-4'>
        <div className='flex items-center justify-between'>
          <button
            onClick={nextMonth}
            className='p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
          >
            <ChevronLeft className='w-5 h-5' />
          </button>
          <h2 className='text-lg text-gray-800 dark:text-gray-100'>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={previousMonth}
            className='p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
          >
            <ChevronRight className='w-5 h-5' />
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='p-4'>
            {monthSessions.length === 0 ? (
              <div className='text-center py-6 text-sm text-gray-500 dark:text-gray-400'>
                لا توجد جلسات في هذا الشهر
              </div>
            ) : (
              <div className='space-y-2'>
                {monthSessions.map((session) => {
                  const group = groups.find((g) => g.id === session.groupId);
                  const tutor = users.find((u) => u.id === group?.tutorId);
                  const sessionDate = new Date(session.date);
                  const dayName = dayNames[sessionDate.getDay()];
                  const dateStr = sessionDate.toLocaleDateString('ar-SA');

                  return (
                    <Link
                      key={session.id}
                      to={`/attendance/${session.id}`}
                      className='flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors gap-2'
                    >
                      <div className='flex-1'>
                        <div className='text-sm text-gray-800 dark:text-gray-100 mb-0.5'>
                          {group?.name}
                        </div>
                        <div className='text-xs text-gray-600 dark:text-gray-400'>
                          المعلم: {tutor?.name}
                        </div>
                      </div>
                      <div className='flex items-center justify-between sm:justify-end gap-3'>
                        <div className='text-center'>
                          <div className='text-xs text-gray-600 dark:text-gray-400'>
                            {dayName}
                          </div>
                          <div className='text-sm text-gray-800 dark:text-gray-100'>
                            {dateStr}
                          </div>
                        </div>
                        <div className='text-left'>
                          <div className='text-sm text-gray-800 dark:text-gray-100'>
                            {session.time}
                          </div>
                          <div
                            className={`text-xs ${
                              session.status === 'done'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {session.status === 'done' ? 'منتهية' : 'ملغية'}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4'>
          <div className='grid grid-cols-7 gap-2 mb-2'>
            {dayNames.map((day) => (
              <div
                key={day}
                className='text-center text-xs md:text-sm text-gray-600 dark:text-gray-400 py-2'
              >
                {day}
              </div>
            ))}
          </div>
          <div className='grid grid-cols-7 gap-1 md:gap-2'>
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className='aspect-square' />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const daySessions = getSessionsForDate(day);
              const today = new Date();
              const isToday =
                day === today.getDate() &&
                currentDate.getMonth() === today.getMonth() &&
                currentDate.getFullYear() === today.getFullYear();

              return (
                <div
                  key={day}
                  className={`aspect-square border rounded-lg p-1 md:p-2 ${
                    isToday
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div
                    className={`text-xs md:text-sm mb-1 ${isToday ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    {day}
                  </div>
                  <div className='space-y-1'>
                    {daySessions.slice(0, 2).map((session) => {
                      const group = groups.find(
                        (g) => g.id === session.groupId
                      );
                      return (
                        <Link
                          key={session.id}
                          to={`/attendance/${session.id}`}
                          className='block text-[10px] md:text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded truncate hover:bg-blue-200 dark:hover:bg-blue-900/50'
                          title={group?.name}
                        >
                          {session.time}
                        </Link>
                      );
                    })}
                    {daySessions.length > 2 && (
                      <div className='text-[10px] md:text-xs text-gray-500 dark:text-gray-400'>
                        +{daySessions.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default withRole(Sessions, ['admin', 'moderator', 'tutor']);
