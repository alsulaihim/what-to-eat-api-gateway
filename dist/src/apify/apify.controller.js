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
var ApifyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApifyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const firebase_auth_guard_1 = require("../auth/firebase-auth.guard");
const apify_service_1 = require("./apify.service");
const apify_dto_1 = require("./dto/apify.dto");
let ApifyController = ApifyController_1 = class ApifyController {
    apifyService;
    logger = new common_1.Logger(ApifyController_1.name);
    constructor(apifyService) {
        this.apifyService = apifyService;
    }
    async getInstagramFoodTrends(request) {
        try {
            this.logger.log(`Analyzing Instagram food trends for ${request.location}`);
            return await this.apifyService.scrapeInstagramFoodTrends(request.location, request.categories || []);
        }
        catch (error) {
            this.logger.error(`Instagram food trends failed: ${error.message}`);
            throw error;
        }
    }
    async getTwitterFoodMentions(request) {
        try {
            this.logger.log(`Analyzing Twitter food mentions for ${request.location}`);
            return await this.apifyService.scrapeTwitterFoodMentions(request.location, request.categories || []);
        }
        catch (error) {
            this.logger.error(`Twitter food mentions failed: ${error.message}`);
            throw error;
        }
    }
    async getRedditFoodDiscussions(request) {
        try {
            this.logger.log(`Analyzing Reddit food discussions for ${request.location}`);
            return await this.apifyService.scrapeRedditFoodDiscussions(request.location, request.categories || []);
        }
        catch (error) {
            this.logger.error(`Reddit food discussions failed: ${error.message}`);
            throw error;
        }
    }
    async getTikTokViralFoodContent(request) {
        try {
            this.logger.log(`Analyzing TikTok viral food content for ${request.location}`);
            return await this.apifyService.scrapeTikTokFoodTrends(request.location, request.categories || []);
        }
        catch (error) {
            this.logger.error(`TikTok viral content analysis failed: ${error.message}`);
            throw error;
        }
    }
    async getYouTubeFoodReviews(request) {
        try {
            this.logger.log(`Analyzing YouTube food reviews for ${request.location}`);
            return await this.apifyService.scrapeYouTubeFoodReviews(request.location, request.categories || []);
        }
        catch (error) {
            this.logger.error(`YouTube food reviews analysis failed: ${error.message}`);
            throw error;
        }
    }
    async getFacebookFoodPages(request) {
        try {
            this.logger.log(`Analyzing Facebook food pages for ${request.location}`);
            return await this.apifyService.scrapeFacebookFoodPages(request.location, request.categories || []);
        }
        catch (error) {
            this.logger.error(`Facebook food pages analysis failed: ${error.message}`);
            throw error;
        }
    }
    async getScrapingJobStatus(jobId) {
        try {
            this.logger.log(`Checking Apify job status: ${jobId}`);
            return await this.apifyService.getScrapingJobStatus(jobId);
        }
        catch (error) {
            this.logger.error(`Job status check failed: ${error.message}`);
            throw error;
        }
    }
    async getComprehensiveSocialIntelligence(request) {
        try {
            this.logger.log(`Running comprehensive social intelligence for ${request.location}`);
            return await this.apifyService.orchestrateComprehensiveSocialIntelligence(request.location, request.categories || [], request.user_preferences || {});
        }
        catch (error) {
            this.logger.error(`Comprehensive social intelligence failed: ${error.message}`);
            throw error;
        }
    }
    async getUsageMetrics() {
        try {
            this.logger.log('Retrieving Apify usage metrics');
            return await this.apifyService.getUsageMetrics();
        }
        catch (error) {
            this.logger.error(`Usage metrics retrieval failed: ${error.message}`);
            throw error;
        }
    }
    async estimateScrapingCost(request) {
        try {
            this.logger.log(`Estimating cost for ${request.platform} scraping`);
            return await this.apifyService.estimateScrapingCost(request.platform, request.data_size);
        }
        catch (error) {
            this.logger.error(`Cost estimation failed: ${error.message}`);
            throw error;
        }
    }
    async getUsageOptimizationSuggestions(request) {
        try {
            this.logger.log('Generating Apify usage optimization suggestions');
            return await this.apifyService.generateOptimizationSuggestions(request.current_usage);
        }
        catch (error) {
            this.logger.error(`Optimization suggestions failed: ${error.message}`);
            throw error;
        }
    }
};
exports.ApifyController = ApifyController;
__decorate([
    (0, common_1.Post)('instagram/food-trends'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze Instagram food trends via Apify scraping' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Instagram food trends analyzed successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [apify_dto_1.ApifyFoodTrendRequest]),
    __metadata("design:returntype", Promise)
], ApifyController.prototype, "getInstagramFoodTrends", null);
__decorate([
    (0, common_1.Post)('twitter/food-mentions'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze Twitter food mentions and sentiment via Apify' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Twitter food mentions analyzed successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [apify_dto_1.ApifyTwitterMentionsRequest]),
    __metadata("design:returntype", Promise)
], ApifyController.prototype, "getTwitterFoodMentions", null);
__decorate([
    (0, common_1.Post)('reddit/food-discussions'),
    (0, swagger_1.ApiOperation)({ summary: 'Scrape Reddit food discussions and community insights' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reddit food discussions analyzed successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [apify_dto_1.ApifyRedditDiscussionsRequest]),
    __metadata("design:returntype", Promise)
], ApifyController.prototype, "getRedditFoodDiscussions", null);
__decorate([
    (0, common_1.Post)('tiktok/viral-food-content'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze TikTok viral food content and trends' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'TikTok viral food content analyzed successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [apify_dto_1.ApifyTikTokTrendsRequest]),
    __metadata("design:returntype", Promise)
], ApifyController.prototype, "getTikTokViralFoodContent", null);
__decorate([
    (0, common_1.Post)('youtube/food-reviews'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze YouTube food reviews and channel insights' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'YouTube food reviews analyzed successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [apify_dto_1.ApifyYouTubeReviewsRequest]),
    __metadata("design:returntype", Promise)
], ApifyController.prototype, "getYouTubeFoodReviews", null);
__decorate([
    (0, common_1.Post)('facebook/food-pages'),
    (0, swagger_1.ApiOperation)({ summary: 'Scrape Facebook food pages and community activity' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Facebook food pages analyzed successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [apify_dto_1.ApifyFacebookPagesRequest]),
    __metadata("design:returntype", Promise)
], ApifyController.prototype, "getFacebookFoodPages", null);
__decorate([
    (0, common_1.Get)('scraping-status/:jobId'),
    (0, swagger_1.ApiOperation)({ summary: 'Check Apify scraping job status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Scraping job status retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApifyController.prototype, "getScrapingJobStatus", null);
__decorate([
    (0, common_1.Post)('social-comprehensive'),
    (0, swagger_1.ApiOperation)({ summary: 'Comprehensive multi-platform social media intelligence analysis' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Comprehensive social intelligence analyzed successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [apify_dto_1.ApifyComprehensiveRequest]),
    __metadata("design:returntype", Promise)
], ApifyController.prototype, "getComprehensiveSocialIntelligence", null);
__decorate([
    (0, common_1.Get)('usage-metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Apify usage metrics and cost tracking' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usage metrics retrieved successfully',
        type: apify_dto_1.ApifyUsageMetricsResponse,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApifyController.prototype, "getUsageMetrics", null);
__decorate([
    (0, common_1.Post)('cost-estimation'),
    (0, swagger_1.ApiOperation)({ summary: 'Estimate cost for Apify scraping operation' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cost estimation completed successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApifyController.prototype, "estimateScrapingCost", null);
__decorate([
    (0, common_1.Post)('optimize-usage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get optimization suggestions for Apify usage' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Optimization suggestions generated successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApifyController.prototype, "getUsageOptimizationSuggestions", null);
exports.ApifyController = ApifyController = ApifyController_1 = __decorate([
    (0, swagger_1.ApiTags)('Apify Social Media Intelligence'),
    (0, common_1.Controller)('api/apify'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [apify_service_1.ApifyService])
], ApifyController);
//# sourceMappingURL=apify.controller.js.map