import { PrismaClient } from 'generated/prisma/client';

export async function cleanUpDatabase(prisma: PrismaClient): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      // Payment tables first (FK deps: transactions → payments)
      await tx.financialTransaction.deleteMany();
      await tx.learnerPayment.deleteMany();
      await tx.tutorPayment.deleteMany();
      // Session / attendance
      await tx.attendanceRecord.deleteMany();
      await tx.session.deleteMany();
      // Group membership / structure
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
