import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Module,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard, CurrentUser } from '@/common/guards';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private svc: AppointmentsService) {}

  @Post()
  create(@CurrentUser() u: any, @Body() body: any) {
    return this.svc.create(u.id, body);
  }

  @Get()
  findAll(@CurrentUser() u: any, @Query() query: any) {
    return this.svc.findAll(u.id, u.role, query);
  }

  @Get('upcoming')
  upcoming(@CurrentUser() u: any) {
    return this.svc.getUpcoming(u.id, u.role);
  }

  @Get('stats')
  stats(@CurrentUser() u: any) {
    return this.svc.getStats(u.id, u.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() u: any) {
    return this.svc.findOne(id, u.id, u.role);
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string, @CurrentUser() u: any) {
    return this.svc.confirm(id, u.id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() u: any, @Body('reason') reason: string) {
    return this.svc.cancel(id, u.id, u.role, reason);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() u: any, @Body() body: any) {
    return this.svc.complete(id, u.id, body);
  }

  @Patch(':id/reschedule')
  reschedule(@Param('id') id: string, @CurrentUser() u: any, @Body('scheduledAt') scheduledAt: string) {
    return this.svc.reschedule(id, u.id, u.role, scheduledAt);
  }
}

@Module({
  imports: [EventEmitterModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
