// test/auth.e2e-spec.ts
// test/auth.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });
  
  beforeEach(async () => {
    await prisma.service.deleteMany(); 
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Registration', () => {
    it('/auth/register (POST) - should register a user', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: 'test@example.com', password: 'password123' })
          .expect(201);
      });
  
      it('/auth/register (POST) - should not register a user with a duplicate email', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: 'test@example.com', password: 'password123' });
        
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: 'test@example.com', password: 'password123' })
          .expect(403); 
      });
  });

  describe('User Login', () => {
    it('/auth/login (POST) - should log in a user and return a token', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: 'test@example.com', password: 'password123' });
  
        return request(app.getHttpServer()) // Corrected here
          .post('/auth/login')
          .send({ email: 'test@example.com', password: 'password123' })
          .expect(200);
      });
  
      it('/auth/login (POST) - should not log in with incorrect password', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: 'test@example.com', password: 'password123' });
        
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'test@example.com', password: 'wrongpassword' })
          .expect(401);
      });
  });

  describe('Protected Route', () => {
    it('/users/me (GET) - should not get user info without a token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });

    it('/users/me (GET) - should get current user info with a token', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      const token = loginResponse.body.access_token;

      const { body } = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(body.email).toEqual('test@example.com');
      expect(body.password).toBeUndefined();
    });
  });
});
