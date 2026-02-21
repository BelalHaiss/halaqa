import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from 'src/modules/database/database.module';
import { DatabaseService } from 'src/modules/database/database.service';
import { GroupModule } from '../group.module';
import { GroupService } from '../group.service';

type UserRole = 'ADMIN' | 'MODERATOR' | 'TUTOR' | 'STUDENT';

describe('GroupService (integration)', () => {
  jest.setTimeout(30_000);

  let moduleRef: TestingModule;
  let groupService: GroupService;
  let prisma: DatabaseService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        GroupModule,
      ],
    }).compile();

    groupService = moduleRef.get(GroupService);
    prisma = moduleRef.get(DatabaseService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  const createUser = async (args: {
    runId: string;
    role: UserRole;
    name: string;
  }) => {
    return prisma.user.create({
      data: {
        username: `${args.role.toLowerCase()}-group-options-${args.runId}`,
        name: args.name,
        role: args.role,
        timezone: 'UTC',
      },
    });
  };

  it('returns only tutor groups for tutor users and keeps options sorted by name', async () => {
    const runId = `${Date.now()}-tutor-scope`;
    const tutor = await createUser({
      runId: `${runId}-owner`,
      role: 'TUTOR',
      name: 'Scoped Tutor',
    });
    const otherTutor = await createUser({
      runId: `${runId}-other`,
      role: 'TUTOR',
      name: 'Other Tutor',
    });

    try {
      const firstOwnedGroup = await prisma.group.create({
        data: {
          name: `Zeta ${runId}`,
          tutorId: tutor.id,
          timezone: 'UTC',
        },
      });
      const secondOwnedGroup = await prisma.group.create({
        data: {
          name: `Alpha ${runId}`,
          tutorId: tutor.id,
          timezone: 'UTC',
        },
      });
      await prisma.group.create({
        data: {
          name: `Hidden ${runId}`,
          tutorId: otherTutor.id,
          timezone: 'UTC',
        },
      });

      const options = await groupService.getGroupOptions(tutor);

      expect(options).toHaveLength(2);
      expect(options).toStrictEqual([
        { name: secondOwnedGroup.name, value: secondOwnedGroup.id },
        { name: firstOwnedGroup.name, value: firstOwnedGroup.id },
      ]);
      expect(options.every((item) => Object.keys(item).length === 2)).toBe(
        true,
      );
    } finally {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: [tutor.id, otherTutor.id],
          },
        },
      });
    }
  });

  it('returns all groups for admins and moderators', async () => {
    const runId = `${Date.now()}-admin-mod`;
    const tutor = await createUser({
      runId: `${runId}-tutor`,
      role: 'TUTOR',
      name: 'Options Tutor',
    });
    const admin = await createUser({
      runId: `${runId}-admin`,
      role: 'ADMIN',
      name: 'Options Admin',
    });
    const moderator = await createUser({
      runId: `${runId}-moderator`,
      role: 'MODERATOR',
      name: 'Options Moderator',
    });

    try {
      const groupA = await prisma.group.create({
        data: {
          name: `Bravo ${runId}`,
          tutorId: tutor.id,
          timezone: 'UTC',
        },
      });
      const groupB = await prisma.group.create({
        data: {
          name: `Charlie ${runId}`,
          tutorId: tutor.id,
          timezone: 'UTC',
        },
      });

      const adminOptions = await groupService.getGroupOptions(admin);
      const moderatorOptions = await groupService.getGroupOptions(moderator);

      expect(adminOptions).toEqual(
        expect.arrayContaining([
          { name: groupA.name, value: groupA.id },
          { name: groupB.name, value: groupB.id },
        ]),
      );
      expect(moderatorOptions).toEqual(
        expect.arrayContaining([
          { name: groupA.name, value: groupA.id },
          { name: groupB.name, value: groupB.id },
        ]),
      );
    } finally {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: [tutor.id, admin.id, moderator.id],
          },
        },
      });
    }
  });
});
