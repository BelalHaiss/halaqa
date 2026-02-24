import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { fromUTC, getNowAsUTC, getStartAndEndOfDay } from '@halaqa/shared';
import { DatabaseModule } from 'src/modules/database/database.module';
import { DatabaseService } from 'src/modules/database/database.service';
import { SessionModule } from '../session.module';
import { SessionService } from '../session.service';
import {
  cleanupSessionTestData,
  createSessionTestGroupWithScheduleFromUtc,
  createSessionTestTutor,
} from './helpers/session-test-db';

function toScheduleDayOfWeek(weekday: number): number {
  return weekday === 7 ? 0 : weekday;
}

function buildRunId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

describe('SessionService (integration)', () => {
  jest.setTimeout(30_000);

  let moduleRef: TestingModule;
  let sessionService: SessionService;
  let prisma: DatabaseService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
        }),

        DatabaseModule,
        SessionModule,
      ],
    }).compile();

    sessionService = moduleRef.get(SessionService);
    prisma = moduleRef.get(DatabaseService);
  });

  beforeEach(async () => {
    await cleanupSessionTestData(prisma);
  });

  afterAll(async () => {
    try {
      await cleanupSessionTestData(prisma);
      await prisma.$disconnect();
    } finally {
      if (moduleRef) {
        await moduleRef.close();
      }
    }
  });

  it('finds group scheduled in group timezone even when tutor current weekday is different', async () => {
    const runId = buildRunId();
    const tutorTimezone = 'Pacific/Kiritimati';
    const groupTimezone = 'Pacific/Honolulu';
    const tutor = await createSessionTestTutor({
      prisma,
      runId,
      name: 'Timezone Tutor',
      timezone: tutorTimezone,
    });

    const { startAsDatetime } = getStartAndEndOfDay(tutorTimezone);
    const plannedUtcIso = startAsDatetime.plus({ hours: 8 }).toUTC().toISO();
    if (!plannedUtcIso) {
      throw new Error('Failed to build plannedUtcIso for timezone test.');
    }

    const tutorDayOfWeek = toScheduleDayOfWeek(
      fromUTC(plannedUtcIso, tutorTimezone).weekday,
    );
    const groupDayOfWeek = toScheduleDayOfWeek(
      fromUTC(plannedUtcIso, groupTimezone).weekday,
    );
    expect(tutorDayOfWeek).not.toBe(groupDayOfWeek);

    const group = await createSessionTestGroupWithScheduleFromUtc({
      prisma,
      runId,
      tutorId: tutor.id,
      timezone: groupTimezone,
      scheduledUtcIso: plannedUtcIso,
    });

    const sessions = await sessionService.getTodaySessions(tutor);

    expect(sessions).toHaveLength(1);
    expect(sessions[0].groupName).toBe(group.name);
    expect(sessions[0].startedAt).toBe(plannedUtcIso);
  });

  it('markMissedSessions creates one MISSED record for an overdue planned session', async () => {
    const runId = buildRunId();
    const tutor = await createSessionTestTutor({
      prisma,
      runId,
      name: 'Missed Tutor',
      timezone: 'UTC',
    });

    const scheduledUtc = fromUTC(getNowAsUTC(), 'UTC')
      .minus({ hours: 13 })
      .startOf('hour');
    const scheduledUtcIso = scheduledUtc.toISO();
    if (!scheduledUtcIso) {
      throw new Error(
        'Failed to build scheduledUtcIso for missed session test.',
      );
    }

    const group = await createSessionTestGroupWithScheduleFromUtc({
      prisma,
      runId,
      tutorId: tutor.id,
      timezone: 'UTC',
      scheduledUtcIso,
    });
    await prisma.group.update({
      where: {
        id: group.id,
      },
      data: {
        createdAt: scheduledUtc.minus({ hours: 24 }).toJSDate(),
      },
    });

    await sessionService.markMissedSessions();
    await sessionService.markMissedSessions();

    const missedSessions = await prisma.session.findMany({
      where: {
        groupId: group.id,
      },
      orderBy: {
        startedAt: 'asc',
      },
    });

    expect(missedSessions).toHaveLength(1);
    expect(missedSessions[0].status).toBe('MISSED');
    expect(missedSessions[0].startedAt.toISOString()).toBe(scheduledUtcIso);
  });
});
