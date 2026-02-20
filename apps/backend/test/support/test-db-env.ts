type RequiredTestDbKey =
  | 'TEST_DATABASE_HOST'
  | 'TEST_DATABASE_USER'
  | 'TEST_DATABASE_PASSWORD'
  | 'TEST_DATABASE_NAME'
  | 'TEST_DATABASE_PORT';

const REQUIRED_TEST_DB_KEYS: RequiredTestDbKey[] = [
  'TEST_DATABASE_HOST',
  'TEST_DATABASE_USER',
  'TEST_DATABASE_PASSWORD',
  'TEST_DATABASE_NAME',
  'TEST_DATABASE_PORT',
];

export function applyDedicatedTestDatabaseEnvOrThrow(): void {
  const missing = REQUIRED_TEST_DB_KEYS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing dedicated test DB env vars: ${missing.join(', ')}`,
    );
  }

  const currentDatabaseName = process.env.DATABASE_NAME;
  const testDatabaseName = process.env.TEST_DATABASE_NAME!;

  if (currentDatabaseName && currentDatabaseName === testDatabaseName) {
    throw new Error(
      'Refusing to run integration tests: TEST_DATABASE_NAME must differ from DATABASE_NAME.',
    );
  }

  process.env.DATABASE_HOST = process.env.TEST_DATABASE_HOST!;
  process.env.DATABASE_USER = process.env.TEST_DATABASE_USER!;
  process.env.DATABASE_PASSWORD = process.env.TEST_DATABASE_PASSWORD!;
  process.env.DATABASE_NAME = testDatabaseName;
  process.env.DATABASE_PORT = process.env.TEST_DATABASE_PORT!;
}
