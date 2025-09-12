import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'API Health Check',
    description: 'Returns basic API information and health status',
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'What to Eat API Gateway - Running' },
        version: { type: 'string', example: '1.0.0' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 123.456 },
      },
    },
  })
  getHealthCheck(): object {
    return this.appService.getHealthCheck();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Detailed Health Check',
    description: 'Returns detailed health status including database and external services',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed health status',
  })
  async getDetailedHealth(): Promise<object> {
    return this.appService.getDetailedHealth();
  }
}
