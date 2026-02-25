import { PrismaClient } from 'generated/prisma/client';

export async function cleanUpDatabase(prisma: PrismaClient): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.attendanceRecord.deleteMany();
      await tx.session.deleteMany();
      await tx.groupStudent.deleteMany();
      await tx.groupScheduleDay.deleteMany();
      await tx.group.deleteMany();
      await tx.user.deleteMany();
    });
    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning database:', error);
  }
}
