// src/users/users.controller.ts
import { Controller, Get, UseGuards, Patch, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '../../generated/prisma';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users') // This groups all endpoints under a "users" heading in the UI
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'Successfully returns the logged-in user data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized if no token is provided.' })
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user information' })
  @ApiResponse({ status: 200, description: 'Successfully updates and returns the user data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized if no token is provided.' })
  updateMe(@GetUser('id') userId: number, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(userId, dto);
  }
  @Get('transactions')
    getMyTransactions(@GetUser('id') userId: number) {
    return this.usersService.getUserTransactions(userId);
}
}
