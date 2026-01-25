import { useState } from 'react';
import { User } from '../App';
import { groups, students, generateSessions, generateAttendance, users, attendanceStatusLabels } from '../lib/mockData';
import { TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { withRole } from '../hoc/withRole';

interface ReportsProps {
  user: User;
}

function Reports({ user }: ReportsProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  const sessions = generateSessions();
  const attendance = generateAttendance();
  const completedSessions = sessions.filter(s => s.status === 'done');

  // Calculate student attendance statistics
  const studentStats = students.map(student => {
    const studentAttendance = attendance.filter(a => a.studentId === student.id);
    const total = studentAttendance.length;
    const attended = studentAttendance.filter(a => a.status === 'attended').length;
    const late = studentAttendance.filter(a => a.status === 'late').length;
    const missed = studentAttendance.filter(a => a.status === 'missed').length;
    const excused = studentAttendance.filter(a => a.status === 'excused').length;
    
    const percentage = total > 0 ? Math.round(((attended + late) / total) * 100) : 0;
    
    // Calculate missed streak
    const recentAttendance = studentAttendance
      .sort((a, b) => {
        const sessionA = sessions.find(s => s.id === a.sessionId);
        const sessionB = sessions.find(s => s.id === b.sessionId);
        return new Date(sessionB?.date || '').getTime() - new Date(sessionA?.date || '').getTime();
      })
      .slice(0, 5);
    
    let missedStreak = 0;
    for (const att of recentAttendance) {
      if (att.status === 'missed') {
        missedStreak++;
      } else {
        break;
      }
    }

    const group = groups.find(g => g.students.includes(student.id));

    return {
      ...student,
      groupId: group?.id || '',
      groupName: group?.name || '',
      total,
      attended,
      late,
      missed,
      excused,
      percentage,
      missedStreak,
    };
  });

  // Filter by selected group
  const filteredStats = selectedGroup === 'all'
    ? studentStats
    : studentStats.filter(s => s.groupId === selectedGroup);

  // Sort by attendance percentage
  const sortedStats = [...filteredStats].sort((a, b) => b.percentage - a.percentage);

  // Calculate group statistics
  const groupStats = groups.map(group => {
    const groupStudents = students.filter(s => group.students.includes(s.id));
    const groupAttendance = attendance.filter(a => 
      groupStudents.some(s => s.id === a.studentId)
    );
    
    const total = groupAttendance.length;
    const attended = groupAttendance.filter(a => a.status === 'attended').length;
    const late = groupAttendance.filter(a => a.status === 'late').length;
    
    const percentage = total > 0 ? Math.round(((attended + late) / total) * 100) : 0;
    const tutor = users.find(u => u.id === group.tutorId);

    return {
      ...group,
      tutorName: tutor?.name || '',
      studentCount: groupStudents.length,
      percentage,
    };
  }).sort((a, b) => b.percentage - a.percentage);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl text-gray-800 dark:text-gray-100 mb-1">التقارير</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">إحصائيات الحضور والأداء</p>
      </div>

      {/* Group Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg text-gray-800 dark:text-gray-100">ملخص الحلقات</h2>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {groupStats.map(group => (
              <div key={group.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm text-gray-800 dark:text-gray-100 mb-0.5">{group.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    المعلم: {group.tutorName} • {group.studentCount} طلاب
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg text-gray-800 dark:text-gray-100">{group.percentage}%</span>
                    {group.percentage >= 80 ? (
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">نسبة الحضور</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter by Group */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4 p-4">
        <label className="block text-xs text-gray-700 dark:text-gray-300 mb-2">تصفية حسب الحلقة</label>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="all">جميع الحلقات</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      </div>

      {/* Student Attendance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg text-gray-800 dark:text-gray-100">حضور الطلاب</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-right px-3 md:px-4 py-3 text-xs text-gray-700 dark:text-gray-300">الطالب</th>
                <th className="text-right px-3 md:px-4 py-3 text-xs text-gray-700 dark:text-gray-300">الحلقة</th>
                <th className="text-center px-2 md:px-4 py-3 text-xs text-gray-700 dark:text-gray-300">حضر</th>
                <th className="text-center px-2 md:px-4 py-3 text-xs text-gray-700 dark:text-gray-300">تأخر</th>
                <th className="text-center px-2 md:px-4 py-3 text-xs text-gray-700 dark:text-gray-300">غاب</th>
                <th className="text-center px-2 md:px-4 py-3 text-xs text-gray-700 dark:text-gray-300">عذر</th>
                <th className="text-center px-2 md:px-4 py-3 text-xs text-gray-700 dark:text-gray-300">النسبة</th>
                <th className="text-center px-2 md:px-4 py-3 text-xs text-gray-700 dark:text-gray-300">التنبيه</th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map(student => (
                <tr key={student.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-3 md:px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{student.name}</td>
                  <td className="px-3 md:px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{student.groupName}</td>
                  <td className="px-2 md:px-4 py-3 text-center text-sm text-gray-800 dark:text-gray-100">{student.attended}</td>
                  <td className="px-2 md:px-4 py-3 text-center text-sm text-gray-800 dark:text-gray-100">{student.late}</td>
                  <td className="px-2 md:px-4 py-3 text-center text-sm text-gray-800 dark:text-gray-100">{student.missed}</td>
                  <td className="px-2 md:px-4 py-3 text-center text-sm text-gray-800 dark:text-gray-100">{student.excused}</td>
                  <td className="px-2 md:px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                      student.percentage >= 90 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      student.percentage >= 75 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {student.percentage}%
                    </span>
                  </td>
                  <td className="px-2 md:px-4 py-3 text-center">
                    {student.missedStreak >= 2 && (
                      <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-xs">{student.missedStreak} متتالية</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withRole(Reports, ['admin', 'moderator']);