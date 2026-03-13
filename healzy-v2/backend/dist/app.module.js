"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("./database/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const doctors_module_1 = require("./modules/doctors/doctors.module");
const chat_module_1 = require("./modules/chat/chat.module");
const ai_module_1 = require("./modules/ai/ai.module");
const appointments_module_1 = require("./modules/appointments/appointments.module");
const combined_modules_1 = require("./modules/combined.modules");
const health_controller_1 = require("./health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.local'] }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ([{
                        ttl: config.get('THROTTLE_TTL', 60000),
                        limit: config.get('THROTTLE_LIMIT', 100),
                    }]),
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            combined_modules_1.UsersModule,
            doctors_module_1.DoctorsModule,
            combined_modules_1.PatientsModule,
            appointments_module_1.AppointmentsModule,
            combined_modules_1.ReviewsModule,
            chat_module_1.ChatModule,
            ai_module_1.AIModule,
            combined_modules_1.PaymentsModule,
            combined_modules_1.AdminModule,
            combined_modules_1.NotificationsModule,
            combined_modules_1.MedicalRecordsModule,
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map