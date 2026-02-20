import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { fromUTC, getNowAsUTC, getStartAndEndOfDay } from '@halaqa/shared';
import { seededScheduleDayFromUtc } from 'src/seed/session.seed';
import { DatabaseModule } from 'src/modules/database/database.module';
import { DatabaseService } from 'src/modules/database/database.service';
import { SessionModule } from '../session.module';
import { SessionService } from '../session.service';
import {
  buildSessionTestUsername,
  cleanupSessionTestData,
} from './helpers/session-test-db';

describe('SessionService (integration)', () => {
  jest.setTimeout(30_000);

  let moduleRef: TestingModule;
  let sessionService: SessionService;
  let prisma: DatabaseService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
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
    await cleanupSessionTestData(prisma);
    await moduleRef.close();
  });

  it('getTodaySessions returns canonical startedAt/originalStartedAt without date/time', async () => {
    const runId = Date.now().toString();
    const tutor = await prisma.user.create({
      data: {
        username: buildSessionTestUsername('tutor', runId),
        name: 'Session Tutor',
        role: 'TUTOR',
        timezone: 'UTC',
      },
    });

    const userTimezone = 'UTC';
    const { startAsDatetime, endAsDatetime } =
      getStartAndEndOfDay(userTimezone);
    const plannedUtc = startAsDatetime.plus({ hours: 10 });
    const rescheduledUtc = plannedUtc.plus({ hours: 1 });
    const outOfWindowUtc = endAsDatetime.plus({ hours: 2 });

    const inWindowGroup = await prisma.group.create({
      data: {
        name: `Session Group In ${runId}`,
        tutorId: tutor.id,
        timezone: 'Pacific/Kiritimati',
        status: 'ACTIVE',
        scheduleDays: {
          create: seededScheduleDayFromUtc({
            utcIso: plannedUtc.toUTC().toISO()!,
            timezone: 'Pacific/Kiritimati',
          }),
        },
      },
    });

    await prisma.group.create({
      data: {
        name: `Session Group Out ${runId}`,
        tutorId: tutor.id,
        timezone: 'Pacific/Kiritimati',
        status: 'ACTIVE',
        scheduleDays: {
          create: seededScheduleDayFromUtc({
            utcIso: outOfWindowUtc.toUTC().toISO()!,
            timezone: 'Pacific/Kiritimati',
          }),
        },
      },
    });

    await prisma.session.create({
      data: {
        groupId: inWindowGroup.id,
        startedAt: rescheduledUtc.toJSDate(),
        originalStartedAt: plannedUtc.toJSDate(),
        status: 'RESCHEDULED',
      },
    });

    const sessions = await sessionService.getTodaySessions(tutor);

    expect(sessions).toHaveLength(1);
    expect(sessions[0].startedAt).toBe(rescheduledUtc.toUTC().toISO()!);
    expect(sessions[0].originalStartedAt).toBe(plannedUtc.toUTC().toISO()!);
    expect(sessions[0]).not.toHaveProperty('date');
    expect(sessions[0]).not.toHaveProperty('time');
  });

  it('markMissedSessions creates missing sessions and stays idempotent', async () => {
    const runId = Date.now().toString();
    const tutor = await prisma.user.create({
      data: {
        username: buildSessionTestUsername('tutor-missed', runId),
        name: 'Missed Tutor',
        role: 'TUTOR',
        timezone: 'UTC',
      },
    });

    const targetUtc = fromUTC(getNowAsUTC(), 'UTC')
      .minus({ hours: 13 })
      .startOf('hour');
    const groupTimezone = 'UTC';

    const group = await prisma.group.create({
      data: {
        name: `Missed Group ${runId}`,
        tutorId: tutor.id,
        timezone: groupTimezone,
        status: 'ACTIVE',
        scheduleDays: {
          create: seededScheduleDayFromUtc({
            utcIso: targetUtc.toISO()!,
            timezone: groupTimezone,
          }),
        },
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
    expect(missedSessions[0].startedAt.toISOString()).toBe(
      targetUtc.toUTC().toISO()!,
    );
  });
});
