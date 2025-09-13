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
var IntelligenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const weather_intelligence_service_1 = require("./weather/weather-intelligence.service");
const event_intelligence_service_1 = require("./events/event-intelligence.service");
const sentiment_analysis_service_1 = require("./sentiment/sentiment-analysis.service");
const economic_intelligence_service_1 = require("./economic/economic-intelligence.service");
const health_intelligence_service_1 = require("./health/health-intelligence.service");
const demographics_service_1 = require("./demographics/demographics.service");
const temporal_intelligence_service_1 = require("./temporal/temporal-intelligence.service");
const media_intelligence_service_1 = require("./media/media-intelligence.service");
const apify_social_intelligence_service_1 = require("./apify-social-intelligence.service");
const demographic_intelligence_service_1 = require("./demographic-intelligence.service");
let IntelligenceService = IntelligenceService_1 = class IntelligenceService {
    weatherService;
    eventService;
    sentimentService;
    economicService;
    healthService;
    demographicsService;
    temporalService;
    mediaService;
    apifySocialService;
    demographicIntelligenceService;
    logger = new common_1.Logger(IntelligenceService_1.name);
    constructor(weatherService, eventService, sentimentService, economicService, healthService, demographicsService, temporalService, mediaService, apifySocialService, demographicIntelligenceService) {
        this.weatherService = weatherService;
        this.eventService = eventService;
        this.sentimentService = sentimentService;
        this.economicService = economicService;
        this.healthService = healthService;
        this.demographicsService = demographicsService;
        this.temporalService = temporalService;
        this.mediaService = mediaService;
        this.apifySocialService = apifySocialService;
        this.demographicIntelligenceService = demographicIntelligenceService;
    }
    async getComprehensiveIntelligence(request) {
        try {
            const startTime = Date.now();
            const demographicFilter = request.demographic_data && request.enable_demographic_filtering ? {
                nationality: request.demographic_data.nationality ? [request.demographic_data.nationality] : undefined,
                ageGroups: request.demographic_data.ageGroup ? [request.demographic_data.ageGroup] : undefined,
                culturalBackgrounds: request.demographic_data.culturalBackground ? [request.demographic_data.culturalBackground] : undefined,
                incomeBrackets: request.demographic_data.incomeBracket ? [request.demographic_data.incomeBracket] : undefined,
                familyStructures: request.demographic_data.familyStructure ? [request.demographic_data.familyStructure] : undefined,
                minSpiceTolerance: request.demographic_data.spiceToleranceLevel,
                maxSpiceTolerance: request.demographic_data.spiceToleranceLevel,
                minAuthenticityPreference: request.demographic_data.authenticityPreference,
                maxAuthenticityPreference: request.demographic_data.authenticityPreference,
            } : undefined;
            const [weatherIntel, eventIntel, sentimentIntel, economicIntel, healthIntel, demographicsIntel, temporalIntel, mediaIntel, apifySocialIntel, demographicIntel,] = await Promise.allSettled([
                this.weatherService.getWeatherFoodCorrelation(request.location),
                this.eventService.getEventImpactAnalysis(request.location, request.radius),
                this.sentimentService.analyzeFoodSentiment(request.location),
                this.economicService.analyzeEconomicImpact(),
                this.healthService.analyzeHealthFoodCorrelation(request.location),
                this.demographicsService.analyzeDemographicPatterns(request.location),
                this.temporalService.analyzeTemporalBehavior(),
                this.mediaService.analyzeMediaInfluence(request.location),
                demographicFilter
                    ? this.apifySocialService.orchestrateDemographicFilteredIntelligence(request.location, request.user_context.preferences, demographicFilter)
                    : this.apifySocialService.orchestrateSocialIntelligence(request.location, request.user_context.preferences),
                request.demographic_data
                    ? this.demographicIntelligenceService.getDemographicIntelligence({
                        userDemographics: request.demographic_data,
                        targetLocation: request.location,
                        cuisineTypes: request.user_context.preferences,
                        priceRange: request.user_context.budget,
                        diningMode: request.user_context.mode
                    })
                    : Promise.resolve({ success: false, data: null, error: 'No demographic data provided' }),
            ]);
            const intelligenceData = this.processIntelligenceResults({
                weather: weatherIntel,
                events: eventIntel,
                sentiment: sentimentIntel,
                economic: economicIntel,
                health: healthIntel,
                demographics: demographicsIntel,
                temporal: temporalIntel,
                media: mediaIntel,
                apifySocial: apifySocialIntel,
                demographic: demographicIntel,
            });
            const intelligenceSummary = this.calculateIntelligenceSummary(intelligenceData, request.user_context);
            const aiRecommendationContext = this.generateAIRecommendationContext(intelligenceData, intelligenceSummary, request);
            const confidenceScore = this.calculateConfidenceScore(intelligenceData, intelligenceSummary);
            const responseTime = Date.now() - startTime;
            this.logger.log(`Comprehensive intelligence analysis completed in ${responseTime}ms`);
            const demographicIntelligenceData = intelligenceData.demographic?.success
                ? {
                    similar_users_count: intelligenceData.demographic.data?.similarUsers?.count || 0,
                    cultural_preferences: intelligenceData.demographic.data?.similarUsers?.commonPreferences?.topCuisines?.map((cuisine) => cuisine.name) || [],
                    authenticity_score: intelligenceData.demographic.data?.recommendations?.authenticityFactor || 0,
                    spice_level_recommendation: intelligenceData.demographic.data?.recommendations?.spiceLevelRecommendation || 5,
                    cuisine_boosts: intelligenceData.demographic.data?.recommendations?.cuisineBoosts || [],
                    price_adjustment: intelligenceData.demographic.data?.recommendations?.priceAdjustment || 0,
                    demographic_insights: [
                        intelligenceData.demographic.data?.insights?.culturalContext || '',
                        ...(intelligenceData.demographic.data?.insights?.dietaryConsiderations || []),
                        ...(intelligenceData.demographic.data?.insights?.socialTrends || [])
                    ].filter(insight => insight && insight.length > 0),
                }
                : undefined;
            return {
                intelligence_summary: intelligenceSummary,
                apify_social_intelligence: intelligenceData.apifySocial,
                demographic_intelligence: demographicIntelligenceData,
                ai_recommendation_context: aiRecommendationContext,
                confidence_score: confidenceScore,
                last_updated: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get comprehensive intelligence:', error.message);
            throw new Error(`Comprehensive intelligence unavailable: ${error.message}`);
        }
    }
    processIntelligenceResults(results) {
        const processedData = {};
        Object.keys(results).forEach(key => {
            const result = results[key];
            if (result.status === 'fulfilled') {
                processedData[key] = result.value;
            }
            else {
                this.logger.warn(`${key} intelligence failed:`, result.reason?.message || 'Unknown error');
                processedData[key] = null;
            }
        });
        return processedData;
    }
    calculateIntelligenceSummary(intelligenceData, userContext) {
        return {
            weather_factor: this.calculateWeatherFactor(intelligenceData.weather),
            event_impact: this.calculateEventImpact(intelligenceData.events),
            sentiment_boost: this.calculateSentimentBoost(intelligenceData.sentiment, userContext),
            economic_factor: this.calculateEconomicFactor(intelligenceData.economic),
            health_consideration: this.calculateHealthConsideration(intelligenceData.health),
            demographic_match: this.calculateDemographicMatch(intelligenceData.demographics, userContext),
            temporal_optimal: this.calculateTemporalOptimal(intelligenceData.temporal),
            media_trending: this.calculateMediaTrending(intelligenceData.media),
            social_media_boost: this.calculateSocialMediaBoost(intelligenceData.apifySocial),
        };
    }
    calculateWeatherFactor(weatherData) {
        if (!weatherData)
            return 0.5;
        const temperatureImpact = weatherData.food_correlation.temperature_impact;
        const comfortFoodTrigger = weatherData.food_correlation.comfort_food_trigger ? 0.3 : 0;
        const seasonalBonus = weatherData.food_correlation.seasonal_trends.length * 0.05;
        return Math.min(1.0, temperatureImpact + comfortFoodTrigger + seasonalBonus);
    }
    calculateEventImpact(eventData) {
        if (!eventData)
            return 0.5;
        const demandMultiplier = eventData.impact_analysis.restaurant_demand;
        const eventCount = eventData.local_events.sports_events.length +
            eventData.local_events.cultural_events.length +
            eventData.local_events.business_conferences.length;
        let impact = (demandMultiplier - 1.0) / 2.0;
        if (eventData.impact_analysis.traffic_impact.includes('severe')) {
            impact += 0.2;
        }
        else if (eventData.impact_analysis.traffic_impact.includes('moderate')) {
            impact += 0.1;
        }
        return Math.max(0.1, Math.min(1.0, impact));
    }
    calculateSentimentBoost(sentimentData, userContext) {
        if (!sentimentData)
            return 0.5;
        let boost = 0.5;
        const userPreferences = userContext.preferences || [];
        userPreferences.forEach((preference) => {
            const cuisineSentiment = sentimentData.cuisine_sentiment[preference];
            if (cuisineSentiment) {
                boost += cuisineSentiment.sentiment_score * 0.2;
                if (cuisineSentiment.trend_direction === 'rising') {
                    boost += 0.1;
                }
            }
        });
        boost += sentimentData.local_food_buzz.viral_dishes.length * 0.05;
        boost += sentimentData.local_food_buzz.positive_trends.length * 0.03;
        boost -= sentimentData.local_food_buzz.controversy_alerts.length * 0.1;
        return Math.max(0.1, Math.min(1.0, boost));
    }
    calculateEconomicFactor(economicData) {
        if (!economicData)
            return 0.5;
        let factor = 0.5;
        const confidence = economicData.economic_indicators.consumer_confidence;
        if (confidence > 110) {
            factor += 0.3;
        }
        else if (confidence > 100) {
            factor += 0.2;
        }
        else if (confidence < 85) {
            factor -= 0.2;
        }
        const unemployment = economicData.economic_indicators.local_unemployment;
        if (unemployment < 4) {
            factor += 0.2;
        }
        else if (unemployment > 7) {
            factor -= 0.2;
        }
        const foodInflation = economicData.economic_indicators.food_inflation;
        if (foodInflation > 6) {
            factor -= 0.15;
        }
        else if (foodInflation < 2) {
            factor += 0.1;
        }
        return Math.max(0.1, Math.min(1.0, factor));
    }
    calculateHealthConsideration(healthData) {
        if (!healthData)
            return 0.5;
        let consideration = 0.5;
        const fluActivity = healthData.health_trends.flu_activity;
        if (fluActivity === 'very high' || fluActivity === 'high') {
            consideration += 0.3;
        }
        else if (fluActivity === 'low') {
            consideration += 0.1;
        }
        const aqi = healthData.health_trends.air_quality_index;
        if (aqi > 150) {
            consideration += 0.3;
        }
        else if (aqi > 100) {
            consideration += 0.2;
        }
        if (healthData.health_trends.allergy_forecast === 'high') {
            consideration += 0.2;
        }
        return Math.max(0.1, Math.min(1.0, consideration));
    }
    calculateDemographicMatch(demographicsData, userContext) {
        if (!demographicsData)
            return 0.5;
        let match = 0.5;
        const userPreferences = userContext.preferences || [];
        const authenticityExpected = demographicsData.food_culture_correlation.authenticity_expectations;
        const matchingPreferences = userPreferences.filter((pref) => authenticityExpected.some((expected) => expected.toLowerCase().includes(pref.toLowerCase())));
        match += (matchingPreferences.length / Math.max(userPreferences.length, 1)) * 0.3;
        match += demographicsData.food_culture_correlation.fusion_acceptance * 0.2;
        match += demographicsData.food_culture_correlation.experimental_dining * 0.2;
        return Math.max(0.1, Math.min(1.0, match));
    }
    calculateTemporalOptimal(temporalData) {
        if (!temporalData)
            return 0.5;
        let optimal = 0.5;
        const energyState = temporalData.behavioral_patterns.energy_state;
        if (energyState.includes('peak') || energyState.includes('high')) {
            optimal += 0.3;
        }
        else if (energyState.includes('moderate')) {
            optimal += 0.1;
        }
        else if (energyState.includes('low')) {
            optimal -= 0.1;
        }
        optimal += temporalData.behavioral_patterns.social_dining_likelihood * 0.3;
        const mealTiming = temporalData.behavioral_patterns.meal_timing;
        if (mealTiming.includes('time')) {
            optimal += 0.2;
        }
        return Math.max(0.1, Math.min(1.0, optimal));
    }
    calculateMediaTrending(mediaData) {
        if (!mediaData)
            return 0.5;
        let trending = 0.5;
        trending += mediaData.media_trends.viral_food_content.length * 0.08;
        trending += mediaData.media_trends.celebrity_influence.length * 0.06;
        trending += mediaData.media_trends.tv_show_impact.length * 0.08;
        trending *= mediaData.trend_prediction.sustainability;
        return Math.max(0.1, Math.min(1.0, trending));
    }
    generateAIRecommendationContext(intelligenceData, intelligenceSummary, request) {
        const contextParts = [];
        if (intelligenceData.weather && intelligenceSummary.weather_factor > 0.7) {
            const weatherRec = intelligenceData.weather.recommendations;
            contextParts.push(`Weather strongly favors ${weatherRec.cuisine_boost.join(', ')}`);
            if (weatherRec.dining_mode.includes('delivery')) {
                contextParts.push('delivery is recommended due to weather conditions');
            }
        }
        if (intelligenceData.events && intelligenceSummary.event_impact > 0.6) {
            const eventImpact = intelligenceData.events.impact_analysis;
            if (eventImpact.restaurant_demand > 1.5) {
                contextParts.push(`${Math.round((eventImpact.restaurant_demand - 1) * 100)}% higher restaurant demand due to local events`);
            }
        }
        if (intelligenceData.sentiment && intelligenceSummary.sentiment_boost > 0.8) {
            const viralDishes = intelligenceData.sentiment.local_food_buzz.viral_dishes;
            if (viralDishes.length > 0) {
                contextParts.push(`trending foods include ${viralDishes.slice(0, 2).join(', ')}`);
            }
        }
        if (intelligenceData.economic && intelligenceSummary.economic_factor < 0.4) {
            contextParts.push('economic conditions favor budget-friendly dining options');
        }
        if (intelligenceData.health && intelligenceSummary.health_consideration > 0.7) {
            const healthRecs = intelligenceData.health.nutritional_recommendations;
            if (healthRecs.immune_boost_foods.length > 0) {
                contextParts.push(`health trends suggest ${healthRecs.immune_boost_foods.slice(0, 2).join(', ')} are beneficial`);
            }
        }
        if (intelligenceData.temporal && intelligenceSummary.temporal_optimal > 0.8) {
            const cravings = intelligenceData.temporal.behavioral_patterns.craving_predictions;
            contextParts.push(`current time patterns suggest cravings for ${cravings.slice(0, 2).join(', ')}`);
        }
        if (intelligenceData.apifySocial && intelligenceSummary.social_media_boost > 0.8) {
            const viralTrends = intelligenceData.apifySocial.cross_platform_analysis.viral_convergence;
            if (viralTrends.length > 0) {
                contextParts.push(`UNPRECEDENTED social media convergence: ${viralTrends.slice(0, 2).join(', ')} trending across ${intelligenceData.apifySocial.cross_platform_analysis.platform_influence_ranking.slice(0, 3).join(', ')}`);
            }
            const unifiedSentiment = intelligenceData.apifySocial.cross_platform_analysis.unified_sentiment;
            if (unifiedSentiment > 0.6) {
                contextParts.push(`${Math.round(unifiedSentiment * 100)}% positive social sentiment across all platforms`);
            }
        }
        if (contextParts.length === 0) {
            contextParts.push('balanced conditions across all intelligence factors');
        }
        return contextParts.join(', ') + '. ' +
            `Recommendations optimized for ${request.user_context.mode} dining with ` +
            `${request.user_context.group_size} person${request.user_context.group_size > 1 ? 's' : ''} ` +
            `and ${request.user_context.budget} budget.`;
    }
    calculateSocialMediaBoost(apifySocialData) {
        if (!apifySocialData)
            return 0.5;
        let boost = 0.5;
        const viralConvergence = apifySocialData.cross_platform_analysis.viral_convergence;
        boost += viralConvergence.length * 0.05;
        const unifiedSentiment = apifySocialData.cross_platform_analysis.unified_sentiment;
        boost += unifiedSentiment * 0.3;
        const topPlatforms = apifySocialData.cross_platform_analysis.platform_influence_ranking.slice(0, 3);
        boost += topPlatforms.length * 0.05;
        boost += apifySocialData.ai_social_insights.authenticity_score * 0.2;
        boost += apifySocialData.ai_social_insights.trend_sustainability * 0.15;
        if (apifySocialData.ai_social_insights.local_vs_global === 'local') {
            boost += 0.2;
        }
        else if (apifySocialData.ai_social_insights.local_vs_global === 'mixed') {
            boost += 0.1;
        }
        return Math.max(0.1, Math.min(1.0, boost));
    }
    calculateConfidenceScore(intelligenceData, intelligenceSummary) {
        let confidence = 0.5;
        const successfulLayers = Object.values(intelligenceData).filter(data => data !== null).length;
        const totalLayers = Object.keys(intelligenceData).length;
        const successRate = successfulLayers / totalLayers;
        confidence = successRate * 0.6;
        const factors = Object.values(intelligenceSummary);
        const avgFactorStrength = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
        confidence += avgFactorStrength * 0.4;
        const strongFactors = factors.filter(factor => factor > 0.8).length;
        if (strongFactors >= 3) {
            confidence += 0.1;
        }
        return Math.round(Math.max(0.1, Math.min(1.0, confidence)) * 100);
    }
};
exports.IntelligenceService = IntelligenceService;
exports.IntelligenceService = IntelligenceService = IntelligenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [weather_intelligence_service_1.WeatherIntelligenceService,
        event_intelligence_service_1.EventIntelligenceService,
        sentiment_analysis_service_1.SentimentAnalysisService,
        economic_intelligence_service_1.EconomicIntelligenceService,
        health_intelligence_service_1.HealthIntelligenceService,
        demographics_service_1.DemographicsService,
        temporal_intelligence_service_1.TemporalIntelligenceService,
        media_intelligence_service_1.MediaIntelligenceService,
        apify_social_intelligence_service_1.ApifySocialIntelligenceService,
        demographic_intelligence_service_1.DemographicIntelligenceService])
], IntelligenceService);
//# sourceMappingURL=intelligence.service.js.map