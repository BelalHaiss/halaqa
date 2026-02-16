import { useState } from 'react';
import { groups, generateSessions, users, dayNames } from '@/lib/mockData';
import { useApp } from '@/contexts/AppContext';
import {
  buildSessionStartedAtUTC,
  formatDate,
  getNowAsUTC,
} from '@halaqa/shared';
import {
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { withRole } from '@/hoc/withRole';

const getMonthCursorUTC = (timezone: string, utcDate: string = getNowAsUTC()): string => {
  const [year, month] = formatDate(utcDate, `ISO_DATE:${timezone}`)
    .split('-')
    .map(Number);
  const monthStart = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01`;
  return buildSessionStartedAtUTC(monthStart, timezone, 0);
};

const shiftMonthCursorUTC = (
  monthCursorUTC: string,
  timezone: string,
  months: number
): string => {
  const [year, month] = formatDate(monthCursorUTC, `ISO_DATE:${timezone}`)
    .split('-')
    .map(Number);
  const monthIndex = year * 12 + (month - 1) + months;
  const shiftedYear = Math.floor(monthIndex / 12);
  const shiftedMonth = ((monthIndex % 12) + 12) % 12 + 1;
  const shiftedISODate = `${String(shiftedYear).padStart(4, '0')}-${String(shiftedMonth).padStart(2, '0')}-01`;
  return buildSessionStartedAtUTC(shiftedISODate, timezone, 0);
};

const getMonthCalendarInfo = (
  monthCursorUTC: string,
  timezone: string
): {
  year: number;
  month: number;
  daysInMonth: number;
  startingDayOfWeek: number;
} => {
  const [year, month] = formatDate(monthCursorUTC, `ISO_DATE:${timezone}`)
    .split('-')
    .map(Number);
  const isLeapYear =
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth =
    month === 2
      ? isLeapYear
        ? 29
        : 28
      : [4, 6, 9, 11].includes(month)
        ? 30
        : 31;

  return {
    year,
    month,
    daysInMonth,
    startingDayOfWeek: Number(formatDate(monthCursorUTC, `WEEKDAY_INDEX:${timezone}`)),
  };
};

const getUTCDateForMonthDay = (
  monthCursorUTC: string,
  timezone: string,
  day: number
): string => {
  const [year, month] = formatDate(monthCursorUTC, `ISO_DATE:${timezone}`)
    .split('-')
    .map(Number);
  const isoDate = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return buildSessionStartedAtUTC(isoDate, timezone, 0);
};

const isSameMonthInTimezone = (
  firstUTC: string,
  secondUTC: string,
  timezone: string
): boolean =>
  formatDate(firstUTC, `ISO_DATE:${timezone}`).slice(0, 7) ===
  formatDate(secondUTC, `ISO_DATE:${timezone}`).slice(0, 7);

const isSameDayInTimezone = (
  firstUTC: string,
  secondUTC: string,
  timezone: string
): boolean =>
  formatDate(firstUTC, `ISO_DATE:${timezone}`) ===
  formatDate(secondUTC, `ISO_DATE:${timezone}`);

function SessionsView() {
  const { user } = useApp();
  const timezone = user?.timezone || 'Africa/Cairo';
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [monthCursorUTC, setMonthCursorUTC] = useState(() =>
    getMonthCursorUTC(timezone)
  );

  if (!user) return null;

  const sessions = generateSessions();
  const userGroups =
    user.role === 'TUTOR'
      ? groups.filter((g) => g.tutorId === user.id)
      : groups;

  const filteredSessions = sessions.filter((s) =>
    userGroups.some((g) => g.id === s.groupId)
  );

  // Get current month sessions for list view
  const monthSessions = filteredSessions
    .filter((session) =>
      isSameMonthInTimezone(session.startedAt, monthCursorUTC, timezone)
    )
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));

  // Calendar logic
  const { daysInMonth, startingDayOfWeek } = getMonthCalendarInfo(
    monthCursorUTC,
    timezone
  );

  const previousMonth = () => {
    setMonthCursorUTC((current) => shiftMonthCursorUTC(current, timezone, -1));
  };

  const nextMonth = () => {
    setMonthCursorUTC((current) => shiftMonthCursorUTC(current, timezone, 1));
  };

  const getSessionsForDate = (day: number) => {
    const dayUTC = getUTCDateForMonthDay(monthCursorUTC, timezone, day);
    return filteredSessions.filter((session) =>
      isSameDayInTimezone(session.startedAt, dayUTC, timezone)
    );
  };

  const statusLabelMap: Record<
    'COMPLETED' | 'CANCELED' | 'MISSED' | 'RESCHEDULED',
    string
  > = {
    COMPLETED: 'منتهية',
    CANCELED: 'ملغية',
    MISSED: 'فاتت',
    RESCHEDULED: 'معاد جدولتها',
  };

  const statusColorMap: Record<
    'COMPLETED' | 'CANCELED' | 'MISSED' | 'RESCHEDULED',
    string
  > = {
    COMPLETED: 'text-green-600 dark:text-green-400',
    CANCELED: 'text-red-600 dark:text-red-400',
    MISSED: 'text-red-600 dark:text-red-400',
    RESCHEDULED: 'text-blue-600 dark:text-blue-400',
  };

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
            {formatDate(monthCursorUTC, `MONTH_YEAR:${timezone}:ar-SA`)}
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
                  const dayName = dayNames[
                    Number(formatDate(session.startedAt, `WEEKDAY_INDEX:${timezone}`))
                  ];
                  const dateStr = formatDate(session.startedAt, `ISO_DATE:${timezone}`);
                  const timeStr = formatDate(session.startedAt, `TIME_SIMPLE:${timezone}`);

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
                            {timeStr}
                          </div>
                          <div
                            className={`text-xs ${statusColorMap[session.status]}`}
                          >
                            {statusLabelMap[session.status]}
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
              const dayUTC = getUTCDateForMonthDay(monthCursorUTC, timezone, day);
              const isToday = isSameDayInTimezone(dayUTC, getNowAsUTC(), timezone);

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
                    className={`text-xs md:text-sm mb-1 ${
                      isToday
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {day}
                  </div>
                  <div className='space-y-1'>
                    {daySessions.slice(0, 2).map((session) => {
                      const group = groups.find((g) => g.id === session.groupId);
                      return (
                        <Link
                          key={session.id}
                          to={`/attendance/${session.id}`}
                          className='block text-[10px] md:text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded truncate hover:bg-blue-200 dark:hover:bg-blue-900/50'
                          title={group?.name}
                        >
                          {formatDate(session.startedAt, `TIME_SIMPLE:${timezone}`)}
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

export default withRole(SessionsView, ['ADMIN', 'MODERATOR', 'TUTOR']);
