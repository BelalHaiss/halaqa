import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { EnvVariables } from 'src/types/declartion-merging';

export function createMariaDbAdapter(
  env: Pick<
    EnvVariables,
    | 'DATABASE_HOST'
    | 'DATABASE_USER'
    | 'DATABASE_PASSWORD'
    | 'DATABASE_NAME'
    | 'DATABASE_PORT'
  >,
) {
  return new PrismaMariaDb({
    host: env.DATABASE_HOST,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    port: Number(env.DATABASE_PORT),
    allowPublicKeyRetrieval: true,
  });
}
