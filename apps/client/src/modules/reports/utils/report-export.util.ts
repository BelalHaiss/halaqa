import type { SheetData } from 'write-excel-file/browser';
import { formatDateShort, GroupReportDTO } from '@halaqa/shared';
import { getAttendanceStatusConfig, getSessionStatusConfig } from '@/modules/session';

const GROUP_STATUS_LABELS: Record<GroupReportDTO['group']['status'], string> = {
  ACTIVE: 'نشطة',
  INACTIVE: 'غير نشطة',
  COMPLETED: 'مكتملة',
};

export function buildGroupReportSheetData(report: GroupReportDTO): SheetData {
  const timezone = report.group.timezone;

  const rows: SheetData = [
    ['بيانات الحلقة'],
    ['اسم الحلقة', report.group.name],
    ['المعلم', report.tutor?.name ?? 'غير محدد'],
    ['الحالة', GROUP_STATUS_LABELS[report.group.status]],
    ['المنطقة الزمنية', report.group.timezone],
    ['من تاريخ', report.period.fromDate],
    ['إلى تاريخ', report.period.toDate],
    [],
    ['المتعلمون'],
    ['الاسم', 'تاريخ الانضمام', 'تاريخ المغادرة'],
    ...report.learners.map((learner) => [
      learner.name,
      formatDateShort(learner.joinedAt, timezone),
      learner.leftAt ? formatDateShort(learner.leftAt, timezone) : 'ما زال منضمًا',
    ]),
    [],
    ['الجلسات والحضور'],
    ['تاريخ الجلسة', 'حالة الجلسة', 'اسم المتعلم', 'حالة الحضور', 'ملاحظات'],
    ...report.sessions.flatMap((session) => {
      const sessionDate = formatDateShort(session.startedAt, timezone);
      const sessionStatusLabel = getSessionStatusConfig(session.status).label;

      if (session.attendance.length === 0) {
        return [[sessionDate, sessionStatusLabel, 'لا يوجد حضور مسجل', '', '']];
      }

      return session.attendance.map((attendance) => [
        sessionDate,
        sessionStatusLabel,
        attendance.studentName,
        getAttendanceStatusConfig(attendance.status).label,
        attendance.notes ?? '',
      ]);
    }),
  ];

  return rows;
}

export function buildGroupReportFileName(report: GroupReportDTO): string {
  return `تقرير-${report.group.name}-${report.period.fromDate}-الى-${report.period.toDate}.xlsx`;
}
