import { PrismaClient } from 'generated/prisma/client';
import { seededAdminData, seededUserData } from './user.seed';
import { createMariaDbAdapter } from 'src/modules/database/database.util';
import { faker } from '@faker-js/faker';
import { seededGroupData } from './group.seed';

const prisma = new PrismaClient({
  adapter: createMariaDbAdapter({
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_USER: process.env.DATABASE_USER,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_PORT: process.env.DATABASE_PORT,
  }),
});

export const seedData = async () => {
  try {
    const adminData = await seededAdminData();
    await prisma.user.upsert({
      where: { username: adminData.username! },
      update: {},
      create: adminData,
    });
    const usersSeed = faker.helpers.multiple(seededUserData, { count: 50 });

    await prisma.user.createMany({
      data: await Promise.all(usersSeed),
    });

    const [tutors, students] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          role: 'TUTOR',
        },
        select: { id: true },
      }),
      prisma.user.findMany({
        where: {
          role: 'STUDENT',
        },
        select: { id: true },
      }),
    ]);

    if (tutors.length > 0 && students.length > 0) {
      const groupsSeed = faker.helpers.multiple(seededGroupData, { count: 12 });

      for (const groupData of groupsSeed) {
        const group = await prisma.group.create({
          data: {
            name: groupData.name,
            description: groupData.description,
            tutorId: faker.helpers.arrayElement(tutors).id,
            timezone: groupData.timezone,
            status: groupData.status,
            scheduleDays: {
              createMany: {
                data: groupData.scheduleDays,
              },
            },
          },
        });

        const totalStudentsForGroup = faker.number.int({ min: 4, max: 14 });
        const selectedStudents = faker.helpers.arrayElements(
          students,
          Math.min(totalStudentsForGroup, students.length),
        );

        await prisma.groupStudent.createMany({
          data: selectedStudents.map((student) => ({
            groupId: group.id,
            userId: student.id,
          })),
          skipDuplicates: true,
        });
      }
    }

    console.log('Data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

seedData()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
