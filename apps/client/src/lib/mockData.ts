import { Group, User, Session, AttendanceRecord } from '@halaqa/shared';

// Extended User type for mock data with groupId and joinDate (for students)
export interface StudentUser extends User {
  groupId?: string;
  joinDate?: string;
}

// Extended Group type for mock data with schedule helper
export interface GroupWithSchedule extends Omit<
  Group,
  'createdAt' | 'updatedAt'
> {
  schedule: {
    days: number[];
    time: string;
    duration: number;
  };
}

// Mock Staff Users
export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    name: 'أحمد محمود',
    email: 'admin@halaqa.com',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'fatima_mod',
    name: 'فاطمة أحمد',
    email: 'mod@halaqa.com',
    role: 'MODERATOR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    username: 'mohamed_tutor',
    name: 'محمد علي',
    email: 'tutor1@halaqa.com',
    role: 'TUTOR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    username: 'khadija_tutor',
    name: 'خديجة حسن',
    email: 'tutor2@halaqa.com',
    role: 'TUTOR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock Students (Users with STUDENT role)
export const students: StudentUser[] = [
  {
    id: 's1',
    username: 'abdullah_m',
    name: 'عبدالله محمد',
    email: 's1@students.halaqa.com',
    role: 'STUDENT',
    groupId: 'g1',
    joinDate: '2024-01-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      userId: 's1',
      phone: '0501234567',
      whatsapp: '966501234567',
      telegram: '@abdullah_m',
      notes: 'متفوق في الحفظ'
    }
  },
  {
    id: 's2',
    username: 'omar_a',
    name: 'عمر أحمد',
    email: 's2@students.halaqa.com',
    role: 'STUDENT',
    groupId: 'g1',
    joinDate: '2024-01-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      userId: 's2',
      phone: '0501234568',
      whatsapp: '966501234568'
    }
  },
  {
    id: 's3',
    username: 'yousef_k',
    name: 'يوسف خالد',
    email: 's3@students.halaqa.com',
    role: 'STUDENT',
    groupId: 'g1',
    joinDate: '2024-02-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      userId: 's3',
      phone: '0501234569',
      whatsapp: '966501234569',
      telegram: '@yousef_k'
    }
  },
  {
    id: 's4',
    username: 'ibrahim_a',
    name: 'إبراهيم عبدالرحمن',
    email: 's4@students.halaqa.com',
    role: 'STUDENT',
    groupId: 'g1',
    joinDate: '2024-02-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      userId: 's4',
      phone: '0501234570',
      whatsapp: '966501234570'
    }
  },
  {
    id: 's5',
    username: 'hamza_s',
    name: 'حمزة سعيد',
    email: 's5@students.halaqa.com',
    role: 'STUDENT',
    groupId: 'g1',
    joinDate: '2024-02-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      userId: 's5',
      phone: '0501234571',
      telegram: '@hamza_s'
    }
  },
  {
    id: 's6',
    username: 'aya_m',
    name: 'آية محمود',
    email: 's6@students.halaqa.com',
    role: 'STUDENT',
    groupId: 'g2',
    joinDate: '2024-01-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      userId: 's6',
      phone: '0501234572',
      whatsapp: '966501234572',
      notes: 'حافظة لجزء عم'
    }
  },
  {
    id: 's7',
    username: 'mariam_a',
    name: 'مريم عبدالله',
    email: 's7@students.halaqa.com',
    role: 'STUDENT',
    groupId: 'g2',
    joinDate: '2024-01-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      userId: 's7',
      phone: '0501234573',
      whatsapp: '966501234573',
      telegram: '@mariam_a'
    }
  },
  {
    id: 's8',
    username: 'sara_a',
    name: 'سارة أحمد',
    email: 's8@students.halaqa.com',
    role: 'STUDENT',
    groupId: 'g2',
    joinDate: '2024-01-25',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      userId: 's8',
      phone: '0501234574',
      whatsapp: '966501234574'
    }
  },
  {
    id: 's9',
    username: 'zainab_a',
    name: 'زينب علي',
    email: 's9@students.halaqa.com',
    role: 'STUDENT',
    groupId: 'g2',
    joinDate: '2024-02-05',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      userId: 's9',
      phone: '0501234575',
      whatsapp: '966501234575',
      telegram: '@zainab_a'
    }
  },
  {
    id: 's10',
    username: 'ruqayyah_h',
    name: 'رقية حسن',
    email: 's10@students.halaqa.com',
    role: 'STUDENT',
    groupId: 'g3',
    joinDate: '2024-01-08',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      userId: 's10',
      phone: '0501234576',
      whatsapp: '966501234576'
    }
  },
  {
    id: 's11',
    username: 'nooraldin',
    name: 'نور الدين',
    email: 's11@students.halaqa.com',
    role: 'STUDENT',
    groupId: 'g3',
    joinDate: '2024-01-12',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      userId: 's11',
      phone: '0501234577',
      telegram: '@noor_d'
    }
  },
  {
    id: 's12',
    username: 'asmaa_k',
    name: 'أسماء خالد',
    email: 's12@students.halaqa.com',
    role: 'STUDENT',
    groupId: 'g3',
    joinDate: '2024-01-18',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      userId: 's12',
      phone: '0501234578',
      whatsapp: '966501234578',
      telegram: '@asmaa_k',
      notes: 'مميزة في التجويد'
    }
  }
];

// Mock Groups
export const groups: GroupWithSchedule[] = [
  {
    id: 'g1',
    name: 'حلقة الفجر للأطفال',
    tutorId: '3',
    schedule: { days: [0, 2], time: '17:00', duration: 60 },
    scheduleDays: [
      { dayOfWeek: 0, time: '17:00', durationMinutes: 60 },
      { dayOfWeek: 2, time: '17:00', durationMinutes: 60 }
    ],
    students: ['s1', 's2', 's3', 's4', 's5'],
    status: 'ACTIVE'
  },
  {
    id: 'g2',
    name: 'حلقة النساء المسائية',
    tutorId: '4',
    schedule: { days: [1, 3], time: '18:30', duration: 90 },
    scheduleDays: [
      { dayOfWeek: 1, time: '18:30', durationMinutes: 90 },
      { dayOfWeek: 3, time: '18:30', durationMinutes: 90 }
    ],
    students: ['s6', 's7', 's8', 's9'],
    status: 'ACTIVE'
  },
  {
    id: 'g3',
    name: 'حلقة الشباب',
    tutorId: '3',
    schedule: { days: [4, 5], time: '20:00', duration: 60 },
    scheduleDays: [
      { dayOfWeek: 4, time: '20:00', durationMinutes: 60 },
      { dayOfWeek: 5, time: '20:00', durationMinutes: 60 }
    ],
    students: ['s10', 's11', 's12'],
    status: 'INACTIVE'
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
        const status =
          i < 0 ? 'COMPLETED' : i === 0 ? 'SCHEDULED' : 'SCHEDULED';
        sessions.push({
          id: `session-${group.id}-${dateStr}`,
          groupId: group.id,
          date: dateStr,
          time: group.schedule.time,
          status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');

  completedSessions.forEach((session) => {
    const group = groups.find((g) => g.id === session.groupId);
    if (group) {
      group.students.forEach((studentId) => {
        const random = Math.random();
        let status: 'ATTENDED' | 'MISSED' | 'EXCUSED';

        if (random < 0.8) status = 'ATTENDED';
        else if (random < 0.9) status = 'EXCUSED';
        else status = 'MISSED';

        attendance.push({
          id: `att-${session.id}-${studentId}`,
          sessionId: session.id,
          userId: studentId,
          status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
  ATTENDED: 'حضر',
  MISSED: 'غاب',
  EXCUSED: 'عذر'
};
