"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TrendsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const database_service_1 = require("../../common/database/database.service");
const rxjs_1 = require("rxjs");
const cheerio = __importStar(require("cheerio"));
let TrendsService = TrendsService_1 = class TrendsService {
    configService;
    httpService;
    databaseService;
    logger = new common_1.Logger(TrendsService_1.name);
    GOOGLE_TRENDS_RSS_URL = 'https://trends.google.com/trending/rss';
    FOOD_KEYWORDS = [
        'pizza', 'sushi', 'burger', 'tacos', 'ramen', 'pasta', 'salad', 'sandwich',
        'chicken', 'steak', 'seafood', 'vegetarian', 'vegan', 'thai', 'chinese',
        'italian', 'mexican', 'indian', 'japanese', 'french', 'mediterranean',
        'breakfast', 'lunch', 'dinner', 'brunch', 'dessert', 'coffee', 'restaurant'
    ];
    trendingCache = new Map();
    CACHE_DURATION = 5 * 60 * 1000;
    constructor(configService, httpService, databaseService) {
        this.configService = configService;
        this.httpService = httpService;
        this.databaseService = databaseService;
    }
    async getTrendingFood(request) {
        try {
            const startTime = Date.now();
            const cacheKey = this.generateCacheKey(request);
            const cachedData = this.trendingCache.get(cacheKey);
            if (cachedData && (Date.now() - cachedData.timestamp) < this.CACHE_DURATION) {
                this.logger.debug(`Using cached trending food data for ${cacheKey}`);
                return cachedData.data;
            }
            const [rssData, searchData] = await Promise.allSettled([
                this.getRSSFoodTrends(request),
                this.getSearchFoodTrends(request)
            ]);
            let trendingFoods = [];
            if (rssData.status === 'fulfilled') {
                trendingFoods = [...trendingFoods, ...rssData.value];
            }
            if (searchData.status === 'fulfilled') {
                trendingFoods = this.mergeAndDeduplicate(trendingFoods, searchData.value);
            }
            if (trendingFoods.length === 0) {
                trendingFoods = await this.getAlgorithmicTrends(request);
            }
            this.trendingCache.set(cacheKey, {
                data: trendingFoods,
                timestamp: Date.now()
            });
            const responseTime = Date.now() - startTime;
            await this.trackApiUsage('google_trends', 'trending-food', 0.001, responseTime, true);
            this.logger.debug(`Retrieved ${trendingFoods.length} trending food items`);
            return trendingFoods.slice(0, 10);
        }
        catch (error) {
            this.logger.error('Failed to get trending food data:', error);
            await this.trackApiUsage('google_trends', 'trending-food', 0.001, 0, false);
            return this.getAlgorithmicTrends(request);
        }
    }
    async getLocalFoodTrends(location) {
        try {
            const startTime = Date.now();
            const cacheKey = `local_${location.latitude}_${location.longitude}_${location.radius}`;
            const cachedData = this.trendingCache.get(cacheKey);
            if (cachedData && (Date.now() - cachedData.timestamp) < this.CACHE_DURATION) {
                return cachedData.data;
            }
            const localTrends = await this.getLocationBasedTrends(location);
            this.trendingCache.set(cacheKey, {
                data: localTrends,
                timestamp: Date.now()
            });
            const responseTime = Date.now() - startTime;
            await this.trackApiUsage('google_trends', 'local-trends', 0.002, responseTime, true);
            this.logger.debug(`Retrieved ${localTrends.length} local trending items`);
            return localTrends;
        }
        catch (error) {
            this.logger.error('Failed to get local food trends:', error);
            await this.trackApiUsage('google_trends', 'local-trends', 0.002, 0, false);
            return this.getAlgorithmicLocalTrends(location);
        }
    }
    async getKeywordInterest(keywords) {
        try {
            const startTime = Date.now();
            const interestMap = new Map();
            for (const keyword of keywords) {
                const interest = await this.calculateRealWorldInterest(keyword);
                interestMap.set(keyword, interest);
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
    async getRSSFoodTrends(request) {
        try {
            let rssUrl = this.GOOGLE_TRENDS_RSS_URL;
            if (request.location) {
                const geoCode = await this.getGeoCodeFromCoordinates(request.location);
                if (geoCode) {
                    rssUrl += `?geo=${geoCode}`;
                }
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(rssUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; FoodTrendsBot/1.0)',
                    'Accept': 'application/rss+xml, application/xml, text/xml',
                }
            }));
            const rssItems = this.parseRSSFeed(response.data);
            const foodRelatedItems = this.filterFoodRelatedItems(rssItems);
            return this.convertRSSToTrendingFood(foodRelatedItems);
        }
        catch (error) {
            this.logger.warn('RSS feed unavailable, using alternative method:', error.message);
            return [];
        }
    }
    async getSearchFoodTrends(request) {
        try {
            const trendingKeywords = await this.getGoogleSuggestionsForFood();
            return this.processSuggestionsToTrends(trendingKeywords);
        }
        catch (error) {
            this.logger.warn('Search trends unavailable:', error.message);
            return [];
        }
    }
    async getGoogleSuggestionsForFood() {
        try {
            const foodQueries = ['food near me', 'restaurant', 'delivery', 'takeout'];
            const suggestions = [];
            for (const query of foodQueries) {
                try {
                    const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`https://suggestqueries.google.com/complete/search`, {
                        params: {
                            client: 'firefox',
                            q: query,
                        },
                        timeout: 5000,
                    }));
                    if (response.data && Array.isArray(response.data) && response.data[1]) {
                        const querySuggestions = response.data[1]
                            .filter((s) => this.isFoodRelated(s))
                            .slice(0, 5);
                        suggestions.push(...querySuggestions);
                    }
                }
                catch (error) {
                    this.logger.debug(`Failed to get suggestions for ${query}:`, error.message);
                }
            }
            return [...new Set(suggestions)];
        }
        catch (error) {
            this.logger.warn('Failed to get Google suggestions:', error);
            return [];
        }
    }
    async getLocationBasedTrends(location) {
        const trends = [];
        const localHour = this.getLocalHourFromCoordinates(location);
        const regionalCuisines = this.getRegionalCuisines(location);
        const season = this.getCurrentSeason();
        const seasonalFoods = this.getSeasonalFoods(season);
        const baseTrends = [...regionalCuisines, ...seasonalFoods];
        for (const trend of baseTrends) {
            const interest = this.calculateLocationBasedInterest(trend, location, localHour);
            trends.push({
                keyword: trend,
                interest,
                trend: interest > 70 ? 'rising' : interest > 40 ? 'stable' : 'falling'
            });
        }
        return trends.sort((a, b) => b.interest - a.interest).slice(0, 8);
    }
    async calculateRealWorldInterest(keyword) {
        let baseInterest = 50;
        const currentHour = new Date().getHours();
        const dayOfWeek = new Date().getDay();
        if (this.isMealTime(currentHour)) {
            baseInterest += 15;
        }
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            baseInterest += 10;
        }
        if (this.FOOD_KEYWORDS.includes(keyword.toLowerCase())) {
            baseInterest += 20;
        }
        const seasonalBoost = this.getSeasonalBoost(keyword);
        baseInterest += seasonalBoost;
        const variation = (Math.random() - 0.5) * 20;
        baseInterest += variation;
        return Math.max(10, Math.min(100, Math.round(baseInterest)));
    }
    getAlgorithmicTrends(request) {
        const currentTime = new Date();
        const hour = currentTime.getHours();
        const dayOfWeek = currentTime.getDay();
        const season = this.getCurrentSeason();
        const trends = [
            { keyword: 'pizza', interest: this.calculateTimeAwareInterest(85, hour, dayOfWeek, 'dinner'), trend: 'rising' },
            { keyword: 'sushi', interest: this.calculateTimeAwareInterest(75, hour, dayOfWeek, 'dinner'), trend: 'stable' },
            { keyword: 'burger', interest: this.calculateTimeAwareInterest(80, hour, dayOfWeek, 'lunch,dinner'), trend: 'rising' },
            { keyword: 'tacos', interest: this.calculateTimeAwareInterest(70, hour, dayOfWeek, 'lunch,dinner'), trend: 'rising' },
            { keyword: 'ramen', interest: this.calculateTimeAwareInterest(65, hour, dayOfWeek, 'dinner'), trend: 'stable' },
            { keyword: 'salad', interest: this.calculateTimeAwareInterest(55, hour, dayOfWeek, 'lunch'), trend: 'stable' },
            { keyword: 'coffee', interest: this.calculateTimeAwareInterest(90, hour, dayOfWeek, 'breakfast,afternoon'), trend: 'rising' },
            { keyword: 'sandwich', interest: this.calculateTimeAwareInterest(60, hour, dayOfWeek, 'lunch'), trend: 'falling' },
        ];
        return trends.sort((a, b) => b.interest - a.interest);
    }
    getAlgorithmicLocalTrends(location) {
        const regionalCuisines = this.getRegionalCuisines(location);
        return regionalCuisines.map(cuisine => ({
            keyword: cuisine,
            interest: Math.floor(Math.random() * 40) + 50,
            trend: 'stable'
        }));
    }
    generateCacheKey(request) {
        return `trends_${request.keywords.join(',')}_${request.location?.latitude || 'global'}_${request.timeRange || 'default'}`;
    }
    parseRSSFeed(xmlData) {
        try {
            const $ = cheerio.load(xmlData, { xmlMode: true });
            const items = [];
            $('item').each((_, element) => {
                const item = {
                    title: $(element).find('title').text(),
                    trafficVolume: $(element).find('ht\\:approx_traffic, approx_traffic').text(),
                    description: $(element).find('description').text(),
                    pubDate: new Date($(element).find('pubDate').text()),
                    category: $(element).find('category').text() || 'general'
                };
                items.push(item);
            });
            return items;
        }
        catch (error) {
            this.logger.warn('Failed to parse RSS feed:', error);
            return [];
        }
    }
    filterFoodRelatedItems(items) {
        return items.filter(item => this.isFoodRelated(item.title) ||
            this.isFoodRelated(item.description) ||
            item.category.toLowerCase().includes('food'));
    }
    isFoodRelated(text) {
        const foodTerms = [
            'food', 'restaurant', 'dining', 'eat', 'meal', 'cooking', 'recipe',
            'pizza', 'burger', 'sushi', 'coffee', 'chicken', 'delivery', 'takeout',
            'cuisine', 'dish', 'menu', 'chef', 'kitchen', 'dine', 'lunch', 'dinner',
            'breakfast', 'brunch', 'cafe', 'bistro', 'grill', 'bar', 'pub'
        ];
        const lowerText = text.toLowerCase();
        return foodTerms.some(term => lowerText.includes(term));
    }
    convertRSSToTrendingFood(items) {
        return items.map(item => ({
            keyword: this.extractKeywordFromTitle(item.title),
            interest: this.parseTrafficVolume(item.trafficVolume),
            trend: 'rising',
            relatedQueries: []
        }));
    }
    extractKeywordFromTitle(title) {
        const words = title.toLowerCase().split(' ');
        const foodWord = words.find(word => this.FOOD_KEYWORDS.includes(word));
        return foodWord || words[0] || 'food';
    }
    parseTrafficVolume(volume) {
        if (!volume)
            return 50;
        const numStr = volume.replace(/[+,K,M,\s]/g, '');
        const num = parseInt(numStr) || 50;
        if (volume.includes('M'))
            return Math.min(100, num * 10);
        if (volume.includes('K'))
            return Math.min(100, num);
        return Math.min(100, Math.max(10, num));
    }
    processSuggestionsToTrends(suggestions) {
        return suggestions.map(suggestion => ({
            keyword: suggestion,
            interest: Math.floor(Math.random() * 30) + 60,
            trend: 'rising'
        }));
    }
    mergeAndDeduplicate(trends1, trends2) {
        const merged = [...trends1];
        const existingKeywords = new Set(trends1.map(t => t.keyword.toLowerCase()));
        for (const trend of trends2) {
            if (!existingKeywords.has(trend.keyword.toLowerCase())) {
                merged.push(trend);
                existingKeywords.add(trend.keyword.toLowerCase());
            }
        }
        return merged.sort((a, b) => b.interest - a.interest);
    }
    async getGeoCodeFromCoordinates(location) {
        const { latitude, longitude } = location;
        if (latitude > 25 && latitude < 50 && longitude > -125 && longitude < -66) {
            if (latitude > 40 && longitude > -80)
                return 'US-NY';
            if (latitude < 35 && longitude < -95)
                return 'US-TX';
            if (latitude > 45 && longitude < -120)
                return 'US-WA';
            return 'US';
        }
        return null;
    }
    getLocalHourFromCoordinates(location) {
        const timezoneOffset = Math.round(location.longitude / 15);
        const utcHour = new Date().getUTCHours();
        return (utcHour + timezoneOffset + 24) % 24;
    }
    getRegionalCuisines(location) {
        const { latitude, longitude } = location;
        if (latitude > -10 && latitude < 60 && longitude > 100 && longitude < 180) {
            return ['sushi', 'ramen', 'thai', 'chinese', 'korean', 'vietnamese'];
        }
        if (latitude > 35 && latitude < 70 && longitude > -10 && longitude < 40) {
            return ['italian', 'french', 'mediterranean', 'german', 'spanish'];
        }
        if (latitude > 15 && latitude < 70 && longitude > -170 && longitude < -50) {
            return ['burger', 'pizza', 'mexican', 'bbq', 'sandwich', 'american'];
        }
        return ['pizza', 'burger', 'sushi', 'pasta', 'salad', 'chicken'];
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
    getSeasonalFoods(season) {
        const seasonalMap = {
            spring: ['salad', 'fresh vegetables', 'light meals'],
            summer: ['ice cream', 'bbq', 'cold drinks', 'seafood', 'grilling'],
            fall: ['pumpkin', 'soup', 'comfort food', 'warm drinks'],
            winter: ['hot chocolate', 'soup', 'stew', 'comfort food', 'warm meals']
        };
        return seasonalMap[season] || seasonalMap.summer;
    }
    calculateLocationBasedInterest(keyword, location, hour) {
        let interest = 50;
        const regionalCuisines = this.getRegionalCuisines(location);
        if (regionalCuisines.includes(keyword)) {
            interest += 25;
        }
        if (this.isMealTime(hour)) {
            interest += 15;
        }
        if (this.isUrbanArea(location)) {
            interest += 10;
        }
        return Math.max(10, Math.min(100, interest));
    }
    calculateTimeAwareInterest(base, hour, dayOfWeek, mealTimes) {
        let adjusted = base;
        if (mealTimes.includes('breakfast') && hour >= 6 && hour <= 10) {
            adjusted += 20;
        }
        if (mealTimes.includes('lunch') && hour >= 11 && hour <= 15) {
            adjusted += 15;
        }
        if (mealTimes.includes('dinner') && hour >= 17 && hour <= 21) {
            adjusted += 25;
        }
        if (mealTimes.includes('afternoon') && hour >= 14 && hour <= 17) {
            adjusted += 10;
        }
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            adjusted += 8;
        }
        return Math.max(10, Math.min(100, adjusted));
    }
    isMealTime(hour) {
        return (hour >= 6 && hour <= 10) ||
            (hour >= 11 && hour <= 15) ||
            (hour >= 17 && hour <= 21);
    }
    getSeasonalBoost(keyword) {
        const season = this.getCurrentSeason();
        const boosts = {
            'ice cream': season === 'summer' ? 15 : -5,
            'soup': season === 'winter' ? 15 : -5,
            'salad': season === 'summer' ? 10 : 0,
            'bbq': season === 'summer' ? 12 : 0,
            'hot chocolate': season === 'winter' ? 20 : -10,
        };
        return boosts[keyword.toLowerCase()] || 0;
    }
    isUrbanArea(location) {
        const urbanCenters = [
            { lat: 40.7128, lng: -74.0060, name: 'NYC' },
            { lat: 34.0522, lng: -118.2437, name: 'LA' },
            { lat: 41.8781, lng: -87.6298, name: 'Chicago' },
            { lat: 37.7749, lng: -122.4194, name: 'SF' },
        ];
        return urbanCenters.some(center => Math.abs(center.lat - location.latitude) < 1 &&
            Math.abs(center.lng - location.longitude) < 1);
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
        axios_1.HttpService,
        database_service_1.DatabaseService])
], TrendsService);
//# sourceMappingURL=trends.service.js.map