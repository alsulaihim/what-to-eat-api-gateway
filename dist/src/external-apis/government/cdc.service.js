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
var CdcService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdcService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let CdcService = CdcService_1 = class CdcService {
    httpService;
    logger = new common_1.Logger(CdcService_1.name);
    constructor(httpService) {
        this.httpService = httpService;
    }
    async getHealthData(location) {
        try {
            const [fluActivity, airQuality, seasonalTrends] = await Promise.all([
                this.getFluActivity(),
                this.getAirQualityEstimate(location),
                this.getSeasonalHealthTrends(),
            ]);
            return {
                flu_activity_level: fluActivity,
                air_quality_index: airQuality,
                pollen_forecast: this.getPollenForecast(),
                seasonal_health_trends: seasonalTrends,
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch health data for ${location}:`, error.message);
            throw new Error(`Health data unavailable: ${error.message}`);
        }
    }
    async getFluActivity() {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get('https://www.cdc.gov/flu/weekly/weeklyarchives2023-2024/data/senAllregt09.json', {
                headers: {
                    'User-Agent': 'WhatToEat-Intelligence/1.0',
                },
            }));
            if (response.data && Array.isArray(response.data)) {
                const latestWeek = response.data[response.data.length - 1];
                if (latestWeek && latestWeek.ACTIVITY_LEVEL) {
                    return this.interpretFluActivity(latestWeek.ACTIVITY_LEVEL);
                }
            }
            return this.getSeasonalFluActivity();
        }
        catch (error) {
            this.logger.warn('Failed to fetch CDC flu data, using seasonal estimation:', error.message);
            return this.getSeasonalFluActivity();
        }
    }
    interpretFluActivity(level) {
        const levelMap = {
            '1': 'minimal',
            '2': 'low',
            '3': 'low',
            '4': 'moderate',
            '5': 'moderate',
            '6': 'high',
            '7': 'high',
            '8': 'high',
            '9': 'very high',
            '10': 'very high',
        };
        return levelMap[level] || 'moderate';
    }
    getSeasonalFluActivity() {
        const now = new Date();
        const month = now.getMonth();
        if (month >= 11 || month <= 2) {
            return 'high';
        }
        else if (month >= 9 || month <= 4) {
            return 'moderate';
        }
        else {
            return 'low';
        }
    }
    async getAirQualityEstimate(location) {
        try {
            const now = new Date();
            const month = now.getMonth();
            const normalizedLocation = location.toLowerCase().replace(/[^a-z\s]/g, '').trim();
            const majorCities = ['new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'dallas'];
            let baseAQI = majorCities.includes(normalizedLocation) ? 65 : 45;
            if (month >= 5 && month <= 8) {
                baseAQI += 15;
            }
            else if (month >= 11 || month <= 1) {
                baseAQI += 10;
            }
            else if (month >= 2 && month <= 4) {
                baseAQI += 5;
            }
            if (normalizedLocation.includes('los angeles') || normalizedLocation.includes('phoenix')) {
                baseAQI += 20;
            }
            else if (normalizedLocation.includes('seattle') || normalizedLocation.includes('portland')) {
                baseAQI -= 10;
            }
            return Math.max(25, Math.min(150, baseAQI));
        }
        catch (error) {
            this.logger.warn('Failed to estimate air quality:', error.message);
            return 50;
        }
    }
    async getLatitude(location) {
        const cityCoordinates = {
            'new york': 40.7128,
            'los angeles': 34.0522,
            'chicago': 41.8781,
            'houston': 29.7604,
            'phoenix': 33.4484,
            'philadelphia': 39.9526,
            'san antonio': 29.4241,
            'san diego': 32.7157,
            'dallas': 32.7767,
            'san jose': 37.3382,
            'austin': 30.2672,
            'jacksonville': 30.3322,
            'san francisco': 37.7749,
            'columbus': 39.9612,
            'fort worth': 32.7555,
            'indianapolis': 39.7684,
            'charlotte': 35.2271,
            'seattle': 47.6062,
            'denver': 39.7392,
            'washington': 38.9072,
        };
        const normalizedLocation = location.toLowerCase().replace(/[^a-z\s]/g, '').trim();
        return cityCoordinates[normalizedLocation] || 39.8283;
    }
    async getLongitude(location) {
        const cityCoordinates = {
            'new york': -74.0060,
            'los angeles': -118.2437,
            'chicago': -87.6298,
            'houston': -95.3698,
            'phoenix': -112.0740,
            'philadelphia': -75.1652,
            'san antonio': -98.4936,
            'san diego': -117.1611,
            'dallas': -96.7970,
            'san jose': -121.8863,
            'austin': -97.7431,
            'jacksonville': -81.6557,
            'san francisco': -122.4194,
            'columbus': -82.9988,
            'fort worth': -97.3308,
            'indianapolis': -86.1581,
            'charlotte': -80.8431,
            'seattle': -122.3321,
            'denver': -104.9903,
            'washington': -77.0369,
        };
        const normalizedLocation = location.toLowerCase().replace(/[^a-z\s]/g, '').trim();
        return cityCoordinates[normalizedLocation] || -98.5795;
    }
    getPollenForecast() {
        const now = new Date();
        const month = now.getMonth();
        if (month >= 2 && month <= 5) {
            return 'high';
        }
        else if (month >= 6 && month <= 8) {
            return 'moderate';
        }
        else if (month >= 8 && month <= 10) {
            return 'high';
        }
        else {
            return 'low';
        }
    }
    async getSeasonalHealthTrends() {
        const now = new Date();
        const month = now.getMonth();
        const trends = [];
        if (month >= 11 || month <= 2) {
            trends.push('flu_season_active');
            trends.push('vitamin_d_deficiency_risk');
            trends.push('respiratory_illness_peak');
            trends.push('comfort_food_cravings');
        }
        else if (month >= 3 && month <= 5) {
            trends.push('allergy_season_active');
            trends.push('seasonal_allergies_peak');
            trends.push('detox_interest_rising');
            trends.push('fresh_produce_availability');
        }
        else if (month >= 6 && month <= 8) {
            trends.push('food_safety_concerns');
            trends.push('hydration_focus');
            trends.push('fresh_fruit_season');
            trends.push('outdoor_dining_preference');
        }
        else {
            trends.push('immune_system_preparation');
            trends.push('harvest_foods_available');
            trends.push('comfort_food_transition');
            trends.push('seasonal_depression_onset');
        }
        return trends;
    }
};
exports.CdcService = CdcService;
exports.CdcService = CdcService = CdcService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], CdcService);
//# sourceMappingURL=cdc.service.js.map