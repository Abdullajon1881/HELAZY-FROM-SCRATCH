import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { ChatModule } from './modules/chat/chat.module';
import { AIModule } from './modules/ai/ai.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import {
  ReviewsModule, NotificationsModule, PaymentsModule, AdminModule,
  UsersModule, PatientsModule, MedicalRecordsModule,
} from './modules/combined.modules';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.local'] }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([{
        ttl: config.get('THROTTLE_TTL', 60000),
        limit: config.get('THROTTLE_LIMIT', 100),
      }]),
    }),

    // Events & Schedule
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),

    // Core
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    DoctorsModule,
    PatientsModule,
    AppointmentsModule,
    ReviewsModule,
    ChatModule,
    AIModule,
    PaymentsModule,
    AdminModule,
    NotificationsModule,
    MedicalRecordsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
