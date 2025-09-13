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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRecommendationsController = exports.RecommendationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const recommendations_service_1 = require("./recommendations.service");
const firebase_auth_guard_1 = require("../auth/firebase-auth.guard");
const recommendation_request_dto_1 = require("./dto/recommendation-request.dto");
const recommendation_response_dto_1 = require("./dto/recommendation-response.dto");
let RecommendationsController = class RecommendationsController {
    recommendationsService;
    constructor(recommendationsService) {
        this.recommendationsService = recommendationsService;
    }
    async getRecommendations(recommendationRequest, request) {
        const userId = request.user?.uid;
        return this.recommendationsService.generateRecommendations(recommendationRequest, userId);
    }
    async getBatchRecommendations(requests, request) {
        const userId = request.user?.uid;
        return this.recommendationsService.generateBatchRecommendations(requests, userId);
    }
    async getRecommendationHistory(request, limit = 10, offset = 0) {
        const userId = request.user?.uid;
        return this.recommendationsService.getUserRecommendationHistory(userId, limit, offset);
    }
    async clearRecommendationHistory(request) {
        const userId = request.user?.uid;
        return this.recommendationsService.clearUserRecommendationHistory(userId);
    }
    async deleteRecommendationEntry(entryId, request) {
        const userId = request.user?.uid;
        return this.recommendationsService.deleteUserRecommendationEntry(userId, entryId);
    }
    async getTrendingRestaurants(location, radius = 5) {
        return this.recommendationsService.getTrendingRestaurants(location, radius);
    }
};
exports.RecommendationsController = RecommendationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get food recommendations',
        description: 'Generate personalized restaurant recommendations based on user preferences, location, and real-time data'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully generated recommendations',
        type: recommendation_response_dto_1.RecommendationResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid request parameters',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - valid Firebase token required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error - external API issues',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recommendation_request_dto_1.RecommendationRequestDto, Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Post)('batch'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get multiple recommendation sets',
        description: 'Generate multiple sets of recommendations for different scenarios (e.g., breakfast, lunch, dinner)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully generated batch recommendations',
        type: [recommendation_response_dto_1.RecommendationResponseDto],
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getBatchRecommendations", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user recommendation history',
        description: 'Retrieve past recommendations for the authenticated user'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully retrieved recommendation history',
        type: [recommendation_response_dto_1.RecommendationResponseDto],
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getRecommendationHistory", null);
__decorate([
    (0, common_1.Delete)('history'),
    (0, swagger_1.ApiOperation)({
        summary: 'Clear all recommendation history',
        description: 'Delete all recommendation history for the authenticated user'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully cleared recommendation history',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "clearRecommendationHistory", null);
__decorate([
    (0, common_1.Delete)('history/:entryId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a specific recommendation history entry',
        description: 'Delete a single recommendation history entry for the authenticated user'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully deleted recommendation entry',
    }),
    __param(0, (0, common_1.Param)('entryId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "deleteRecommendationEntry", null);
__decorate([
    (0, common_1.Get)('trending'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get trending restaurants',
        description: 'Get currently trending restaurants based on social intelligence data'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully retrieved trending restaurants',
    }),
    __param(0, (0, common_1.Query)('location')),
    __param(1, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getTrendingRestaurants", null);
exports.RecommendationsController = RecommendationsController = __decorate([
    (0, swagger_1.ApiTags)('recommendations'),
    (0, common_1.Controller)('api/recommendations'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [recommendations_service_1.RecommendationsService])
], RecommendationsController);
let TestRecommendationsController = class TestRecommendationsController {
    recommendationsService;
    constructor(recommendationsService) {
        this.recommendationsService = recommendationsService;
    }
    async testRecommendations(recommendationRequest) {
        const testUserId = 'test-user-123';
        return this.recommendationsService.generateRecommendations(recommendationRequest, testUserId);
    }
    async testTrendingRestaurants(location = 'New York, NY', radius = 10) {
        return this.recommendationsService.getTrendingRestaurants(location, radius);
    }
};
exports.TestRecommendationsController = TestRecommendationsController;
__decorate([
    (0, common_1.Post)('test'),
    (0, swagger_1.ApiOperation)({
        summary: 'Test recommendation engine without authentication',
        description: 'Development endpoint to test the recommendation system without Firebase authentication'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully generated test recommendations',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recommendation_request_dto_1.RecommendationRequestDto]),
    __metadata("design:returntype", Promise)
], TestRecommendationsController.prototype, "testRecommendations", null);
__decorate([
    (0, common_1.Get)('trending-test'),
    (0, swagger_1.ApiOperation)({
        summary: 'Test trending restaurants without authentication',
        description: 'Development endpoint to test trending restaurants without Firebase authentication'
    }),
    __param(0, (0, common_1.Query)('location')),
    __param(1, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], TestRecommendationsController.prototype, "testTrendingRestaurants", null);
exports.TestRecommendationsController = TestRecommendationsController = __decorate([
    (0, common_1.Controller)('test/recommendations'),
    __metadata("design:paramtypes", [recommendations_service_1.RecommendationsService])
], TestRecommendationsController);
//# sourceMappingURL=recommendations.controller.js.map