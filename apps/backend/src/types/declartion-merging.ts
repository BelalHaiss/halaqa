/* eslint-disable @typescript-eslint/no-empty-object-type */

import { User } from 'generated/prisma/client';

/* eslint-disable @typescript-eslint/no-namespace */
export type EnvVariables = {
  DATABASE_URL: string;
  DATABASE_HOST: string;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  DATABASE_PORT: string;
  JWT_SECRET: string;
};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvVariables {}
  }
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
