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
exports.DemographicIntelligenceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const demographic_intelligence_service_1 = require("./demographic-intelligence.service");
const demographic_intelligence_dto_1 = require("./dto/demographic-intelligence.dto");
let DemographicIntelligenceController = class DemographicIntelligenceController {
    demographicIntelligenceService;
    constructor(demographicIntelligenceService) {
        this.demographicIntelligenceService = demographicIntelligenceService;
    }
    async analyzeDemographics(req, request) {
        const intelligenceRequest = {
            userDemographics: {
                nationality: request.userDemographics.nationality,
                ageGroup: request.userDemographics.ageGroup,
                gender: request.userDemographics.gender,
                culturalBackground: request.userDemographics.culturalBackground,
                spiceToleranceLevel: request.userDemographics.spiceToleranceLevel,
                authenticityPreference: request.userDemographics.authenticityPreference,
                languagePreference: request.userDemographics.languagePreference,
                incomeBracket: request.userDemographics.incomeBracket,
                religiousDietaryRequirements: request.userDemographics.religiousDietaryRequirements,
                familyStructure: request.userDemographics.familyStructure,
                occupationCategory: request.userDemographics.occupationCategory,
                livingArea: request.userDemographics.livingArea
            },
            targetLocation: request.targetLocation,
            cuisineTypes: request.cuisineTypes,
            priceRange: request.priceRange,
            diningMode: request.diningMode
        };
        return this.demographicIntelligenceService.getDemographicIntelligence(intelligenceRequest);
    }
    async findSimilarUsers(req, request) {
        try {
            return {
                success: true,
                data: [
                    {
                        userId: 'user123',
                        similarityScore: {
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
                        sharedPreferences: ['italian_cuisine', 'medium_spice', 'family_dining'],
                        recommendationHistory: {
                            sharedRestaurants: ['Olive Garden', 'Taco Bell'],
                            similarRatings: 0.7
                        }
                    }
                ]
            };
        }
        catch (error) {
            return {
                success: false,
                data: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async getUserDemographicInsights(req, userId) {
        try {
            return {
                success: true,
                data: {
                    culturalContext: 'Diverse cultural preferences with emphasis on authentic cuisines',
                    dietaryConsiderations: ['Moderate spice tolerance', 'Open to international cuisines'],
                    socialTrends: ['Weekend brunch', 'Craft cocktails', 'Instagram-worthy presentation'],
                    recommendationFactors: {
                        cuisineBoosts: ['italian', 'mexican', 'asian'],
                        priceAdjustment: 0.0,
                        authenticityPreference: 0.7,
                        spiceToleranceLevel: 6
                    }
                }
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async getDemographicTrends(ageGroup, culturalBackground, location) {
        try {
            return {
                success: true,
                data: {
                    trendsByAge: {
                        '18-24': ['bubble tea', 'korean bbq', 'ramen', 'acai bowls'],
                        '25-34': ['craft cocktails', 'farm-to-table', 'fusion cuisine', 'food trucks'],
                        '35-44': ['family restaurants', 'wine bars', 'mediterranean', 'healthy options'],
                        '45-54': ['steakhouses', 'italian', 'seafood', 'fine dining'],
                        '55+': ['classic american', 'continental', 'comfort food', 'early dining']
                    },
                    trendsByCulture: {
                        asian: ['authentic regional cuisines', 'hot pot', 'dim sum', 'boba tea'],
                        hispanic_latino: ['street food', 'authentic tacos', 'ceviche', 'craft mezcal'],
                        middle_eastern: ['halal options', 'mediterranean', 'kebabs', 'hookah lounges']
                    },
                    trendsByLocation: {
                        urban: ['food halls', 'rooftop dining', 'pop-up restaurants', 'late night eats'],
                        suburban: ['chain restaurants', 'family dining', 'sports bars', 'delivery'],
                        rural: ['local favorites', 'comfort food', 'diners', 'bbq']
                    },
                    emergingTrends: [
                        'plant-based meat alternatives',
                        'ghost kitchens',
                        'contactless dining',
                        'hyper-local ingredients',
                        'cultural fusion'
                    ]
                }
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
};
exports.DemographicIntelligenceController = DemographicIntelligenceController;
__decorate([
    (0, common_1.Post)('analyze'),
    (0, common_1.UseGuards)(passport_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get demographic intelligence analysis',
        description: 'Analyze user demographics to provide personalized restaurant recommendations based on similar users and cultural preferences'
    }),
    (0, swagger_1.ApiBody)({ type: demographic_intelligence_dto_1.DemographicIntelligenceRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Demographic intelligence analysis completed successfully',
        type: demographic_intelligence_dto_1.DemographicIntelligenceResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Authentication required'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid request parameters'
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, demographic_intelligence_dto_1.DemographicIntelligenceRequestDto]),
    __metadata("design:returntype", Promise)
], DemographicIntelligenceController.prototype, "analyzeDemographics", null);
__decorate([
    (0, common_1.Post)('similarity'),
    (0, common_1.UseGuards)(passport_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Find similar users based on demographics',
        description: 'Find users with similar demographic profiles for collaborative filtering recommendations'
    }),
    (0, swagger_1.ApiBody)({ type: demographic_intelligence_dto_1.UserSimilarityRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Similar users found successfully',
        type: demographic_intelligence_dto_1.UserSimilarityResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Authentication required'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'User not found'
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, demographic_intelligence_dto_1.UserSimilarityRequestDto]),
    __metadata("design:returntype", Promise)
], DemographicIntelligenceController.prototype, "findSimilarUsers", null);
__decorate([
    (0, common_1.Get)('insights/:userId'),
    (0, common_1.UseGuards)(passport_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get demographic insights for a user',
        description: 'Get cultural context and demographic insights for personalized recommendations'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Demographic insights retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        culturalContext: { type: 'string' },
                        dietaryConsiderations: { type: 'array', items: { type: 'string' } },
                        socialTrends: { type: 'array', items: { type: 'string' } },
                        recommendationFactors: {
                            type: 'object',
                            properties: {
                                cuisineBoosts: { type: 'array', items: { type: 'string' } },
                                priceAdjustment: { type: 'number' },
                                authenticityPreference: { type: 'number' },
                                spiceToleranceLevel: { type: 'number' }
                            }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Authentication required'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'User not found'
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DemographicIntelligenceController.prototype, "getUserDemographicInsights", null);
__decorate([
    (0, common_1.Get)('trends'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get demographic-based dining trends',
        description: 'Get current dining trends filtered by demographic segments'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Demographic trends retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        trendsByAge: { type: 'object' },
                        trendsByCulture: { type: 'object' },
                        trendsByLocation: { type: 'object' },
                        emergingTrends: { type: 'array', items: { type: 'string' } }
                    }
                }
            }
        }
    }),
    __param(0, (0, common_1.Query)('ageGroup')),
    __param(1, (0, common_1.Query)('culturalBackground')),
    __param(2, (0, common_1.Query)('location')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DemographicIntelligenceController.prototype, "getDemographicTrends", null);
exports.DemographicIntelligenceController = DemographicIntelligenceController = __decorate([
    (0, swagger_1.ApiTags)('Demographic Intelligence'),
    (0, common_1.Controller)('intelligence/demographics'),
    __metadata("design:paramtypes", [demographic_intelligence_service_1.DemographicIntelligenceService])
], DemographicIntelligenceController);
//# sourceMappingURL=demographic-intelligence.controller.js.map