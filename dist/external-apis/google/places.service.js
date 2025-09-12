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
var PlacesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const database_service_1 = require("../../common/database/database.service");
let PlacesService = PlacesService_1 = class PlacesService {
    configService;
    databaseService;
    logger = new common_1.Logger(PlacesService_1.name);
    httpClient;
    apiKey;
    baseUrl = 'https://maps.googleapis.com/maps/api/place';
    constructor(configService, databaseService) {
        this.configService = configService;
        this.databaseService = databaseService;
        this.apiKey = this.configService.get('GOOGLE_PLACES_API_KEY') || '';
        if (!this.apiKey) {
            this.logger.error('Google Places API key not configured');
        }
        this.httpClient = axios_1.default.create({
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.httpClient.interceptors.request.use((config) => {
            this.logger.debug(`Google Places API request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        });
        this.httpClient.interceptors.response.use((response) => {
            this.trackApiUsage('google_places', response.config.url || '', 0.002, response.config.metadata?.responseTime || 0, true);
            return response;
        }, (error) => {
            const responseTime = error.config?.metadata?.responseTime || 0;
            this.trackApiUsage('google_places', error.config?.url || '', 0.002, responseTime, false);
            this.logger.error('Google Places API error:', error.message);
            return Promise.reject(error);
        });
    }
    async searchNearbyRestaurants(request) {
        try {
            const startTime = Date.now();
            const params = {
                key: this.apiKey,
                location: `${request.location.latitude},${request.location.longitude}`,
                radius: request.radius,
                type: request.type || 'restaurant',
                ...(request.query && { keyword: request.query }),
                ...(request.priceLevel !== undefined && { minprice: request.priceLevel, maxprice: request.priceLevel }),
                ...(request.openNow && { opennow: true }),
            };
            const response = await this.httpClient.get(`${this.baseUrl}/nearbysearch/json`, {
                params,
                metadata: { responseTime: Date.now() - startTime },
            });
            if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
                throw new common_1.HttpException(`Google Places API error: ${response.data.status}`, common_1.HttpStatus.BAD_GATEWAY);
            }
            this.logger.debug(`Found ${response.data.results.length} nearby restaurants`);
            return response.data.results;
        }
        catch (error) {
            this.logger.error('Failed to search nearby restaurants:', error);
            throw new common_1.HttpException('Failed to fetch restaurant data', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async getPlaceDetails(placeId) {
        try {
            const startTime = Date.now();
            const params = {
                key: this.apiKey,
                place_id: placeId,
                fields: [
                    'place_id',
                    'name',
                    'formatted_address',
                    'formatted_phone_number',
                    'website',
                    'rating',
                    'user_ratings_total',
                    'price_level',
                    'opening_hours',
                    'photos',
                    'reviews',
                    'geometry',
                    'types',
                ].join(','),
            };
            const response = await this.httpClient.get(`${this.baseUrl}/details/json`, {
                params,
                metadata: { responseTime: Date.now() - startTime },
            });
            if (response.data.status !== 'OK') {
                throw new common_1.HttpException(`Google Places API error: ${response.data.status}`, common_1.HttpStatus.BAD_GATEWAY);
            }
            return response.data.result;
        }
        catch (error) {
            this.logger.error(`Failed to get place details for ${placeId}:`, error);
            throw new common_1.HttpException('Failed to fetch restaurant details', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async getPhotoUrl(photoReference, maxWidth = 400) {
        return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
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
    async getApiUsageStats() {
        try {
            const stats = await this.databaseService.apiUsageTracking.groupBy({
                by: ['apiName'],
                where: {
                    apiName: 'google_places',
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
                _sum: {
                    costEstimate: true,
                },
                _count: {
                    id: true,
                },
                _avg: {
                    responseTime: true,
                },
            });
            return stats;
        }
        catch (error) {
            this.logger.error('Failed to get API usage stats:', error);
            return [];
        }
    }
};
exports.PlacesService = PlacesService;
exports.PlacesService = PlacesService = PlacesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        database_service_1.DatabaseService])
], PlacesService);
//# sourceMappingURL=places.service.js.map