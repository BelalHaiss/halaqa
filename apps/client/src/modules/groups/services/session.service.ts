import {
  UnifiedApiResponse,
  buildSessionStartedAtUTC,
  DEFAULT_TIMEZONE,
  getNowAsUTC,
  Session,
  timeToStartMinutes
} from '@halaqa/shared';

class SessionService {
  async getSessionsByGroupId(
    groupId: string
  ): Promise<UnifiedApiResponse<Session[]>> {
    const now = getNowAsUTC();

    // Mock data for now - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockSessions: Session[] = [
          {
            id: '1',
            groupId,
            startedAt: buildSessionStartedAtUTC(
              '2026-01-20',
              DEFAULT_TIMEZONE,
              timeToStartMinutes('09:00')
            ),
            status: 'COMPLETED',
            notes: 'جلسة ممتازة، تم مراجعة سورة البقرة',
            createdAt: now,
            updatedAt: now
          },
          {
            id: '2',
            groupId,
            startedAt: buildSessionStartedAtUTC(
              '2026-01-18',
              DEFAULT_TIMEZONE,
              timeToStartMinutes('09:00')
            ),
            status: 'COMPLETED',
            notes: 'تم حفظ آيات جديدة',
            createdAt: now,
            updatedAt: now
          },
          {
            id: '3',
            groupId,
            startedAt: buildSessionStartedAtUTC(
              '2026-01-15',
              DEFAULT_TIMEZONE,
              timeToStartMinutes('09:00')
            ),
            status: 'CANCELED',
            notes: 'تم إلغاء الجلسة لظروف خاصة',
            createdAt: now,
            updatedAt: now
          },
          {
            id: '4',
            groupId,
            startedAt: buildSessionStartedAtUTC(
              '2026-01-13',
              DEFAULT_TIMEZONE,
              timeToStartMinutes('09:00')
            ),
            status: 'COMPLETED',
            notes: 'مراجعة وتصحيح التلاوة',
            createdAt: now,
            updatedAt: now
          },
          {
            id: '5',
            groupId,
            startedAt: buildSessionStartedAtUTC(
              '2026-01-10',
              DEFAULT_TIMEZONE,
              timeToStartMinutes('09:00')
            ),
            status: 'MISSED',
            notes: 'تغيب معظم الطلاب',
            createdAt: now,
            updatedAt: now
          }
        ];

        resolve({
          success: true,
          data: mockSessions
        });
      }, 500);
    });
  }
}

export const sessionService = new SessionService();
