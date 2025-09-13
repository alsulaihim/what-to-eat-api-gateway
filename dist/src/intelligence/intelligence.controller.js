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
exports.IntelligenceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const firebase_auth_guard_1 = require("../auth/firebase-auth.guard");
const weather_intelligence_service_1 = require("./weather/weather-intelligence.service");
const event_intelligence_service_1 = require("./events/event-intelligence.service");
const sentiment_analysis_service_1 = require("./sentiment/sentiment-analysis.service");
const economic_intelligence_service_1 = require("./economic/economic-intelligence.service");
const health_intelligence_service_1 = require("./health/health-intelligence.service");
const demographics_service_1 = require("./demographics/demographics.service");
const temporal_intelligence_service_1 = require("./temporal/temporal-intelligence.service");
const media_intelligence_service_1 = require("./media/media-intelligence.service");
const intelligence_service_1 = require("./intelligence.service");
let IntelligenceController = class IntelligenceController {
    weatherService;
    eventService;
    sentimentService;
    economicService;
    healthService;
    demographicsService;
    temporalService;
    mediaService;
    intelligenceService;
    constructor(weatherService, eventService, sentimentService, economicService, healthService, demographicsService, temporalService, mediaService, intelligenceService) {
        this.weatherService = weatherService;
        this.eventService = eventService;
        this.sentimentService = sentimentService;
        this.economicService = economicService;
        this.healthService = healthService;
        this.demographicsService = demographicsService;
        this.temporalService = temporalService;
        this.mediaService = mediaService;
        this.intelligenceService = intelligenceService;
    }
    async getWeatherCorrelation(location, request) {
        if (!location) {
            throw new Error('Location parameter is required');
        }
        return this.weatherService.getWeatherFoodCorrelation(location);
    }
    async getEventImpact(location, radiusKm = '25', request) {
        if (!location) {
            throw new Error('Location parameter is required');
        }
        return this.eventService.getEventImpactAnalysis(location, parseInt(radiusKm, 10));
    }
    async getSentimentAnalysis(location, request) {
        if (!location) {
            throw new Error('Location parameter is required');
        }
        return this.sentimentService.analyzeFoodSentiment(location);
    }
    async getEconomicImpact(request) {
        return this.economicService.analyzeEconomicImpact();
    }
    async getHealthCorrelation(location, request) {
        if (!location) {
            throw new Error('Location parameter is required');
        }
        return this.healthService.analyzeHealthFoodCorrelation(location);
    }
    async getDemographicPatterns(location, request) {
        if (!location) {
            throw new Error('Location parameter is required');
        }
        return this.demographicsService.analyzeDemographicPatterns(location);
    }
    async getTemporalBehavior(timezone = 'America/New_York', request) {
        return this.temporalService.analyzeTemporalBehavior(timezone);
    }
    async getMediaInfluence(location, request) {
        if (!location) {
            throw new Error('Location parameter is required');
        }
        return this.mediaService.analyzeMediaInfluence(location);
    }
    async getComprehensiveIntelligence(request, req) {
        if (!request.location) {
            throw new Error('Location is required');
        }
        if (!request.user_context) {
            throw new Error('User context is required');
        }
        return this.intelligenceService.getComprehensiveIntelligence(request);
    }
};
exports.IntelligenceController = IntelligenceController;
__decorate([
    (0, common_1.Get)('weather-correlation'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get weather-food correlation analysis',
        description: 'Analyzes weather conditions and their impact on food preferences and dining behavior',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Weather intelligence data retrieved successfully',
        type: Object,
    }),
    __param(0, (0, common_1.Query)('location')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getWeatherCorrelation", null);
__decorate([
    (0, common_1.Get)('event-impact'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get event impact analysis',
        description: 'Analyzes local events impact on restaurant demand and dining patterns',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Event intelligence data retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('location')),
    __param(1, (0, common_1.Query)('radius')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getEventImpact", null);
__decorate([
    (0, common_1.Get)('sentiment-analysis'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get food sentiment analysis',
        description: 'Analyzes real-time sentiment around cuisines and food trends',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Sentiment intelligence data retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('location')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getSentimentAnalysis", null);
__decorate([
    (0, common_1.Get)('economic-impact'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get economic impact analysis',
        description: 'Analyzes economic indicators and their effect on dining behavior',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Economic intelligence data retrieved successfully',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getEconomicImpact", null);
__decorate([
    (0, common_1.Get)('health-correlation'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get health-food correlation analysis',
        description: 'Analyzes health trends and their correlation with nutritional recommendations',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Health intelligence data retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('location')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getHealthCorrelation", null);
__decorate([
    (0, common_1.Get)('demographic-patterns'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get demographic food patterns',
        description: 'Analyzes demographic data and cultural food preferences',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Demographics intelligence data retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('location')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getDemographicPatterns", null);
__decorate([
    (0, common_1.Get)('temporal-behavior'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get temporal behavior analysis',
        description: 'Analyzes time-based patterns in food behavior and preferences',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Temporal intelligence data retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('timezone')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getTemporalBehavior", null);
__decorate([
    (0, common_1.Get)('media-influence'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get media influence analysis',
        description: 'Analyzes media trends and their influence on food preferences',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Media intelligence data retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('location')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getMediaInfluence", null);
__decorate([
    (0, common_1.Post)('comprehensive'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get comprehensive intelligence analysis',
        description: 'Aggregates all intelligence layers for comprehensive food recommendation context',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Comprehensive intelligence data retrieved successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getComprehensiveIntelligence", null);
exports.IntelligenceController = IntelligenceController = __decorate([
    (0, swagger_1.ApiTags)('intelligence'),
    (0, common_1.Controller)('intelligence'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [weather_intelligence_service_1.WeatherIntelligenceService,
        event_intelligence_service_1.EventIntelligenceService,
        sentiment_analysis_service_1.SentimentAnalysisService,
        economic_intelligence_service_1.EconomicIntelligenceService,
        health_intelligence_service_1.HealthIntelligenceService,
        demographics_service_1.DemographicsService,
        temporal_intelligence_service_1.TemporalIntelligenceService,
        media_intelligence_service_1.MediaIntelligenceService,
        intelligence_service_1.IntelligenceService])
], IntelligenceController);
//# sourceMappingURL=intelligence.controller.js.map