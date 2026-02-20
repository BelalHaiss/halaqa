import { existsSync } from 'node:fs';
import { join } from 'node:path';
import dotenv from 'dotenv';
import { applyDedicatedTestDatabaseEnvOrThrow } from './test-db-env';

/**
 * Global Jest bootstrap:
 * 1) Load environment files for tests (.env.test then .env).
 * 2) Enforce dedicated test database env mapping.
 */
const projectRoot = join(__dirname, '..', '..');
const envTestPath = join(projectRoot, '.env.test');
const envPath = join(projectRoot, '.env');

if (existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath, override: true, quiet: true });
}

if (existsSync(envPath)) {
  dotenv.config({ path: envPath, quiet: true });
}

applyDedicatedTestDatabaseEnvOrThrow();
