import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('POST /api/v1/auth/login should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'wrong@email.com', password: 'wrong' })
        .expect(401);
    });

    it('GET /api/v1/auth/me should require auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });
  });

  describe('Dashboard (requires auth)', () => {
    it('GET /api/v1/dashboard/content should require auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/dashboard/content')
        .expect(401);
    });

    it('GET /api/v1/dashboard/users should require auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/dashboard/users')
        .expect(401);
    });

    it('GET /api/v1/dashboard/audit-logs should require auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/dashboard/audit-logs')
        .expect(401);
    });

    it('GET /api/v1/dashboard/analytics/overview should require auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/dashboard/analytics/overview')
        .expect(401);
    });
  });
});
