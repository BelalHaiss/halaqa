import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './support/test-app';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
  });

  it('/ (GET)', () => {
    const server = app.getHttpServer() as App;
    return request(server).get('/').expect(200).expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
});
