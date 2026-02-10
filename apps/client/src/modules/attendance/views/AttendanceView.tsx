import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { groups, students, generateSessions, dayNames } from '@/lib/mockData';
import { ArrowRight, Save, CheckCircle2, User as UserIcon } from 'lucide-react';
import StudentProfile from '@/components/StudentProfile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

export default function AttendanceView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [attendance, setAttendance] = useState<
    Record<string, { status: string; notes: string }>
  >({});
  const [saved, setSaved] = useState(false);
  const [showStudentProfile, setShowStudentProfile] = useState<string | null>(
    null
  );

  const sessions = generateSessions();
  const session = sessions.find((s) => s.id === sessionId);
  const group = session ? groups.find((g) => g.id === session.groupId) : null;
  const sessionStudents = group
    ? students.filter((s) => group.students.includes(s.id))
    : [];

  useEffect(() => {
    // Initialize attendance state
    const initialAttendance: Record<string, { status: string; notes: string }> =
      {};
    sessionStudents.forEach((student) => {
      initialAttendance[student.id] = { status: 'attended', notes: '' };
    });
    setAttendance(initialAttendance);
  }, [sessionId]);

  if (!session || !group) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-600 dark:text-gray-400'>الجلسة غير موجودة</p>
        <Link
          to='/sessions'
          className='text-emerald-600 hover:text-emerald-700 mt-4 inline-block'
        >
          العودة للسجل
        </Link>
      </div>
    );
  }

  const sessionDate = new Date(session.date);
  const dayName = dayNames[sessionDate.getDay()];
  const dateStr = sessionDate.toLocaleDateString('ar-SA');

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
    setSaved(false);
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes }
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const attendanceButtons = [
    {
      value: 'attended',
      label: 'حضر',
      color:
        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700'
    },
    {
      value: 'late',
      label: 'تأخر',
      color:
        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700'
    },
    {
      value: 'excused',
      label: 'عذر',
      color:
        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700'
    },
    {
      value: 'missed',
      label: 'غاب',
      color:
        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className='mb-8'>
        <Link
          to='/sessions'
          className='flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4'
        >
          <ArrowRight className='w-5 h-5' />
          العودة للسجل
        </Link>
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
          <h1 className='text-2xl text-gray-800 dark:text-gray-100 mb-4'>
            {group.name}
          </h1>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
            <div>
              <span className='text-gray-600 dark:text-gray-400'>
                التاريخ:{' '}
              </span>
              <span className='text-gray-800 dark:text-gray-100'>
                {dateStr} ({dayName})
              </span>
            </div>
            <div>
              <span className='text-gray-600 dark:text-gray-400'>الوقت: </span>
              <span className='text-gray-800 dark:text-gray-100'>
                {session.time}
              </span>
            </div>
            <div>
              <span className='text-gray-600 dark:text-gray-400'>
                عدد الطلاب:{' '}
              </span>
              <span className='text-gray-800 dark:text-gray-100'>
                {sessionStudents.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl text-gray-800 dark:text-gray-100'>
            تسجيل الحضور
          </h2>
        </div>

        <div className='p-6'>
          <div className='space-y-6'>
            {sessionStudents.map((student) => (
              <div
                key={student.id}
                className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'
              >
                <div className='flex items-start gap-3 mb-4'>
                  <Dialog
                    open={showStudentProfile === student.id}
                    onOpenChange={(open) =>
                      setShowStudentProfile(open ? student.id : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <button className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'>
                        <UserIcon className='w-5 h-5 text-gray-600 dark:text-gray-400' />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>ملف الطالب</DialogTitle>
                      </DialogHeader>
                      <div className='py-4'>
                        <StudentProfile student={student} />
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className='flex-1'>
                    <div className='text-lg text-gray-800 dark:text-gray-100 mb-1'>
                      {student.name}
                    </div>
                    <StudentProfile student={student} compact />
                  </div>
                </div>

                <div className='grid grid-cols-2 md:grid-cols-4 gap-2 mb-4'>
                  {attendanceButtons.map((button) => (
                    <button
                      key={button.value}
                      onClick={() =>
                        handleStatusChange(student.id, button.value)
                      }
                      className={`py-3 rounded-lg border-2 transition-all ${
                        attendance[student.id]?.status === button.value
                          ? button.color + ' shadow-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {button.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className='block text-sm text-gray-600 dark:text-gray-400 mb-2'>
                    ملاحظات (اختياري)
                  </label>
                  <input
                    type='text'
                    value={attendance[student.id]?.notes || ''}
                    onChange={(e) =>
                      handleNotesChange(student.id, e.target.value)
                    }
                    placeholder='أضف ملاحظة...'
                    className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100'
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className='p-6 border-t border-gray-200 dark:border-gray-700'>
          <button
            onClick={handleSave}
            className='w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-lg transition-colors flex items-center justify-center gap-2'
          >
            {saved ? (
              <>
                <CheckCircle2 className='w-5 h-5' />
                تم الحفظ بنجاح
              </>
            ) : (
              <>
                <Save className='w-5 h-5' />
                حفظ الحضور وإغلاق الجلسة
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
