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
exports.UserSimilarityResponseDto = exports.UserSimilarityDto = exports.UserSimilarityRequestDto = exports.DemographicIntelligenceResponseDto = exports.DemographicInsightsDto = exports.DemographicRecommendationsDto = exports.SimilarUserDto = exports.DemographicIntelligenceRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const user_profile_dto_1 = require("../../users/dto/user-profile.dto");
class DemographicIntelligenceRequestDto {
    userDemographics;
    targetLocation;
    cuisineTypes;
    priceRange;
    diningMode;
}
exports.DemographicIntelligenceRequestDto = DemographicIntelligenceRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User demographic data for similarity matching',
        type: user_profile_dto_1.DemographicDataDto,
    }),
    __metadata("design:type", user_profile_dto_1.DemographicDataDto)
], DemographicIntelligenceRequestDto.prototype, "userDemographics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Target location for recommendations',
        example: 'New York, NY',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DemographicIntelligenceRequestDto.prototype, "targetLocation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Preferred cuisine types',
        example: ['italian', 'mexican', 'asian'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], DemographicIntelligenceRequestDto.prototype, "cuisineTypes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Price range preference',
        example: 'medium',
        enum: ['low', 'medium', 'high'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['low', 'medium', 'high']),
    __metadata("design:type", String)
], DemographicIntelligenceRequestDto.prototype, "priceRange", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Dining mode preference',
        example: 'dine_out',
        enum: ['dine_out', 'takeout', 'delivery'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['dine_out', 'takeout', 'delivery']),
    __metadata("design:type", String)
], DemographicIntelligenceRequestDto.prototype, "diningMode", void 0);
class SimilarUserDto {
    count;
    demographics;
    commonPreferences;
}
exports.SimilarUserDto = SimilarUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of similar users found',
        example: 25,
    }),
    __metadata("design:type", Number)
], SimilarUserDto.prototype, "count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Demographic data of similar users',
        type: [user_profile_dto_1.DemographicDataDto],
    }),
    __metadata("design:type", Array)
], SimilarUserDto.prototype, "demographics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Common preferences among similar users',
        example: {
            topCuisines: [
                { name: 'italian', popularity: 0.8 },
                { name: 'mexican', popularity: 0.6 }
            ],
            avgSpiceTolerance: 6.5,
            avgAuthenticityPreference: 7.2,
            commonDietaryRestrictions: ['vegetarian', 'gluten-free']
        },
    }),
    __metadata("design:type", Object)
], SimilarUserDto.prototype, "commonPreferences", void 0);
class DemographicRecommendationsDto {
    cuisineBoosts;
    priceAdjustment;
    authenticityFactor;
    spiceLevelRecommendation;
    culturalMatches;
}
exports.DemographicRecommendationsDto = DemographicRecommendationsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cuisine type boosts based on demographics',
        example: [
            { cuisine: 'italian', boost: 0.2, reason: 'Cultural preference' },
            { cuisine: 'mexican', boost: 0.15, reason: 'Similar user preferences' }
        ],
    }),
    __metadata("design:type", Array)
], DemographicRecommendationsDto.prototype, "cuisineBoosts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Price adjustment factor (-1.0 to 1.0)',
        example: 0.1,
    }),
    __metadata("design:type", Number)
], DemographicRecommendationsDto.prototype, "priceAdjustment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Authenticity preference factor (0.0 to 1.0)',
        example: 0.8,
    }),
    __metadata("design:type", Number)
], DemographicRecommendationsDto.prototype, "authenticityFactor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Recommended spice level (1-10 scale)',
        example: 7,
    }),
    __metadata("design:type", Number)
], DemographicRecommendationsDto.prototype, "spiceLevelRecommendation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Restaurants with cultural relevance',
        example: [
            { restaurant: 'Authentic Thai Kitchen', culturalRelevance: 0.9 },
            { restaurant: 'Little Italy Bistro', culturalRelevance: 0.7 }
        ],
    }),
    __metadata("design:type", Array)
], DemographicRecommendationsDto.prototype, "culturalMatches", void 0);
class DemographicInsightsDto {
    culturalContext;
    dietaryConsiderations;
    socialTrends;
    confidenceScore;
}
exports.DemographicInsightsDto = DemographicInsightsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cultural context explanation',
        example: 'Strong preference for authentic Asian cuisines with emphasis on fresh ingredients',
    }),
    __metadata("design:type", String)
], DemographicInsightsDto.prototype, "culturalContext", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Dietary considerations based on demographics',
        example: ['Halal certification required', 'High spice tolerance'],
        type: [String],
    }),
    __metadata("design:type", Array)
], DemographicInsightsDto.prototype, "dietaryConsiderations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Social trends relevant to user demographics',
        example: ['Instagram-worthy presentation', 'Craft cocktails', 'Weekend brunch'],
        type: [String],
    }),
    __metadata("design:type", Array)
], DemographicInsightsDto.prototype, "socialTrends", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Confidence score of the analysis (0.0 to 1.0)',
        example: 0.85,
    }),
    __metadata("design:type", Number)
], DemographicInsightsDto.prototype, "confidenceScore", void 0);
class DemographicIntelligenceResponseDto {
    success;
    data;
    error;
}
exports.DemographicIntelligenceResponseDto = DemographicIntelligenceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the request was successful',
        example: true,
    }),
    __metadata("design:type", Boolean)
], DemographicIntelligenceResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Demographic intelligence data',
        type: Object,
    }),
    __metadata("design:type", Object)
], DemographicIntelligenceResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Error message if request failed',
        example: 'Insufficient demographic data for analysis',
    }),
    __metadata("design:type", String)
], DemographicIntelligenceResponseDto.prototype, "error", void 0);
class UserSimilarityRequestDto {
    userId;
    limit;
    minSimilarityScore;
}
exports.UserSimilarityRequestDto = UserSimilarityRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current user ID',
        example: 'clm123456789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserSimilarityRequestDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum number of similar users to return',
        example: 10,
        minimum: 1,
        maximum: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], UserSimilarityRequestDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum similarity score threshold (0.0 to 1.0)',
        example: 0.5,
        minimum: 0,
        maximum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], UserSimilarityRequestDto.prototype, "minSimilarityScore", void 0);
class UserSimilarityDto {
    userId;
    similarityScore;
    sharedPreferences;
    recommendationHistory;
}
exports.UserSimilarityDto = UserSimilarityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Similar user ID',
        example: 'clm987654321',
    }),
    __metadata("design:type", String)
], UserSimilarityDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Similarity score breakdown',
        example: {
            overallScore: 0.85,
            categoryScores: {
                cultural: 0.9,
                dietary: 0.8,
                lifestyle: 0.85,
                preferences: 0.8
            },
            matchingFactors: ['nationality', 'cultural_background', 'age_group'],
            recommendationAdjustments: {
                cuisineBoost: ['italian', 'mexican'],
                priceAdjustment: 0.1,
                authenticityFactor: 0.8,
                spiceLevelAdjustment: 7
            }
        },
    }),
    __metadata("design:type", Object)
], UserSimilarityDto.prototype, "similarityScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Shared preferences between users',
        example: ['italian_cuisine', 'medium_spice', 'family_dining'],
        type: [String],
    }),
    __metadata("design:type", Array)
], UserSimilarityDto.prototype, "sharedPreferences", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Recommendation history analysis',
        example: {
            sharedRestaurants: ['Olive Garden', 'Taco Bell'],
            similarRatings: 0.7
        },
    }),
    __metadata("design:type", Object)
], UserSimilarityDto.prototype, "recommendationHistory", void 0);
class UserSimilarityResponseDto {
    success;
    data;
    error;
}
exports.UserSimilarityResponseDto = UserSimilarityResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the request was successful',
        example: true,
    }),
    __metadata("design:type", Boolean)
], UserSimilarityResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of similar users',
        type: [UserSimilarityDto],
    }),
    __metadata("design:type", Array)
], UserSimilarityResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Error message if request failed',
        example: 'User not found',
    }),
    __metadata("design:type", String)
], UserSimilarityResponseDto.prototype, "error", void 0);
//# sourceMappingURL=demographic-intelligence.dto.js.map