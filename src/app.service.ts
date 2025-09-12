import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './common/database/database.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly startTime = Date.now();

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {}

  getHealthCheck(): object {
    return {
      message: 'What to Eat API Gateway - Running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: (Date.now() - this.startTime) / 1000,
      environment: this.configService.get<string>('NODE_ENV') || 'development',
    };
  }

  async getDetailedHealth(): Promise<object> {
    const basicHealth = this.getHealthCheck();
    
    // Check database health
    let databaseStatus = 'unknown';
    try {
      const isHealthy = await this.databaseService.healthCheck();
      databaseStatus = isHealthy ? 'healthy' : 'unhealthy';
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      databaseStatus = 'error';
    }

    // Check configuration
    const configStatus = {
      firebase: !!this.configService.get<string>('FIREBASE_PROJECT_ID'),
      googlePlaces: !!this.configService.get<string>('GOOGLE_PLACES_API_KEY'),
      googleMaps: !!this.configService.get<string>('GOOGLE_MAPS_API_KEY'),
      openai: !!this.configService.get<string>('OPENAI_API_KEY'),
      database: !!this.configService.get<string>('DATABASE_URL'),
    };

    return {
      ...basicHealth,
      status: databaseStatus === 'healthy' ? 'healthy' : 'degraded',
      checks: {
        database: databaseStatus,
        configuration: configStatus,
      },
    };
  }
}
