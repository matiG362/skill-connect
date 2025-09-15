// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Makes the module available globally
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export PrismaService so other modules can use it
})
export class PrismaModule {}
