import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service'; // <-- MISSING IMPORT

@Module({
  controllers: [UsersController],
  providers: [UsersService], // <-- MISSING PROVIDERS ARRAY
})
export class UsersModule {}
