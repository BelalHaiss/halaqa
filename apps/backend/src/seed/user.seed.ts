import { User } from 'generated/prisma/client';
import { faker } from '@faker-js/faker';
import argon from 'argon2';

export const seededUserData = async () => {
  const user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'timezone'> = {
    name: faker.person.fullName(),
    role: faker.helpers.arrayElement([
      'ADMIN',
      'MODERATOR',
      'TUTOR',
      'STUDENT',
    ]),
    password: await argon.hash(faker.internet.password()),
    username: faker.internet.username(),
  };
  return user;
};

export const seededAdminData = async () => {
  const user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'timezone'> = {
    name: faker.person.fullName(),
    role: 'ADMIN',
    password: await argon.hash('12345678'),
    username: 'admin',
  };
  return user;
};
