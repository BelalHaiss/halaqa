import { faker, fakerAR } from '@faker-js/faker';
import { GroupStatus, PrismaClient } from 'generated/prisma/client';

export type SeededGroupScheduleDay = {
  dayOfWeek: number;
  startMinutes: number;
  durationMinutes: number;
};

export type SeededGroupData = {
  name: string;
  description: string | null;
  timezone: string;
  status: GroupStatus;
  scheduleDays: SeededGroupScheduleDay[];
};

const seededGroupScheduleDays = (): SeededGroupScheduleDay[] => {
  const totalDays = faker.number.int({ min: 1, max: 3 });
  const selectedDays = faker.helpers.arrayElements(
    [0, 1, 2, 3, 4, 5, 6],
    totalDays,
  );

  return selectedDays.map((dayOfWeek) => ({
    dayOfWeek,
    startMinutes: faker.number.int({ min: 8 * 60, max: 20 * 60 }),
    durationMinutes: faker.helpers.arrayElement([45, 60, 75, 90]),
  }));
};

export const seededGroupData = (): SeededGroupData => {
  return {
    name: `حلقة ${fakerAR.person.firstName()}`,
    description: faker.datatype.boolean(0.7) ? fakerAR.lorem.sentence() : null,
    timezone: faker.helpers.arrayElement(['Africa/Cairo', 'Asia/Riyadh']),
    status: faker.helpers.arrayElement<GroupStatus>([
      'ACTIVE',
      'ACTIVE',
      'ACTIVE',
      'INACTIVE',
      'COMPLETED',
    ]),
    scheduleDays: seededGroupScheduleDays(),
  };
};

export type SeededGroupWithStudents = {
  id: string;
  timezone: string;
  scheduleDays: SeededGroupScheduleDay[];
  studentIds: string[];
};

export async function seedGroups(args: {
  prisma: PrismaClient;
  tutors: { id: string }[];
  students: { id: string }[];
  totalGroups: number;
}): Promise<SeededGroupWithStudents[]> {
  const groupsSeed = faker.helpers.multiple(seededGroupData, {
    count: args.totalGroups,
  });
  const createdGroups: SeededGroupWithStudents[] = [];

  for (const groupData of groupsSeed) {
    const group = await args.prisma.group.create({
      data: {
        name: groupData.name,
        description: groupData.description,
        tutorId: faker.helpers.arrayElement(args.tutors).id,
        timezone: groupData.timezone,
        status: groupData.status,
        scheduleDays: {
          createMany: {
            data: groupData.scheduleDays,
          },
        },
      },
    });

    const selectedStudents = faker.helpers.arrayElements(
      args.students,
      faker.number.int({
        min: 6,
        max: Math.min(14, args.students.length),
      }),
    );

    await args.prisma.groupStudent.createMany({
      data: selectedStudents.map((student) => ({
        groupId: group.id,
        userId: student.id,
      })),
      skipDuplicates: true,
    });

    createdGroups.push({
      id: group.id,
      timezone: group.timezone,
      scheduleDays: groupData.scheduleDays,
      studentIds: selectedStudents.map((student) => student.id),
    });
  }

  return createdGroups;
}
