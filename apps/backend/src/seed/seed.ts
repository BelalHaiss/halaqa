import { PrismaClient } from 'generated/prisma/client';
import { seededAdminData } from './user.seed';
import { createMariaDbAdapter } from 'src/modules/database/database.util';

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
