// src/reviews/reviews.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReviewDto, authorId: number) {
    // Business Logic: Only allow a user to review a service if they have
    // a successful transaction for it.
    const successfulTransaction = await this.prisma.transaction.findFirst({
      where: {
        serviceId: dto.serviceId,
        buyerId: authorId,
        status: 'SUCCESS',
      },
    });

    if (!successfulTransaction) {
      throw new ForbiddenException('You can only review services you have purchased.');
    }

    return this.prisma.review.create({
      data: {
        rating: dto.rating,
        comment: dto.comment,
        serviceId: dto.serviceId,
        authorId: authorId,
      },
    });
  }

  // This method will live in the ServicesService
  // async findAllForService(serviceId: number) { ... }
}
