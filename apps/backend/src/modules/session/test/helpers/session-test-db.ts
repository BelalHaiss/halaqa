import { DatabaseService } from 'src/modules/database/database.service';

const TEST_USERNAME_PREFIX = 'session-test-';

export function buildSessionTestUsername(label: string, runId: string): string {
  return `${TEST_USERNAME_PREFIX}${label}-${runId}`;
}

export async function cleanupSessionTestData(
  prisma: DatabaseService,
): Promise<void> {
  const testUsers = await prisma.user.findMany({
    where: {
      username: {
        startsWith: TEST_USERNAME_PREFIX,
      },
    },
    select: {
      id: true,
    },
  });

  if (testUsers.length === 0) {
    return;
  }

  const userIds = testUsers.map((user) => user.id);
  const groups = await prisma.group.findMany({
    where: {
      tutorId: {
        in: userIds,
      },
    },
    select: {
      id: true,
    },
  });
  const groupIds = groups.map((group) => group.id);

  await prisma.$transaction(async (tx) => {
    if (groupIds.length > 0) {
      await tx.attendanceRecord.deleteMany({
        where: {
          session: {
            groupId: {
              in: groupIds,
            },
          },
        },
      });

      await tx.session.deleteMany({
        where: {
          groupId: {
            in: groupIds,
          },
        },
      });

      await tx.groupStudent.deleteMany({
        where: {
          groupId: {
            in: groupIds,
          },
        },
      });

      await tx.groupScheduleDay.deleteMany({
        where: {
          groupId: {
            in: groupIds,
          },
        },
      });

      await tx.group.deleteMany({
        where: {
          id: {
            in: groupIds,
          },
        },
      });
    }

    await tx.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });
  });
}
