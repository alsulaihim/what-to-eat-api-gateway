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
var MapsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const database_service_1 = require("../../common/database/database.service");
let MapsService = MapsService_1 = class MapsService {
    configService;
    databaseService;
    logger = new common_1.Logger(MapsService_1.name);
    httpClient;
    apiKey;
    baseUrl = 'https://maps.googleapis.com/maps/api';
    constructor(configService, databaseService) {
        this.configService = configService;
        this.databaseService = databaseService;
        this.apiKey = this.configService.get('GOOGLE_MAPS_API_KEY') || '';
        if (!this.apiKey) {
            this.logger.error('Google Maps API key not configured');
        }
        this.httpClient = axios_1.default.create({
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.httpClient.interceptors.response.use((response) => {
            this.trackApiUsage('google_maps', response.config.url || '', 0.002, response.config.metadata?.responseTime || 0, true);
            return response;
        }, (error) => {
            const responseTime = error.config?.metadata?.responseTime || 0;
            this.trackApiUsage('google_maps', error.config?.url || '', 0.002, responseTime, false);
            this.logger.error('Google Maps API error:', error.message);
            return Promise.reject(error);
        });
    }
    async geocode(request) {
        try {
            const startTime = Date.now();
            const params = {
                key: this.apiKey,
                address: request.address,
            };
            const response = await this.httpClient.get(`${this.baseUrl}/geocode/json`, {
                params,
                metadata: { responseTime: Date.now() - startTime },
            });
            if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
                throw new common_1.HttpException(`Google Maps Geocoding API error: ${response.data.status}`, common_1.HttpStatus.BAD_GATEWAY);
            }
            this.logger.debug(`Geocoded address: ${request.address}`);
            return response.data.results;
        }
        catch (error) {
            this.logger.error('Failed to geocode address:', error);
            throw new common_1.HttpException('Failed to geocode address', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async reverseGeocode(request) {
        try {
            const startTime = Date.now();
            const params = {
                key: this.apiKey,
                latlng: `${request.latitude},${request.longitude}`,
            };
            const response = await this.httpClient.get(`${this.baseUrl}/geocode/json`, {
                params,
                metadata: { responseTime: Date.now() - startTime },
            });
            if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
                throw new common_1.HttpException(`Google Maps Reverse Geocoding API error: ${response.data.status}`, common_1.HttpStatus.BAD_GATEWAY);
            }
            this.logger.debug(`Reverse geocoded: ${request.latitude}, ${request.longitude}`);
            return response.data.results;
        }
        catch (error) {
            this.logger.error('Failed to reverse geocode coordinates:', error);
            throw new common_1.HttpException('Failed to reverse geocode coordinates', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async getDirections(request) {
        try {
            const startTime = Date.now();
            const params = {
                key: this.apiKey,
                origin: `${request.origin.latitude},${request.origin.longitude}`,
                destination: `${request.destination.latitude},${request.destination.longitude}`,
                mode: request.travelMode || 'driving',
            };
            const response = await this.httpClient.get(`${this.baseUrl}/directions/json`, {
                params,
                metadata: { responseTime: Date.now() - startTime },
            });
            if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
                throw new common_1.HttpException(`Google Maps Directions API error: ${response.data.status}`, common_1.HttpStatus.BAD_GATEWAY);
            }
            const routes = response.data.routes.map((route) => ({
                distance: route.legs[0].distance,
                duration: route.legs[0].duration,
                steps: route.legs[0].steps,
            }));
            this.logger.debug(`Retrieved directions for ${request.travelMode || 'driving'} mode`);
            return routes;
        }
        catch (error) {
            this.logger.error('Failed to get directions:', error);
            throw new common_1.HttpException('Failed to get directions', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async calculateDistanceMatrix(origins, destinations, travelMode = 'driving') {
        try {
            const startTime = Date.now();
            const formatLocations = (locations) => locations.map(loc => `${loc.latitude},${loc.longitude}`).join('|');
            const params = {
                key: this.apiKey,
                origins: formatLocations(origins),
                destinations: formatLocations(destinations),
                mode: travelMode,
                units: 'metric',
            };
            const response = await this.httpClient.get(`${this.baseUrl}/distancematrix/json`, {
                params,
                metadata: { responseTime: Date.now() - startTime },
            });
            if (response.data.status !== 'OK') {
                throw new common_1.HttpException(`Google Maps Distance Matrix API error: ${response.data.status}`, common_1.HttpStatus.BAD_GATEWAY);
            }
            this.logger.debug(`Calculated distance matrix for ${origins.length}x${destinations.length} locations`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to calculate distance matrix:', error);
            throw new common_1.HttpException('Failed to calculate distance matrix', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async getTimezone(location) {
        try {
            const startTime = Date.now();
            const params = {
                key: this.apiKey,
                location: `${location.latitude},${location.longitude}`,
                timestamp: Math.floor(Date.now() / 1000),
            };
            const response = await this.httpClient.get(`${this.baseUrl}/timezone/json`, {
                params,
                metadata: { responseTime: Date.now() - startTime },
            });
            if (response.data.status !== 'OK') {
                throw new common_1.HttpException(`Google Maps Timezone API error: ${response.data.status}`, common_1.HttpStatus.BAD_GATEWAY);
            }
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get timezone:', error);
            throw new common_1.HttpException('Failed to get timezone information', common_1.HttpStatus.BAD_GATEWAY);
        }
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
exports.MapsService = MapsService;
exports.MapsService = MapsService = MapsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        database_service_1.DatabaseService])
], MapsService);
//# sourceMappingURL=maps.service.js.map