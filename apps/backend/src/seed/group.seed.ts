import { faker, fakerAR } from '@faker-js/faker';
import { GroupStatus } from 'generated/prisma/client';

type SeededGroupScheduleDay = {
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
