import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './common/database/database.service';
export declare class AppService {
    private configService;
    private databaseService;
    private readonly logger;
    private readonly startTime;
    constructor(configService: ConfigService, databaseService: DatabaseService);
    getHealthCheck(): object;
    getDetailedHealth(): Promise<object>;
}
