import { ApiResponse } from '@halaqa/shared';
import { Session } from '@halaqa/shared';

class SessionService {
  async getSessionsByGroupId(groupId: string): Promise<ApiResponse<Session[]>> {
    // Mock data for now - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockSessions: Session[] = [
          {
            id: '1',
            groupId: groupId,
            date: '2026-01-20',
            time: '09:00',
            status: 'done',
            notes: 'جلسة ممتازة، تم مراجعة سورة البقرة'
          },
          {
            id: '2',
            groupId: groupId,
            date: '2026-01-18',
            time: '09:00',
            status: 'done',
            notes: 'تم حفظ آيات جديدة'
          },
          {
            id: '3',
            groupId: groupId,
            date: '2026-01-15',
            time: '09:00',
            status: 'canceled',
            notes: 'تم إلغاء الجلسة لظروف خاصة'
          },
          {
            id: '4',
            groupId: groupId,
            date: '2026-01-13',
            time: '09:00',
            status: 'done',
            notes: 'مراجعة وتصحيح التلاوة'
          },
          {
            id: '5',
            groupId: groupId,
            date: '2026-01-10',
            time: '09:00',
            status: 'done',
            notes: 'جلسة تقويم وتقييم'
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