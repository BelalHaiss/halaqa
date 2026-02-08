import { PrismaClient } from 'generated/prisma/client';
import { seededAdminData } from './user.seed';
import { mariaDbAdapter } from 'src/modules/database/database.util';

const prisma = new PrismaClient({ adapter: mariaDbAdapter });

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
