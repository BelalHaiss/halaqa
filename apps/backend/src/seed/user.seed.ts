import { User, PrismaClient } from 'generated/prisma/client';
import { faker, fakerAR } from '@faker-js/faker';
import argon from 'argon2';
import { UserRole } from '@halaqa/shared';

const seedTimezones = [
  'Africa/Cairo',
  'Asia/Riyadh',
  'Asia/Dubai',
  'Europe/Istanbul',
  'America/New_York',
];

export const seedAppUser = async (username: string, role: UserRole) => {
  const user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
    name: fakerAR.person.fullName(),
    role,
    password: await argon.hash('12345678'),
    username,
    timezone: faker.helpers.arrayElement(seedTimezones),
    notes: faker.datatype.boolean(0.2) ? fakerAR.lorem.sentence() : null,
  };

  return user;
};

export async function seedUsers(args: {
  prisma: PrismaClient;
  totalTutors: number;
  totalLearners: number;
}): Promise<{ tutors: { id: string }[]; students: { id: string }[] }> {
  const staffUsers = await Promise.all([
    seedAppUser('admin', 'ADMIN'),
    seedAppUser('moderator', 'MODERATOR'),
    seedAppUser('tutor', 'TUTOR'),
    ...Array.from({ length: args.totalTutors - 1 }, (_, index) =>
      seedAppUser(`tutor${index + 2}`, 'TUTOR')
    ),
  ]);

  const learners = Array.from({ length: args.totalLearners }, () => ({
    name: fakerAR.person.fullName(),
    role: 'STUDENT' as const,
    username: null,
    password: null,
    timezone: faker.helpers.arrayElement(seedTimezones),
    notes: faker.datatype.boolean(0.45) ? fakerAR.lorem.sentence() : null,
  }));

  await args.prisma.user.createMany({
    data: [...staffUsers, ...learners],
  });

  const [tutors, students] = await args.prisma.$transaction([
    args.prisma.user.findMany({
      where: { role: 'TUTOR' },
      select: { id: true },
    }),
    args.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true },
    }),
  ]);

  return { tutors, students };
}
