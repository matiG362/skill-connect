// src/services/services.controller.ts
import { Controller, Get, Post, Body, UseGuards, Patch, Delete, Param, HttpCode, HttpStatus, ParseIntPipe, Query} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '../../generated/prisma';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchServiceDto } from './dto/search-service.dto';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('mine') // This will be GET /services/mine
  @ApiBearerAuth()
  findMyServices(@GetUser() user: User) {
    return this.servicesService.findAllByAuthor(user.id);
  }

  @Get('search') // This will be GET /services/search
  @ApiOperation({ summary: 'Search for services within a radius' })
  search(@Query() searchDto: SearchServiceDto) {
    return this.servicesService.search(searchDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiBearerAuth()
  create(@Body() createServiceDto: CreateServiceDto, @GetUser() user: User) {
    return this.servicesService.create(createServiceDto, user.id);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
    @GetUser() user: User,
  ) {
    return this.servicesService.update(id, updateServiceDto, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.servicesService.remove(id, user.id);
  }
  
  @Get(':id/reviews')
  getServiceReviews(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findAllReviewsForService(id);
  }
} // <-- IMPORTANT: Ensure all methods are above this closing brace
