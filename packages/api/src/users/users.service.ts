import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: id },
      data: { ...dto },
    });
    delete user.password;
    return user;
  }
async getUserTransactions(userId: number) {
    return this.prisma.transaction.findMany({
        where: { buyerId: userId, status: 'SUCCESS' },
        select: { serviceId: true }
    });
}
}
