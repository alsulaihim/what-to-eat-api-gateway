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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TrendsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const database_service_1 = require("../../common/database/database.service");
let TrendsService = TrendsService_1 = class TrendsService {
    configService;
    databaseService;
    logger = new common_1.Logger(TrendsService_1.name);
    httpClient;
    apiKey;
    constructor(configService, databaseService) {
        this.configService = configService;
        this.databaseService = databaseService;
        this.apiKey = this.configService.get('GOOGLE_TRENDS_API_KEY') || '';
        if (!this.apiKey) {
            this.logger.warn('Google Trends API key not configured - using mock data');
        }
        this.httpClient = axios_1.default.create({
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Food-Recommendation-Engine/1.0',
            },
        });
    }
    async getTrendingFood(request) {
        try {
            const startTime = Date.now();
            const trendingFoods = await this.getMockTrendingData(request);
            const responseTime = Date.now() - startTime;
            await this.trackApiUsage('google_trends', 'trending-food', 0.001, responseTime, true);
            this.logger.debug(`Retrieved ${trendingFoods.length} trending food items`);
            return trendingFoods;
        }
        catch (error) {
            this.logger.error('Failed to get trending food data:', error);
            await this.trackApiUsage('google_trends', 'trending-food', 0.001, 0, false);
            throw new common_1.HttpException('Failed to fetch trending food data', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async getLocalFoodTrends(location) {
        try {
            const startTime = Date.now();
            const localTrends = await this.getMockLocalTrends(location);
            const responseTime = Date.now() - startTime;
            await this.trackApiUsage('google_trends', 'local-trends', 0.002, responseTime, true);
            this.logger.debug(`Retrieved ${localTrends.length} local trending items`);
            return localTrends;
        }
        catch (error) {
            this.logger.error('Failed to get local food trends:', error);
            await this.trackApiUsage('google_trends', 'local-trends', 0.002, 0, false);
            return [];
        }
    }
    async getKeywordInterest(keywords) {
        try {
            const startTime = Date.now();
            const interestMap = new Map();
            for (const keyword of keywords) {
                interestMap.set(keyword, this.calculateMockInterest(keyword));
            }
            const responseTime = Date.now() - startTime;
            await this.trackApiUsage('google_trends', 'keyword-interest', 0.001, responseTime, true);
            this.logger.debug(`Retrieved interest data for ${keywords.length} keywords`);
            return interestMap;
        }
        catch (error) {
            this.logger.error('Failed to get keyword interest:', error);
            await this.trackApiUsage('google_trends', 'keyword-interest', 0.001, 0, false);
            return new Map();
        }
    }
    async getMockTrendingData(request) {
        const currentHour = new Date().getHours();
        const dayOfWeek = new Date().getDay();
        const season = this.getCurrentSeason();
        const baseTrends = [
            { keyword: 'pizza', interest: 85, risingPercentage: 15 },
            { keyword: 'sushi', interest: 72, risingPercentage: 8 },
            { keyword: 'burger', interest: 78, risingPercentage: 12 },
            { keyword: 'tacos', interest: 68, risingPercentage: 22 },
            { keyword: 'ramen', interest: 65, risingPercentage: 18 },
            { keyword: 'salad', interest: 45, risingPercentage: 5 },
            { keyword: 'sandwich', interest: 55, risingPercentage: -2 },
            { keyword: 'pasta', interest: 62, risingPercentage: 7 },
        ];
        return baseTrends.map(trend => ({
            ...trend,
            interest: this.adjustInterestByTime(trend.interest, currentHour, dayOfWeek, season),
        })).sort((a, b) => b.interest - a.interest);
    }
    async getMockLocalTrends(location) {
        const localTrends = [
            { keyword: 'local_specialty', interest: 90, risingPercentage: 25 },
            { keyword: 'food_truck', interest: 65, risingPercentage: 15 },
            { keyword: 'brunch', interest: 58, risingPercentage: 10 },
            { keyword: 'happy_hour', interest: 45, risingPercentage: 8 },
        ];
        return localTrends;
    }
    calculateMockInterest(keyword) {
        let hash = 0;
        for (let i = 0; i < keyword.length; i++) {
            const char = keyword.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const timeVariation = (Date.now() % 1000) / 10;
        return Math.abs(hash % 70) + 20 + Math.round(timeVariation % 10);
    }
    adjustInterestByTime(baseInterest, hour, dayOfWeek, season) {
        let adjusted = baseInterest;
        if (hour >= 11 && hour <= 14) {
            adjusted += 10;
        }
        else if (hour >= 17 && hour <= 20) {
            adjusted += 15;
        }
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            adjusted += 8;
        }
        if (season === 'summer') {
            if (['salad', 'ice_cream', 'bbq'].some(food => baseInterest > 60)) {
                adjusted += 5;
            }
        }
        return Math.min(100, Math.max(0, adjusted));
    }
    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4)
            return 'spring';
        if (month >= 5 && month <= 7)
            return 'summer';
        if (month >= 8 && month <= 10)
            return 'fall';
        return 'winter';
    }
    async trackApiUsage(apiName, endpoint, costEstimate, responseTime, success, userId) {
        try {
            await this.databaseService.apiUsageTracking.create({
                data: {
                    userId,
                    apiName,
                    endpoint,
                    costEstimate,
                    responseTime,
                    success,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to track API usage:', error);
        }
    }
};
exports.TrendsService = TrendsService;
exports.TrendsService = TrendsService = TrendsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        database_service_1.DatabaseService])
], TrendsService);
//# sourceMappingURL=trends.service.js.map