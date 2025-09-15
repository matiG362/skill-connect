// test/service.e2e-spec.ts
// test/service.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Service API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

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

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create Service', () => {
    it('/services (POST) - should create a new service', () => {
      return request(app.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Professional Dog Walking',
          description: '30-minute walks for your furry friend.',
          price: 25.50,
        })
        .expect(201);
    });
  });

  describe('Get Services', () => {
    it('/services (GET) - should get all services', async () => {
        await request(app.getHttpServer())
            .post('/services')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: 'Test Service', description: 'A service for testing.', price: 100 });

        const response = await request(app.getHttpServer())
            .get('/services')
            .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].title).toEqual('Test Service');
    });
  });

  // --- NEW TESTS PLACED CORRECTLY INSIDE THE MAIN DESCRIBE BLOCK ---
  
  describe('Get Service by ID', () => {
    it('/services/:id (GET) - should get a single service by its ID', async () => {
      const serviceResponse = await request(app.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Service To Find', description: 'desc', price: 1 });
      
      const serviceId = serviceResponse.body.id;

      const { body } = await request(app.getHttpServer())
        .get(`/services/${serviceId}`)
        .expect(200);
      
      expect(body.id).toEqual(serviceId);
      expect(body.title).toEqual('Service To Find');
    });
  });

  describe('Update Service', () => {
    it('/services/:id (PATCH) - should update a service owned by the user', async () => {
      const serviceResponse = await request(app.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Original Title', description: 'desc', price: 1 });
      
      const serviceId = serviceResponse.body.id;

      const { body } = await request(app.getHttpServer())
        .patch(`/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);
      
      expect(body.title).toEqual('Updated Title');
    });
  });

  describe('Delete Service', () => {
    it('/services/:id (DELETE) - should delete a service owned by the user', async () => {
      const serviceResponse = await request(app.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'To Be Deleted', description: 'desc', price: 1 });
      
      const serviceId = serviceResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

}); // <-- End of the main describe('Service API (e2e)')
