import { DatabaseService } from 'src/modules/database/database.service';
import { seededScheduleDayFromUtc } from 'src/seed/session.seed';

const TEST_USERNAME_PREFIX = 'session-test-';
const TEST_GROUP_PREFIX = 'session-test-group-';

export async function createSessionTestTutor(args: {
  prisma: DatabaseService;
  runId: string;
  name: string;
  timezone: string;
}) {
  return args.prisma.user.create({
    data: {
      username: `${TEST_USERNAME_PREFIX}${args.runId}`,
      name: args.name,
      role: 'TUTOR',
      timezone: args.timezone,
    },
  });
}

export async function createSessionTestGroupWithScheduleFromUtc(args: {
  prisma: DatabaseService;
  runId: string;
  tutorId: string;
  timezone: string;
  scheduledUtcIso: string;
  durationMinutes?: number;
}) {
  return args.prisma.group.create({
    data: {
      name: `${TEST_GROUP_PREFIX}${args.runId}`,
      tutorId: args.tutorId,
      timezone: args.timezone,
      status: 'ACTIVE',
      scheduleDays: {
        create: seededScheduleDayFromUtc({
          utcIso: args.scheduledUtcIso,
          timezone: args.timezone,
          durationMinutes: args.durationMinutes,
        }),
      },
    },
  });
}

export async function cleanupSessionTestData(
  prisma: DatabaseService,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.attendanceRecord.deleteMany({
      where: {
        session: {
          group: {
            name: {
              startsWith: TEST_GROUP_PREFIX,
            },
          },
        },
      },
    });

    await tx.session.deleteMany({
      where: {
        group: {
          name: {
            startsWith: TEST_GROUP_PREFIX,
          },
        },
      },
    });

    await tx.groupStudent.deleteMany({
      where: {
        group: {
          name: {
            startsWith: TEST_GROUP_PREFIX,
          },
        },
      },
    });

    await tx.groupScheduleDay.deleteMany({
      where: {
        group: {
          name: {
            startsWith: TEST_GROUP_PREFIX,
          },
        },
      },
    });

    await tx.group.deleteMany({
      where: {
        name: {
          startsWith: TEST_GROUP_PREFIX,
        },
      },
    });

    await tx.user.deleteMany({
      where: {
        username: {
          startsWith: TEST_USERNAME_PREFIX,
        },
      },
    });
  });
}
