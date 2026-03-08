import argon from 'argon2';
import { prismaSeedClient } from './seed';

async function bootstrapAdmin() {
  const hashedPassword = await argon.hash('12345678');

  await prismaSeedClient.user.upsert({
    where: { username: 'admin' },
    create: {
      username: 'admin',
      name: 'System Admin',
      role: 'ADMIN',
      password: hashedPassword,
      timezone: 'Africa/Cairo',
      notes: null,
    },
    update: {},
  });

  console.log('Bootstrap admin is ready (username: admin)');
}

bootstrapAdmin()
  .catch((error) => {
    console.error('Bootstrap admin failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prismaSeedClient.$disconnect();
  });
