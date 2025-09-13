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
exports.ApifyOptimizationResponse = exports.ApifyOptimizationSuggestion = exports.ApifyCostEstimationResponse = exports.ApifyCostEstimationRequest = exports.ApifyJobStatusResponse = exports.ApifyUsageMetricsResponse = exports.ApifyComprehensiveRequest = exports.ApifyFacebookPagesRequest = exports.ApifyYouTubeReviewsRequest = exports.ApifyTikTokTrendsRequest = exports.ApifyRedditDiscussionsRequest = exports.ApifyTwitterMentionsRequest = exports.ApifyFoodTrendRequest = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ApifyFoodTrendRequest {
    location;
    categories;
}
exports.ApifyFoodTrendRequest = ApifyFoodTrendRequest;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Location to analyze food trends for',
        example: 'San Francisco, CA',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApifyFoodTrendRequest.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Food categories to focus on',
        example: ['italian', 'asian', 'pizza'],
        required: false,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ApifyFoodTrendRequest.prototype, "categories", void 0);
class ApifyTwitterMentionsRequest {
    location;
    categories;
}
exports.ApifyTwitterMentionsRequest = ApifyTwitterMentionsRequest;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Location to analyze Twitter mentions for',
        example: 'New York, NY',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApifyTwitterMentionsRequest.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Food categories to focus on',
        example: ['burger', 'sushi', 'pizza'],
        required: false,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ApifyTwitterMentionsRequest.prototype, "categories", void 0);
class ApifyRedditDiscussionsRequest {
    location;
    categories;
}
exports.ApifyRedditDiscussionsRequest = ApifyRedditDiscussionsRequest;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Location to analyze Reddit discussions for',
        example: 'Chicago, IL',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApifyRedditDiscussionsRequest.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Food categories to focus on',
        example: ['deep dish', 'hot dogs', 'italian beef'],
        required: false,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ApifyRedditDiscussionsRequest.prototype, "categories", void 0);
class ApifyTikTokTrendsRequest {
    location;
    categories;
}
exports.ApifyTikTokTrendsRequest = ApifyTikTokTrendsRequest;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Location to analyze TikTok trends for',
        example: 'Los Angeles, CA',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApifyTikTokTrendsRequest.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Food categories to focus on',
        example: ['mexican', 'korean', 'vegan'],
        required: false,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ApifyTikTokTrendsRequest.prototype, "categories", void 0);
class ApifyYouTubeReviewsRequest {
    location;
    categories;
}
exports.ApifyYouTubeReviewsRequest = ApifyYouTubeReviewsRequest;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Location to analyze YouTube reviews for',
        example: 'Miami, FL',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApifyYouTubeReviewsRequest.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Food categories to focus on',
        example: ['cuban', 'seafood', 'latin'],
        required: false,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ApifyYouTubeReviewsRequest.prototype, "categories", void 0);
class ApifyFacebookPagesRequest {
    location;
    categories;
}
exports.ApifyFacebookPagesRequest = ApifyFacebookPagesRequest;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Location to analyze Facebook pages for',
        example: 'Seattle, WA',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApifyFacebookPagesRequest.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Food categories to focus on',
        example: ['coffee', 'seafood', 'farm to table'],
        required: false,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ApifyFacebookPagesRequest.prototype, "categories", void 0);
class ApifyComprehensiveRequest {
    location;
    categories;
    user_preferences;
}
exports.ApifyComprehensiveRequest = ApifyComprehensiveRequest;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Location for comprehensive social intelligence analysis',
        example: 'Austin, TX',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApifyComprehensiveRequest.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Food categories to focus on',
        example: ['bbq', 'tacos', 'food trucks'],
        required: false,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ApifyComprehensiveRequest.prototype, "categories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User preferences for personalized analysis',
        example: {
            dietary_restrictions: ['vegetarian'],
            budget: '$$',
            group_size: 2,
            mode: 'dine-out'
        },
        required: false,
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ApifyComprehensiveRequest.prototype, "user_preferences", void 0);
class ApifyUsageMetricsResponse {
    current_usage;
    daily_limit;
    remaining_budget;
    success_rate;
    average_response_time;
    platform_costs;
    optimization_suggestions;
    estimated_monthly_cost;
}
exports.ApifyUsageMetricsResponse = ApifyUsageMetricsResponse;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current Apify usage in units',
        example: 1250,
    }),
    __metadata("design:type", Number)
], ApifyUsageMetricsResponse.prototype, "current_usage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Daily budget limit in USD',
        example: 15,
    }),
    __metadata("design:type", Number)
], ApifyUsageMetricsResponse.prototype, "daily_limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Remaining budget for today',
        example: 8.75,
    }),
    __metadata("design:type", Number)
], ApifyUsageMetricsResponse.prototype, "remaining_budget", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success rate of scraping operations',
        example: 0.95,
    }),
    __metadata("design:type", Number)
], ApifyUsageMetricsResponse.prototype, "success_rate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Average response time in milliseconds',
        example: 25000,
    }),
    __metadata("design:type", Number)
], ApifyUsageMetricsResponse.prototype, "average_response_time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cost breakdown by platform',
        example: {
            instagram: 45.60,
            twitter: 65.80,
            reddit: 15.25,
            tiktok: 35.50,
            youtube: 20.30,
            facebook: 15.25
        },
    }),
    __metadata("design:type", Object)
], ApifyUsageMetricsResponse.prototype, "platform_costs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optimization suggestions',
        example: [
            'Enable intelligent caching for 15-30 minutes',
            'Focus scraping on peak engagement hours',
            'Use geo-targeting to reduce irrelevant content'
        ],
    }),
    __metadata("design:type", Array)
], ApifyUsageMetricsResponse.prototype, "optimization_suggestions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total monthly estimated cost',
        example: 450,
    }),
    __metadata("design:type", Number)
], ApifyUsageMetricsResponse.prototype, "estimated_monthly_cost", void 0);
class ApifyJobStatusResponse {
    status;
    job_id;
    progress;
    items_processed;
    estimated_time_remaining;
    error_message;
}
exports.ApifyJobStatusResponse = ApifyJobStatusResponse;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current status of the scraping job',
        example: 'RUNNING',
    }),
    __metadata("design:type", String)
], ApifyJobStatusResponse.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Job ID',
        example: 'abc123def456',
    }),
    __metadata("design:type", String)
], ApifyJobStatusResponse.prototype, "job_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Progress percentage',
        example: 75,
    }),
    __metadata("design:type", Number)
], ApifyJobStatusResponse.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Items processed so far',
        example: 150,
    }),
    __metadata("design:type", Number)
], ApifyJobStatusResponse.prototype, "items_processed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated time remaining in seconds',
        example: 180,
    }),
    __metadata("design:type", Number)
], ApifyJobStatusResponse.prototype, "estimated_time_remaining", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Error message if job failed',
        required: false,
    }),
    __metadata("design:type", String)
], ApifyJobStatusResponse.prototype, "error_message", void 0);
class ApifyCostEstimationRequest {
    platform;
    data_size;
}
exports.ApifyCostEstimationRequest = ApifyCostEstimationRequest;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Platform to estimate cost for',
        example: 'instagram',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApifyCostEstimationRequest.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Expected data size to scrape',
        example: 500,
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ApifyCostEstimationRequest.prototype, "data_size", void 0);
class ApifyCostEstimationResponse {
    estimated_units;
    estimated_cost_usd;
    fits_daily_budget;
    estimated_completion_time;
}
exports.ApifyCostEstimationResponse = ApifyCostEstimationResponse;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated Apify units to consume',
        example: 12.5,
    }),
    __metadata("design:type", Number)
], ApifyCostEstimationResponse.prototype, "estimated_units", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated cost in USD',
        example: 0.31,
    }),
    __metadata("design:type", Number)
], ApifyCostEstimationResponse.prototype, "estimated_cost_usd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this fits within daily budget',
        example: true,
    }),
    __metadata("design:type", Boolean)
], ApifyCostEstimationResponse.prototype, "fits_daily_budget", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Time to complete estimation in minutes',
        example: 4.5,
    }),
    __metadata("design:type", Number)
], ApifyCostEstimationResponse.prototype, "estimated_completion_time", void 0);
class ApifyOptimizationSuggestion {
    type;
    description;
    potential_savings;
    difficulty;
}
exports.ApifyOptimizationSuggestion = ApifyOptimizationSuggestion;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of optimization',
        example: 'caching',
    }),
    __metadata("design:type", String)
], ApifyOptimizationSuggestion.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the optimization',
        example: 'Enable intelligent caching for 15-30 minutes to reduce redundant scraping',
    }),
    __metadata("design:type", String)
], ApifyOptimizationSuggestion.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Potential cost savings percentage',
        example: 25,
    }),
    __metadata("design:type", Number)
], ApifyOptimizationSuggestion.prototype, "potential_savings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Implementation difficulty',
        example: 'easy',
    }),
    __metadata("design:type", String)
], ApifyOptimizationSuggestion.prototype, "difficulty", void 0);
class ApifyOptimizationResponse {
    suggestions;
    current_efficiency;
    potential_efficiency;
    total_potential_savings;
}
exports.ApifyOptimizationResponse = ApifyOptimizationResponse;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of optimization suggestions',
        type: [ApifyOptimizationSuggestion],
    }),
    __metadata("design:type", Array)
], ApifyOptimizationResponse.prototype, "suggestions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current efficiency score',
        example: 0.78,
    }),
    __metadata("design:type", Number)
], ApifyOptimizationResponse.prototype, "current_efficiency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Potential efficiency with optimizations',
        example: 0.92,
    }),
    __metadata("design:type", Number)
], ApifyOptimizationResponse.prototype, "potential_efficiency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total potential monthly savings in USD',
        example: 125.50,
    }),
    __metadata("design:type", Number)
], ApifyOptimizationResponse.prototype, "total_potential_savings", void 0);
//# sourceMappingURL=apify.dto.js.map