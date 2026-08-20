import { User, PrismaClient } from 'generated/prisma/client';
import { faker, fakerAR } from '@faker-js/faker';
import argon from 'argon2';
import { UserRole, normalizeArabic } from '@halaqa/shared';

const seedTimezones = [
  'Africa/Cairo',
  'Asia/Riyadh',
  'Asia/Dubai',
  'Europe/Istanbul',
  'America/New_York',
];

export const seedAppUser = async (phone: string, role: UserRole) => {
  const name = fakerAR.person.fullName();
  const user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
    name,
    nameNormalized: normalizeArabic(name),
    role,
    password: await argon.hash('12345678'),
    phone,
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
  const seedPhone = (index: number) => `+2010${String(index).padStart(8, '0')}`;

  const staffUsers = await Promise.all([
    seedAppUser(`+201032758989`, 'ADMIN'),
    seedAppUser(seedPhone(2), 'MODERATOR'),
    seedAppUser(seedPhone(3), 'TUTOR'),
    ...Array.from({ length: args.totalTutors - 1 }, (_, index) =>
      seedAppUser(seedPhone(index + 4), 'TUTOR')
    ),
  ]);

  const learners = Array.from({ length: args.totalLearners }, () => {
    const name = fakerAR.person.fullName();
    return {
      name,
      nameNormalized: normalizeArabic(name),
      role: 'STUDENT' as const,
      phone: null,
      password: null,
      timezone: faker.helpers.arrayElement(seedTimezones),
      notes: faker.datatype.boolean(0.45) ? fakerAR.lorem.sentence() : null,
    };
  });

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
