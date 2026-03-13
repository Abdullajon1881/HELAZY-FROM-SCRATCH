import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'Healzy API',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
