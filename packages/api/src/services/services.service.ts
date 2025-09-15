// src/services/services.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Prisma } from '../../generated/prisma'; 
import { SearchServiceDto } from './dto/search-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto, authorId: number) {
    const { title, description, price, lat, lon } = createServiceDto;

   const result: any[] = await this.prisma.$queryRaw(
    Prisma.sql`
      INSERT INTO "Service" (title, description, price, "authorId", location, "createdAt", "updatedAt")
      VALUES (${title}, ${description}, ${price}, ${authorId}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326), NOW(), NOW())
      -- THIS IS THE CORRECTED PART --
      RETURNING id, title, description, price, "authorId", ST_AsText(location) as location, "createdAt", "updatedAt";
    `
  );

  return result[0];
 }

async search(searchDto: SearchServiceDto) {
  const { lat, lon, radius } = searchDto;
  const radiusInMeters = radius * 1000;

  const services = await this.prisma.$queryRaw`
    SELECT 
      s.id, s.title, s.description, s.price, s."authorId",
      -- THIS IS THE CORRECTED PART --
      ST_AsText(s.location) as location,
      ST_Distance(s.location, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)) / 1000 AS distance_km
    FROM 
      "Service" s
    WHERE 
      ST_DWithin(
        s.location,
        ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326),
        ${radiusInMeters}
      )
    ORDER BY
      distance_km ASC;
  `;

  return services;
}

  findAll() {
    return this.prisma.service.findMany();
  }
  findAllByAuthor(authorId: number) {
    return this.prisma.service.findMany({
      where: {
        authorId: authorId,
      },
      // You can also order them, e.g., by newest first
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

 async update(id: number, updateServiceDto: UpdateServiceDto, userId: number) {
    const service = await this.findOne(id);

  if (service.authorId !== userId) {
    throw new ForbiddenException('Access to resource denied');
  }

  const { title, description, price, lat, lon } = updateServiceDto;

  // We must build the query dynamically because PATCH allows partial updates.
  let updateQuery = Prisma.sql`UPDATE "Service" SET "updatedAt" = NOW()`;

  if (title) updateQuery = Prisma.sql`${updateQuery}, title = ${title}`;
  if (description) updateQuery = Prisma.sql`${updateQuery}, description = ${description}`;
  if (price !== undefined) updateQuery = Prisma.sql`${updateQuery}, price = ${price}`;
  if (lat && lon) {
    updateQuery = Prisma.sql`${updateQuery}, location = ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)`;
  }
  
  updateQuery = Prisma.sql`${updateQuery} WHERE id = ${id} RETURNING id, title, description, price, "authorId", ST_AsText(location) as location, "createdAt", "updatedAt";`;

  const result: any[] = await this.prisma.$queryRaw(updateQuery);
  return result[0];
}

  async remove(id: number, userId: number) {
    const service = await this.prisma.service.findUnique({ where: { id } });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    if (service.authorId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }
    
    await this.prisma.service.delete({ where: { id } });
  }
  findAllReviewsForService(serviceId: number) {
    return this.prisma.review.findMany({
      where: { serviceId },
      include: {
        // Include public info about the author of the review
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
