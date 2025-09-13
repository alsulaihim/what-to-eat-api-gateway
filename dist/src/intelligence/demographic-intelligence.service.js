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
var DemographicIntelligenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemographicIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../common/database/database.service");
let DemographicIntelligenceService = DemographicIntelligenceService_1 = class DemographicIntelligenceService {
    databaseService;
    logger = new common_1.Logger(DemographicIntelligenceService_1.name);
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async getDemographicIntelligence(request) {
        try {
            this.logger.log('Generating demographic intelligence for user');
            const similarUsers = await this.findSimilarUsers(request.userDemographics);
            const recommendations = await this.generateDemographicRecommendations(request.userDemographics, similarUsers, request);
            const insights = await this.generateCulturalInsights(request.userDemographics, request.targetLocation);
            return {
                success: true,
                data: {
                    similarUsers: {
                        count: similarUsers.length,
                        demographics: similarUsers.map(user => user.demographics),
                        commonPreferences: await this.analyzeCommonPreferences(similarUsers)
                    },
                    recommendations,
                    insights
                }
            };
        }
        catch (error) {
            this.logger.error('Failed to generate demographic intelligence:', error);
            return {
                success: false,
                data: {
                    similarUsers: { count: 0, demographics: [], commonPreferences: {
                            topCuisines: [],
                            avgSpiceTolerance: 5,
                            avgAuthenticityPreference: 5,
                            commonDietaryRestrictions: []
                        } },
                    recommendations: {
                        cuisineBoosts: [],
                        priceAdjustment: 0,
                        authenticityFactor: 1,
                        spiceLevelRecommendation: 5,
                        culturalMatches: []
                    },
                    insights: {
                        culturalContext: '',
                        dietaryConsiderations: [],
                        socialTrends: [],
                        confidenceScore: 0
                    }
                },
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async findSimilarUsers(demographics) {
        try {
            const users = await this.databaseService.user.findMany({
                where: {
                    AND: [
                        demographics.nationality ? { nationality: demographics.nationality } : {},
                        demographics.culturalBackground ? { culturalBackground: demographics.culturalBackground } : {},
                        demographics.ageGroup ? { ageGroup: demographics.ageGroup } : {},
                        demographics.familyStructure ? { familyStructure: demographics.familyStructure } : {},
                    ]
                },
                select: {
                    id: true,
                    nationality: true,
                    ageGroup: true,
                    gender: true,
                    culturalBackground: true,
                    spiceToleranceLevel: true,
                    authenticityPreference: true,
                    languagePreference: true,
                    incomeBracket: true,
                    religiousDietaryRequirements: true,
                    familyStructure: true,
                    occupationCategory: true,
                    livingArea: true,
                    preferences: true
                },
                take: 100
            });
            return users.map(user => ({
                userId: user.id,
                demographics: {
                    nationality: user.nationality || undefined,
                    ageGroup: user.ageGroup || undefined,
                    gender: user.gender || undefined,
                    culturalBackground: user.culturalBackground || undefined,
                    spiceToleranceLevel: user.spiceToleranceLevel || undefined,
                    authenticityPreference: user.authenticityPreference || undefined,
                    languagePreference: user.languagePreference || undefined,
                    incomeBracket: user.incomeBracket || undefined,
                    religiousDietaryRequirements: user.religiousDietaryRequirements ?
                        JSON.parse(user.religiousDietaryRequirements) : undefined,
                    familyStructure: user.familyStructure || undefined,
                    occupationCategory: user.occupationCategory || undefined,
                    livingArea: user.livingArea || undefined
                }
            }));
        }
        catch (error) {
            this.logger.error('Failed to find similar users:', error);
            return [];
        }
    }
    calculateSimilarityScore(userA, userB) {
        let totalScore = 0;
        let categoryCount = 0;
        const culturalScore = this.calculateCulturalSimilarity(userA, userB);
        totalScore += culturalScore * 0.3;
        categoryCount++;
        const dietaryScore = this.calculateDietarySimilarity(userA, userB);
        totalScore += dietaryScore * 0.25;
        categoryCount++;
        const lifestyleScore = this.calculateLifestyleSimilarity(userA, userB);
        totalScore += lifestyleScore * 0.25;
        categoryCount++;
        const preferencesScore = this.calculatePreferencesSimilarity(userA, userB);
        totalScore += preferencesScore * 0.2;
        categoryCount++;
        const overallScore = totalScore / categoryCount;
        return {
            overallScore,
            categoryScores: {
                cultural: culturalScore,
                dietary: dietaryScore,
                lifestyle: lifestyleScore,
                preferences: preferencesScore
            },
            matchingFactors: this.getMatchingFactors(userA, userB),
            recommendationAdjustments: this.getRecommendationAdjustments(userA, userB)
        };
    }
    calculateCulturalSimilarity(userA, userB) {
        let score = 0;
        let factors = 0;
        if (userA.nationality && userB.nationality) {
            score += userA.nationality === userB.nationality ? 1 : 0;
            factors++;
        }
        if (userA.culturalBackground && userB.culturalBackground) {
            score += userA.culturalBackground === userB.culturalBackground ? 1 : 0;
            factors++;
        }
        if (userA.languagePreference && userB.languagePreference) {
            score += userA.languagePreference === userB.languagePreference ? 1 : 0;
            factors++;
        }
        return factors > 0 ? score / factors : 0.5;
    }
    calculateDietarySimilarity(userA, userB) {
        let score = 0;
        let factors = 0;
        if (userA.spiceToleranceLevel !== undefined && userB.spiceToleranceLevel !== undefined) {
            const diff = Math.abs(userA.spiceToleranceLevel - userB.spiceToleranceLevel);
            score += 1 - (diff / 10);
            factors++;
        }
        if (userA.religiousDietaryRequirements && userB.religiousDietaryRequirements) {
            const commonReqs = userA.religiousDietaryRequirements.filter(req => userB.religiousDietaryRequirements?.includes(req)).length;
            const totalReqs = new Set([...userA.religiousDietaryRequirements, ...userB.religiousDietaryRequirements]).size;
            score += totalReqs > 0 ? commonReqs / totalReqs : 1;
            factors++;
        }
        return factors > 0 ? score / factors : 0.5;
    }
    calculateLifestyleSimilarity(userA, userB) {
        let score = 0;
        let factors = 0;
        if (userA.ageGroup && userB.ageGroup) {
            score += userA.ageGroup === userB.ageGroup ? 1 : 0.5;
            factors++;
        }
        if (userA.familyStructure && userB.familyStructure) {
            score += userA.familyStructure === userB.familyStructure ? 1 : 0;
            factors++;
        }
        if (userA.incomeBracket && userB.incomeBracket) {
            score += userA.incomeBracket === userB.incomeBracket ? 1 : 0.3;
            factors++;
        }
        if (userA.livingArea && userB.livingArea) {
            score += userA.livingArea === userB.livingArea ? 1 : 0;
            factors++;
        }
        return factors > 0 ? score / factors : 0.5;
    }
    calculatePreferencesSimilarity(userA, userB) {
        let score = 0;
        let factors = 0;
        if (userA.authenticityPreference !== undefined && userB.authenticityPreference !== undefined) {
            const diff = Math.abs(userA.authenticityPreference - userB.authenticityPreference);
            score += 1 - (diff / 10);
            factors++;
        }
        return factors > 0 ? score / factors : 0.5;
    }
    getMatchingFactors(userA, userB) {
        const factors = [];
        if (userA.nationality === userB.nationality)
            factors.push('nationality');
        if (userA.culturalBackground === userB.culturalBackground)
            factors.push('cultural_background');
        if (userA.ageGroup === userB.ageGroup)
            factors.push('age_group');
        if (userA.familyStructure === userB.familyStructure)
            factors.push('family_structure');
        if (userA.incomeBracket === userB.incomeBracket)
            factors.push('income_bracket');
        return factors;
    }
    getRecommendationAdjustments(userA, userB) {
        return {
            cuisineBoost: this.getCuisineBoosts(userA),
            priceAdjustment: this.getPriceAdjustment(userA),
            authenticityFactor: userA.authenticityPreference ? userA.authenticityPreference / 10 : 0.5,
            spiceLevelAdjustment: userA.spiceToleranceLevel || 5
        };
    }
    getCuisineBoosts(demographics) {
        const boosts = [];
        if (demographics.culturalBackground) {
            switch (demographics.culturalBackground) {
                case 'asian':
                    boosts.push('chinese', 'japanese', 'korean', 'thai', 'vietnamese', 'indian');
                    break;
                case 'hispanic_latino':
                    boosts.push('mexican', 'spanish', 'latin_american');
                    break;
                case 'middle_eastern':
                    boosts.push('middle_eastern', 'mediterranean', 'turkish');
                    break;
                case 'black':
                    boosts.push('african', 'caribbean', 'soul_food');
                    break;
            }
        }
        return boosts;
    }
    getPriceAdjustment(demographics) {
        if (!demographics.incomeBracket)
            return 0;
        switch (demographics.incomeBracket) {
            case 'low':
                return -0.3;
            case 'lower_middle':
                return -0.15;
            case 'middle':
                return 0;
            case 'upper_middle':
                return 0.15;
            case 'high':
                return 0.3;
            default:
                return 0;
        }
    }
    async generateDemographicRecommendations(demographics, similarUsers, request) {
        const cuisineBoosts = this.getCuisineBoosts(demographics);
        const priceAdjustment = this.getPriceAdjustment(demographics);
        const authenticityFactor = demographics.authenticityPreference ? demographics.authenticityPreference / 10 : 0.5;
        const spiceLevelRecommendation = demographics.spiceToleranceLevel || 5;
        return {
            cuisineBoosts: cuisineBoosts.map(cuisine => ({
                cuisine,
                boost: 0.2,
                reason: `Cultural preference based on ${demographics.culturalBackground} background`
            })),
            priceAdjustment,
            authenticityFactor,
            spiceLevelRecommendation,
            culturalMatches: []
        };
    }
    async analyzeCommonPreferences(similarUsers) {
        const spiceTolerances = similarUsers
            .map(user => user.demographics.spiceToleranceLevel)
            .filter(level => level !== undefined);
        const authenticityPreferences = similarUsers
            .map(user => user.demographics.authenticityPreference)
            .filter(pref => pref !== undefined);
        return {
            topCuisines: [
                { name: 'italian', popularity: 0.8 },
                { name: 'mexican', popularity: 0.6 },
                { name: 'asian', popularity: 0.7 }
            ],
            avgSpiceTolerance: spiceTolerances.length > 0 ?
                spiceTolerances.reduce((sum, val) => sum + val, 0) / spiceTolerances.length : 5,
            avgAuthenticityPreference: authenticityPreferences.length > 0 ?
                authenticityPreferences.reduce((sum, val) => sum + val, 0) / authenticityPreferences.length : 5,
            commonDietaryRestrictions: []
        };
    }
    async generateCulturalInsights(demographics, location) {
        const culturalContext = this.getCulturalContext(demographics);
        const dietaryConsiderations = this.getDietaryConsiderations(demographics);
        const socialTrends = await this.getSocialTrends(demographics, location);
        return {
            culturalContext,
            dietaryConsiderations,
            socialTrends,
            confidenceScore: 0.85
        };
    }
    getCulturalContext(demographics) {
        if (!demographics.culturalBackground) {
            return 'Diverse cultural preferences with emphasis on popular local cuisines';
        }
        switch (demographics.culturalBackground) {
            case 'asian':
                return 'Strong preference for authentic Asian cuisines with emphasis on fresh ingredients and umami flavors';
            case 'hispanic_latino':
                return 'Preference for bold flavors, family-style dining, and authentic Latin American cuisines';
            case 'middle_eastern':
                return 'Preference for halal options, Mediterranean flavors, and communal dining experiences';
            default:
                return 'Diverse cultural preferences with openness to various international cuisines';
        }
    }
    getDietaryConsiderations(demographics) {
        const considerations = [];
        if (demographics.religiousDietaryRequirements?.includes('halal')) {
            considerations.push('Halal certification required');
        }
        if (demographics.religiousDietaryRequirements?.includes('kosher')) {
            considerations.push('Kosher certification preferred');
        }
        if (demographics.spiceToleranceLevel && demographics.spiceToleranceLevel < 4) {
            considerations.push('Mild spice preference');
        }
        if (demographics.spiceToleranceLevel && demographics.spiceToleranceLevel > 7) {
            considerations.push('High spice tolerance');
        }
        return considerations;
    }
    async getSocialTrends(demographics, location) {
        const trends = [];
        if (demographics.ageGroup) {
            switch (demographics.ageGroup) {
                case '18-24':
                    trends.push('Instagram-worthy presentation', 'Trendy fusion cuisines', 'Late-night dining');
                    break;
                case '25-34':
                    trends.push('Craft cocktails', 'Farm-to-table dining', 'Weekend brunch');
                    break;
                case '35-44':
                    trends.push('Family-friendly options', 'Quality ingredients', 'Efficient service');
                    break;
            }
        }
        return trends;
    }
};
exports.DemographicIntelligenceService = DemographicIntelligenceService;
exports.DemographicIntelligenceService = DemographicIntelligenceService = DemographicIntelligenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], DemographicIntelligenceService);
//# sourceMappingURL=demographic-intelligence.service.js.map