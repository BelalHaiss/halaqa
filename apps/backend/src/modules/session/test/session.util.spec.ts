import {
  buildWeekdayCandidatesForUtcRange,
  mapSessionDetails,
  mapSessionSummary,
  mapVirtualSessionDetails,
} from '../session.util';

describe('session.util', () => {
  describe('buildWeekdayCandidatesForUtcRange', () => {
    it('includes previous/current/next weekdays for a single UTC day', () => {
      const candidates = buildWeekdayCandidatesForUtcRange(
        '2026-02-20T00:00:00.000Z',
        '2026-02-20T23:59:59.999Z',
      );

      // Friday UTC -> expected { Thursday=4, Friday=5, Saturday=6 }.
      expect(new Set(candidates)).toEqual(new Set([4, 5, 6]));
    });

    it('handles multi-day ranges without duplicates', () => {
      const candidates = buildWeekdayCandidatesForUtcRange(
        '2026-02-20T00:00:00.000Z',
        '2026-02-22T23:59:59.999Z',
      );

      expect(candidates.length).toBe(new Set(candidates).size);
      expect(candidates.every((day) => day >= 0 && day <= 6)).toBe(true);
    });
  });

  describe('session mappers', () => {
    const baseStartedAt = new Date('2026-02-20T10:00:00.000Z');
    const originalStartedAt = new Date('2026-02-20T09:00:00.000Z');

    it('maps summary with canonical timestamps', () => {
      const summary = mapSessionSummary({
        groupId: 'g1',
        groupName: 'Halaqa A',
        tutorName: 'Tutor A',
        startedAt: baseStartedAt,
        sessionRecord: {
          id: 's1',
          startedAt: baseStartedAt,
          originalStartedAt,
          status: 'RESCHEDULED' as never,
        },
      });

      expect(summary.startedAt).toBe('2026-02-20T10:00:00.000Z');
      expect(summary.originalStartedAt).toBe('2026-02-20T09:00:00.000Z');
      expect(summary).not.toHaveProperty('date');
      expect(summary).not.toHaveProperty('time');
    });

    it('maps details with canonical timestamps', () => {
      const details = mapSessionDetails({
        sessionRecord: {
          id: 's1',
          startedAt: baseStartedAt,
          originalStartedAt,
          status: 'RESCHEDULED' as never,
          group: {
            id: 'g1',
            name: 'Halaqa A',
            tutor: {
              id: 't1',
              name: 'Tutor A',
            },
            students: [
              {
                user: {
                  id: 'u1',
                  name: 'Student A',
                },
              },
            ],
          },
          attendance: [
            {
              user: {
                id: 'u1',
                name: 'Student A',
              },
              status: 'ATTENDED',
              notes: null,
            },
          ],
        },
      });

      expect(details.startedAt).toBe('2026-02-20T10:00:00.000Z');
      expect(details.originalStartedAt).toBe('2026-02-20T09:00:00.000Z');
      expect(details).not.toHaveProperty('date');
      expect(details).not.toHaveProperty('time');
    });

    it('maps virtual details with startedAt and null originalStartedAt', () => {
      const details = mapVirtualSessionDetails({
        sessionId: 'virtual:g1:2026-02-20T10:00:00.000Z',
        startedAt: baseStartedAt,
        group: {
          id: 'g1',
          name: 'Halaqa A',
          tutor: {
            id: 't1',
            name: 'Tutor A',
          },
          students: [],
        },
      });

      expect(details.startedAt).toBe('2026-02-20T10:00:00.000Z');
      expect(details.originalStartedAt).toBeNull();
      expect(details).not.toHaveProperty('date');
      expect(details).not.toHaveProperty('time');
    });
  });
});
