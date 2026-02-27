import { faker, fakerAR } from '@faker-js/faker';
import { PrismaClient } from 'generated/prisma/client';
import { createMariaDbAdapter } from 'src/modules/database/database.util';
import { cleanUpDatabase } from './cleanup.seed';
import { seedGroups } from './group.seed';
import {
  ATTENDANCE_STATUS_WEIGHTS,
  MAX_SESSION_DAYS_LOOKBACK,
  SEED_NUMBER,
  SESSION_STATUS_WEIGHTS,
  TOTAL_GROUPS,
  TOTAL_LEARNERS,
  TOTAL_TUTORS,
} from './seed.constants';
import { seedSessionsAndAttendance } from './session.seed';
import { seedUsers } from './user.seed';

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
    faker.seed(SEED_NUMBER);
    fakerAR.seed(SEED_NUMBER);

    await cleanUpDatabase(prisma);

    const { tutors, students } = await seedUsers({
      prisma,
      totalTutors: TOTAL_TUTORS,
      totalLearners: TOTAL_LEARNERS,
    });

    const groups = await seedGroups({
      prisma,
      tutors,
      students,
      totalGroups: TOTAL_GROUPS,
    });

    await seedSessionsAndAttendance({
      prisma,
      groups,
      lookbackDays: MAX_SESSION_DAYS_LOOKBACK,
      sessionStatusWeights: SESSION_STATUS_WEIGHTS,
      attendanceStatusWeights: ATTENDANCE_STATUS_WEIGHTS,
    });

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
