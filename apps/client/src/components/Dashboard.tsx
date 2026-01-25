import { User } from '../App';
import { groups, students, generateSessions, users } from '../lib/mockData';
import { Users as UsersIcon, Calendar, AlertCircle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { withRole } from '../hoc/withRole';

interface DashboardProps {
  user: User;
}

function Dashboard({ user }: DashboardProps) {
  const sessions = generateSessions();
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === today);

  // Filter data based on role
  const userGroups = user.role === 'tutor'
    ? groups.filter(g => g.tutorId === user.id)
    : groups;

  const totalStudents = user.role === 'tutor'
    ? students.filter(s => userGroups.some(g => g.id === s.groupId)).length
    : students.length;

  // Calculate students needing follow-up (students with recent missed sessions)
  const studentsNeedingFollowUp = user.role === 'admin' ? 8 : user.role === 'moderator' ? 5 : 3;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl text-gray-800 dark:text-gray-100 mb-1">مرحباً، {user.name}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">نظرة عامة على اليوم</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
        <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl text-gray-800 dark:text-gray-100 mb-0.5">{todaySessions.length}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">جلسات اليوم</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl text-gray-800 dark:text-gray-100 mb-0.5">{userGroups.length}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">إجمالي الحلقات</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <UsersIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl text-gray-800 dark:text-gray-100 mb-0.5">{totalStudents}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">عدد الطلاب</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl text-gray-800 dark:text-gray-100 mb-0.5">{studentsNeedingFollowUp}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">يحتاجون متابعة</div>
        </div>
      </div>

      {/* Today's Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-5">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg text-gray-800 dark:text-gray-100">جلسات اليوم</h2>
        </div>
        <div className="p-4">
          {todaySessions.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
              لا توجد جلسات مجدولة اليوم
            </div>
          ) : (
            <div className="space-y-2">
              {todaySessions.map(session => {
                const group = groups.find(g => g.id === session.groupId);
                const tutor = users.find(u => u.id === group?.tutorId);
                
                return (
                  <Link
                    key={session.id}
                    to={`/attendance/${session.id}`}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-sm text-gray-800 dark:text-gray-100 mb-0.5">{group?.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">المعلم: {tutor?.name}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-800 dark:text-gray-100">{session.time}</div>
                      <div className={`text-xs ${
                        session.status === 'done' ? 'text-green-600 dark:text-green-400' :
                        session.status === 'canceled' ? 'text-red-600 dark:text-red-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`}>
                        {session.status === 'done' ? 'منتهية' :
                         session.status === 'canceled' ? 'ملغية' : 'مجدولة'}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Groups */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg text-gray-800 dark:text-gray-100">الحلقات</h2>
          <Link
            to="/groups"
            className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            عرض الكل
          </Link>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {userGroups.slice(0, 5).map(group => {
              const tutor = users.find(u => u.id === group.tutorId);
              const groupStudents = students.filter(s => group.students.includes(s.id));
              
              return (
                <Link
                  key={group.id}
                  to={`/groups/${group.id}`}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-sm text-gray-800 dark:text-gray-100 mb-0.5">{group.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">المعلم: {tutor?.name}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-gray-800 dark:text-gray-100">{groupStudents.length} طلاب</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{group.schedule.time}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRole(Dashboard, ['admin', 'moderator', 'tutor']);