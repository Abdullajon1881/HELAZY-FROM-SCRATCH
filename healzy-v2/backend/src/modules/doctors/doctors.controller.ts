import {
  Controller, Get, Patch, Post, Put, Body, Param, Query,
  UseGuards, Req, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '@/common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private doctors: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'List all approved doctors with filters' })
  findAll(@Query() query: any) {
    return this.doctors.findAll(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyProfile(@CurrentUser() user: any) {
    return this.doctors.getMyProfile(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateMyProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.doctors.updateMyProfile(user.id, body);
  }

  @Patch('me/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  setAvailability(@CurrentUser() user: any, @Body('isAvailable') isAvailable: boolean) {
    return this.doctors.setAvailability(user.id, isAvailable);
  }

  @Get('me/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMySchedule(@CurrentUser() user: any) {
    return this.doctors.getSchedule(user.id);
  }

  @Put('me/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateSchedule(@CurrentUser() user: any, @Body('schedule') schedule: any[]) {
    return this.doctors.updateSchedule(user.id, schedule);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  apply(@CurrentUser() user: any, @Body() body: any) {
    return this.doctors.applyAsDoctor(user.id, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctors.findOne(id);
  }

  @Get(':id/schedule')
  getSchedule(@Param('id') id: string) {
    return this.doctors.getSchedule(id);
  }

  @Get(':id/slots')
  getSlots(@Param('id') id: string, @Query('date') date: string) {
    return this.doctors.getAvailableSlots(id, date);
  }

  @Get(':id/reviews')
  getReviews(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.doctors.getReviews(id, +page, +limit);
  }
}
