"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_service_1 = require("./common/database/database.service");
let AppService = AppService_1 = class AppService {
    configService;
    databaseService;
    logger = new common_1.Logger(AppService_1.name);
    startTime = Date.now();
    constructor(configService, databaseService) {
        this.configService = configService;
        this.databaseService = databaseService;
    }
    getHealthCheck() {
        return {
            message: 'What to Eat API Gateway - Running',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            uptime: (Date.now() - this.startTime) / 1000,
            environment: this.configService.get('NODE_ENV') || 'development',
        };
    }
    async getDetailedHealth() {
        const basicHealth = this.getHealthCheck();
        let databaseStatus = 'unknown';
        try {
            const isHealthy = await this.databaseService.healthCheck();
            databaseStatus = isHealthy ? 'healthy' : 'unhealthy';
        }
        catch (error) {
            this.logger.error('Database health check failed:', error);
            databaseStatus = 'error';
        }
        const configStatus = {
            firebase: !!this.configService.get('FIREBASE_PROJECT_ID'),
            googlePlaces: !!this.configService.get('GOOGLE_PLACES_API_KEY'),
            googleMaps: !!this.configService.get('GOOGLE_MAPS_API_KEY'),
            openai: !!this.configService.get('OPENAI_API_KEY'),
            database: !!this.configService.get('DATABASE_URL'),
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
};
exports.AppService = AppService;
exports.AppService = AppService = AppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        database_service_1.DatabaseService])
], AppService);
//# sourceMappingURL=app.service.js.map