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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_service_1 = require("./app.service");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    getHealthCheck() {
        return this.appService.getHealthCheck();
    }
    async getDetailedHealth() {
        return this.appService.getDetailedHealth();
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'API Health Check',
        description: 'Returns basic API information and health status',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AppController.prototype, "getHealthCheck", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Detailed Health Check',
        description: 'Returns detailed health status including database and external services',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Detailed health status',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getDetailedHealth", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map