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
var FederalReserveService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FederalReserveService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let FederalReserveService = FederalReserveService_1 = class FederalReserveService {
    httpService;
    logger = new common_1.Logger(FederalReserveService_1.name);
    baseUrl = 'https://api.stlouisfed.org/fred';
    constructor(httpService) {
        this.httpService = httpService;
    }
    async getEconomicIndicators() {
        try {
            const [unemployment, gasPrice, foodInflation, consumerConfidence] = await Promise.all([
                this.getUnemploymentRate(),
                this.getGasPrices(),
                this.getFoodInflationRate(),
                this.getConsumerConfidenceIndex(),
            ]);
            return {
                unemployment_rate: unemployment,
                gas_price_avg: gasPrice,
                food_price_index: foodInflation,
                consumer_confidence_index: consumerConfidence,
                inflation_rate: await this.getInflationRate(),
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch economic indicators:', error.message);
            throw new Error(`Economic data unavailable: ${error.message}`);
        }
    }
    async getUnemploymentRate() {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/series/observations`, {
                params: {
                    series_id: 'UNRATE',
                    limit: 1,
                    sort_order: 'desc',
                    file_type: 'json',
                },
                headers: {
                    'User-Agent': 'WhatToEat-Intelligence/1.0',
                },
            }));
            const observations = response.data.observations;
            if (observations && observations.length > 0) {
                return parseFloat(observations[0].value);
            }
            return 4.0;
        }
        catch (error) {
            this.logger.warn('Failed to fetch unemployment rate:', error.message);
            return 4.0;
        }
    }
    async getGasPrices() {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get('https://api.eia.gov/v2/petroleum/pri/gnd/data/', {
                params: {
                    'frequency': 'weekly',
                    'data[0]': 'value',
                    'facets[duoarea][]': 'NUS',
                    'facets[product][]': 'EPM0',
                    'sort[0][column]': 'period',
                    'sort[0][direction]': 'desc',
                    'offset': 0,
                    'length': 1,
                },
                headers: {
                    'User-Agent': 'WhatToEat-Intelligence/1.0',
                },
            }));
            if (response.data?.response?.data?.length > 0) {
                return response.data.response.data[0].value;
            }
            return 3.50;
        }
        catch (error) {
            this.logger.warn('Failed to fetch gas prices:', error.message);
            return 3.50;
        }
    }
    async getFoodInflationRate() {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/series/observations`, {
                params: {
                    series_id: 'CPIUFDSL',
                    limit: 12,
                    sort_order: 'desc',
                    file_type: 'json',
                },
                headers: {
                    'User-Agent': 'WhatToEat-Intelligence/1.0',
                },
            }));
            const observations = response.data.observations;
            if (observations && observations.length >= 12) {
                const current = parseFloat(observations[0].value);
                const yearAgo = parseFloat(observations[11].value);
                return ((current - yearAgo) / yearAgo) * 100;
            }
            return 3.2;
        }
        catch (error) {
            this.logger.warn('Failed to fetch food inflation rate:', error.message);
            return 3.2;
        }
    }
    async getConsumerConfidenceIndex() {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/series/observations`, {
                params: {
                    series_id: 'UMCSENT',
                    limit: 1,
                    sort_order: 'desc',
                    file_type: 'json',
                },
                headers: {
                    'User-Agent': 'WhatToEat-Intelligence/1.0',
                },
            }));
            const observations = response.data.observations;
            if (observations && observations.length > 0) {
                return parseFloat(observations[0].value);
            }
            return 100.0;
        }
        catch (error) {
            this.logger.warn('Failed to fetch consumer confidence:', error.message);
            return 100.0;
        }
    }
    async getInflationRate() {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/series/observations`, {
                params: {
                    series_id: 'CPIAUCSL',
                    limit: 12,
                    sort_order: 'desc',
                    file_type: 'json',
                },
                headers: {
                    'User-Agent': 'WhatToEat-Intelligence/1.0',
                },
            }));
            const observations = response.data.observations;
            if (observations && observations.length >= 12) {
                const current = parseFloat(observations[0].value);
                const yearAgo = parseFloat(observations[11].value);
                return ((current - yearAgo) / yearAgo) * 100;
            }
            return 3.0;
        }
        catch (error) {
            this.logger.warn('Failed to fetch inflation rate:', error.message);
            return 3.0;
        }
    }
};
exports.FederalReserveService = FederalReserveService;
exports.FederalReserveService = FederalReserveService = FederalReserveService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], FederalReserveService);
//# sourceMappingURL=fed.service.js.map