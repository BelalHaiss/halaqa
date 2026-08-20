import argon from 'argon2';
import { normalizeArabic } from '@halaqa/shared';
import { prismaSeedClient } from './seed';

async function bootstrapAdmin() {
  const hashedPassword = await argon.hash('12345678');
  const adminPhone = '+201000000001';

  await prismaSeedClient.user.upsert({
    where: { phone: adminPhone },
    create: {
      phone: adminPhone,
      name: 'System Admin',
      nameNormalized: normalizeArabic('System Admin'),
      role: 'ADMIN',
      password: hashedPassword,
      timezone: 'Africa/Cairo',
      notes: null,
    },
    update: {},
  });

  console.log(`Bootstrap admin is ready (phone: ${adminPhone})`);
}

bootstrapAdmin()
  .catch((error) => {
    console.error('Bootstrap admin failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prismaSeedClient.$disconnect();
  });
