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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AdminController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const admin_auth_guard_1 = require("./guards/admin-auth.guard");
const update_algorithm_weights_dto_1 = require("./dto/update-algorithm-weights.dto");
const api_usage_query_dto_1 = require("./dto/api-usage-query.dto");
const user_analytics_query_dto_1 = require("./dto/user-analytics-query.dto");
let AdminController = AdminController_1 = class AdminController {
    adminService;
    logger = new common_1.Logger(AdminController_1.name);
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getApiUsage(query, request) {
        this.logger.log(`Admin ${request.user.email} requested API usage statistics`);
        return this.adminService.getApiUsageStats(query);
    }
    async updateAlgorithmWeights(updateData, request) {
        const adminUser = request.user;
        updateData.updatedBy = adminUser.firebaseUid;
        this.logger.log(`Admin ${adminUser.email} updating algorithm weights: ${JSON.stringify(updateData)}`);
        return this.adminService.updateAlgorithmWeights(updateData);
    }
    async getCurrentAlgorithmWeights(request) {
        this.logger.log(`Admin ${request.user.email} requested current algorithm weights`);
        return this.adminService.getCurrentAlgorithmWeights();
    }
    async getUserAnalytics(query, request) {
        this.logger.log(`Admin ${request.user.email} requested user analytics`);
        return this.adminService.getUserAnalytics(query);
    }
    async getIntelligenceMetrics(request) {
        this.logger.log(`Admin ${request.user.email} requested intelligence metrics`);
        return this.adminService.getIntelligenceMetrics();
    }
    async getAdminHealth(request) {
        const adminUser = request.user;
        this.logger.log(`Admin health check requested by ${adminUser.email}`);
        return {
            status: 'healthy',
            timestamp: new Date(),
            adminUser: {
                email: adminUser.email,
                displayName: adminUser.displayName,
                isAdmin: adminUser.isAdmin,
            },
            services: {
                database: 'connected',
                firebase: 'connected',
                analytics: 'operational',
                intelligence: 'operational',
            },
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('api-usage'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get API usage statistics',
        description: 'Retrieve comprehensive API usage statistics with filtering and aggregation options',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'API usage statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        totalCount: { type: 'number' },
                        totalPages: { type: 'number' },
                    },
                },
                summary: {
                    type: 'object',
                    properties: {
                        totalCost: { type: 'number' },
                        averageResponseTime: { type: 'number' },
                        totalRequests: { type: 'number' },
                        averageCostPerRequest: { type: 'number' },
                    },
                },
                apiBreakdown: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            apiName: { type: 'string' },
                            totalCost: { type: 'number' },
                            averageResponseTime: { type: 'number' },
                            requestCount: { type: 'number' },
                        },
                    },
                },
                timeSeriesData: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            timestamp: { type: 'string' },
                            totalCost: { type: 'number' },
                            totalRequests: { type: 'number' },
                            successfulRequests: { type: 'number' },
                            successRate: { type: 'number' },
                            averageResponseTime: { type: 'number' },
                        },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin privileges required' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid query parameters' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [api_usage_query_dto_1.ApiUsageQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getApiUsage", null);
__decorate([
    (0, common_1.Put)('algorithm-weights'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update algorithm weights',
        description: 'Update the weighting parameters for the recommendation algorithm',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Algorithm weights updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                weights: {
                    type: 'object',
                    properties: {
                        socialWeight: { type: 'number' },
                        personalWeight: { type: 'number' },
                        contextualWeight: { type: 'number' },
                        trendsWeight: { type: 'number' },
                    },
                },
                updatedBy: { type: 'string' },
                lastUpdated: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin privileges required' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid weights (must sum to 1.0)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_algorithm_weights_dto_1.UpdateAlgorithmWeightsDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateAlgorithmWeights", null);
__decorate([
    (0, common_1.Get)('algorithm-weights'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current algorithm weights',
        description: 'Retrieve the current weighting parameters for the recommendation algorithm',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current algorithm weights retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                weights: {
                    type: 'object',
                    properties: {
                        socialWeight: { type: 'number' },
                        personalWeight: { type: 'number' },
                        contextualWeight: { type: 'number' },
                        trendsWeight: { type: 'number' },
                    },
                },
                updatedBy: { type: 'string' },
                lastUpdated: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin privileges required' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCurrentAlgorithmWeights", null);
__decorate([
    (0, common_1.Get)('user-analytics'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user analytics',
        description: 'Retrieve comprehensive user behavior analytics and metrics',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User analytics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                timeRange: { type: 'string' },
                dateRange: {
                    type: 'object',
                    properties: {
                        startDate: { type: 'string', nullable: true },
                        endDate: { type: 'string', nullable: true },
                    },
                },
                userOverview: {
                    type: 'object',
                    properties: {
                        totalUsers: { type: 'number' },
                        providerBreakdown: {
                            type: 'object',
                            properties: {
                                google: { type: 'number' },
                                apple: { type: 'number' },
                                email: { type: 'number' },
                            },
                        },
                    },
                },
                metrics: {
                    type: 'object',
                    additionalProperties: {
                        type: 'object',
                    },
                },
                generatedAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin privileges required' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid query parameters' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_analytics_query_dto_1.UserAnalyticsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserAnalytics", null);
__decorate([
    (0, common_1.Get)('intelligence-metrics'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get intelligence service metrics',
        description: 'Retrieve performance metrics and analytics for all intelligence services',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Intelligence metrics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                service_performance: {
                    type: 'object',
                    properties: {
                        weather_service: { type: 'object' },
                        event_service: { type: 'object' },
                        sentiment_service: { type: 'object' },
                        economic_service: { type: 'object' },
                        health_service: { type: 'object' },
                        demographics_service: { type: 'object' },
                        temporal_service: { type: 'object' },
                        media_service: { type: 'object' },
                    },
                },
                api_usage: {
                    type: 'object',
                    properties: {
                        total_requests: { type: 'number' },
                        failed_requests: { type: 'number' },
                        average_response_time: { type: 'number' },
                        cost_estimate: { type: 'number' },
                    },
                },
                data_freshness: {
                    type: 'object',
                    additionalProperties: { type: 'string' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin privileges required' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getIntelligenceMetrics", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin system health check',
        description: 'Check the health and status of admin-related services',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Admin system health status',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
                adminUser: {
                    type: 'object',
                    properties: {
                        email: { type: 'string' },
                        displayName: { type: 'string' },
                        isAdmin: { type: 'boolean' },
                    },
                },
                services: {
                    type: 'object',
                    properties: {
                        database: { type: 'string' },
                        firebase: { type: 'string' },
                        analytics: { type: 'string' },
                        intelligence: { type: 'string' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminHealth", null);
exports.AdminController = AdminController = AdminController_1 = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('api/admin'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map