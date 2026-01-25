import {
  Group,
  Student,
  User,
  Session,
  AttendanceRecord
} from '@halaqa/shared';

export interface Schedule {
  days: number[]; // 0 = Sunday, 6 = Saturday
  time: string; // HH:mm format
  duration: number; // in minutes
}

// Mock Users
export const users: User[] = [
  { id: '1', name: 'أحمد محمود', email: 'admin@halaqa.com', role: 'admin' },
  { id: '2', name: 'فاطمة أحمد', email: 'mod@halaqa.com', role: 'moderator' },
  { id: '3', name: 'محمد علي', email: 'tutor1@halaqa.com', role: 'tutor' },
  { id: '4', name: 'خديجة حسن', email: 'tutor2@halaqa.com', role: 'tutor' }
];

// Mock Students
export const students: Student[] = [
  {
    id: 's1',
    name: 'عبدالله محمد',
    phone: '0501234567',
    whatsapp: '966501234567',
    telegram: '@abdullah_m',
    groupId: 'g1',
    joinDate: '2024-01-15',
    notes: 'متفوق في الحفظ'
  },
  {
    id: 's2',
    name: 'عمر أحمد',
    phone: '0501234568',
    whatsapp: '966501234568',
    groupId: 'g1',
    joinDate: '2024-01-20'
  },
  {
    id: 's3',
    name: 'يوسف خالد',
    phone: '0501234569',
    whatsapp: '966501234569',
    telegram: '@yousef_k',
    groupId: 'g1',
    joinDate: '2024-02-01'
  },
  {
    id: 's4',
    name: 'إبراهيم عبدالرحمن',
    phone: '0501234570',
    whatsapp: '966501234570',
    groupId: 'g1',
    joinDate: '2024-02-10'
  },
  {
    id: 's5',
    name: 'حمزة سعيد',
    phone: '0501234571',
    telegram: '@hamza_s',
    groupId: 'g1',
    joinDate: '2024-02-15'
  },
  {
    id: 's6',
    name: 'آية محمود',
    phone: '0501234572',
    whatsapp: '966501234572',
    groupId: 'g2',
    joinDate: '2024-01-10',
    notes: 'حافظة لجزء عم'
  },
  {
    id: 's7',
    name: 'مريم عبدالله',
    phone: '0501234573',
    whatsapp: '966501234573',
    telegram: '@mariam_a',
    groupId: 'g2',
    joinDate: '2024-01-15'
  },
  {
    id: 's8',
    name: 'سارة أحمد',
    phone: '0501234574',
    whatsapp: '966501234574',
    groupId: 'g2',
    joinDate: '2024-01-25'
  },
  {
    id: 's9',
    name: 'زينب علي',
    phone: '0501234575',
    whatsapp: '966501234575',
    telegram: '@zainab_a',
    groupId: 'g2',
    joinDate: '2024-02-05'
  },
  {
    id: 's10',
    name: 'رقية حسن',
    phone: '0501234576',
    whatsapp: '966501234576',
    groupId: 'g3',
    joinDate: '2024-01-08'
  },
  {
    id: 's11',
    name: 'نور الدين',
    phone: '0501234577',
    telegram: '@noor_d',
    groupId: 'g3',
    joinDate: '2024-01-12'
  },
  {
    id: 's12',
    name: 'أسماء خالد',
    phone: '0501234578',
    whatsapp: '966501234578',
    telegram: '@asmaa_k',
    groupId: 'g3',
    joinDate: '2024-01-18',
    notes: 'مميزة في التجويد'
  }
];

// Mock Groups
export const groups: Group[] = [
  {
    id: 'g1',
    name: 'حلقة الفجر للأطفال',
    tutorId: '3',
    schedule: { days: [0, 2], time: '17:00', duration: 60 },
    students: ['s1', 's2', 's3', 's4', 's5'],
    status: 'active'
  },
  {
    id: 'g2',
    name: 'حلقة النساء المسائية',
    tutorId: '4',
    schedule: { days: [1, 3], time: '18:30', duration: 90 },
    students: ['s6', 's7', 's8', 's9'],
    status: 'active'
  },
  {
    id: 'g3',
    name: 'حلقة الشباب',
    tutorId: '3',
    schedule: { days: [4, 5], time: '20:00', duration: 60 },
    students: ['s10', 's11', 's12'],
    status: 'inactive'
  }
];

// Mock Sessions (generate for current week)
export const generateSessions = (): Session[] => {
  const sessions: Session[] = [];
  const today = new Date();

  // Generate sessions for the past week and next 2 weeks
  for (let i = -7; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();

    groups.forEach((group) => {
      if (group.schedule.days.includes(dayOfWeek)) {
        const dateStr = date.toISOString().split('T')[0];
        const status = i < 0 ? 'done' : i === 0 ? 'active' : 'active';
        sessions.push({
          id: `session-${group.id}-${dateStr}`,
          groupId: group.id,
          date: dateStr,
          time: group.schedule.time,
          status
        });
      }
    });
  }

  return sessions;
};

// Mock Attendance
export const generateAttendance = (): AttendanceRecord[] => {
  const attendance: AttendanceRecord[] = [];
  const sessions = generateSessions();
  const completedSessions = sessions.filter((s) => s.status === 'done');

  completedSessions.forEach((session) => {
    const group = groups.find((g) => g.id === session.groupId);
    if (group) {
      group.students.forEach((studentId) => {
        const random = Math.random();
        let status: 'attended' | 'missed' | 'late' | 'excused';

        if (random < 0.7) status = 'attended';
        else if (random < 0.8) status = 'late';
        else if (random < 0.9) status = 'excused';
        else status = 'missed';

        attendance.push({
          studentId,
          sessionId: session.id,
          status
        });
      });
    }
  });

  return attendance;
};

export const dayNames = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

export const attendanceStatusLabels = {
  attended: 'حضر',
  missed: 'غاب',
  late: 'تأخر',
  excused: 'عذر'
};
