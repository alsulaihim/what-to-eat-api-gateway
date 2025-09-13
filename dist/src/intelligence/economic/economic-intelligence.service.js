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
var EconomicIntelligenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EconomicIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const fed_service_1 = require("../../external-apis/government/fed.service");
let EconomicIntelligenceService = EconomicIntelligenceService_1 = class EconomicIntelligenceService {
    fedService;
    logger = new common_1.Logger(EconomicIntelligenceService_1.name);
    constructor(fedService) {
        this.fedService = fedService;
    }
    async analyzeEconomicImpact() {
        try {
            const economicData = await this.fedService.getEconomicIndicators();
            return this.processEconomicData(economicData);
        }
        catch (error) {
            this.logger.error('Failed to analyze economic impact:', error.message);
            throw new Error(`Economic intelligence unavailable: ${error.message}`);
        }
    }
    processEconomicData(data) {
        const diningBehaviorImpact = this.analyzeDiningBehaviorImpact(data);
        return {
            economic_indicators: {
                local_unemployment: data.unemployment_rate,
                gas_prices: data.gas_price_avg,
                food_inflation: data.food_price_index,
                consumer_confidence: data.consumer_confidence_index,
            },
            dining_behavior_impact: diningBehaviorImpact,
        };
    }
    analyzeDiningBehaviorImpact(data) {
        const budgetShift = this.determineBudgetShift(data);
        const deliverySensitivity = this.calculateDeliverySensitivity(data);
        const valueSeeking = this.assessValueSeekingBehavior(data);
        const categoryPreferences = this.determineCategoryPreferences(data);
        return {
            budget_shift: budgetShift,
            delivery_sensitivity: deliverySensitivity,
            value_seeking: valueSeeking,
            category_preferences: categoryPreferences,
        };
    }
    determineBudgetShift(data) {
        const economicStressScore = this.calculateEconomicStressScore(data);
        if (economicStressScore >= 0.8) {
            return 'strong shift toward budget dining options';
        }
        else if (economicStressScore >= 0.6) {
            return 'moderate preference for value dining';
        }
        else if (economicStressScore >= 0.4) {
            return 'slight preference for mid-range options';
        }
        else if (economicStressScore >= 0.2) {
            return 'stable spending on dining experiences';
        }
        else {
            return 'increased willingness for premium dining';
        }
    }
    calculateEconomicStressScore(data) {
        let stressScore = 0;
        if (data.unemployment_rate > 7.0) {
            stressScore += 0.3;
        }
        else if (data.unemployment_rate > 5.0) {
            stressScore += 0.2;
        }
        else if (data.unemployment_rate > 3.5) {
            stressScore += 0.1;
        }
        if (data.gas_price_avg > 5.0) {
            stressScore += 0.2;
        }
        else if (data.gas_price_avg > 4.0) {
            stressScore += 0.15;
        }
        else if (data.gas_price_avg > 3.5) {
            stressScore += 0.1;
        }
        if (data.food_price_index > 8.0) {
            stressScore += 0.25;
        }
        else if (data.food_price_index > 5.0) {
            stressScore += 0.2;
        }
        else if (data.food_price_index > 3.0) {
            stressScore += 0.15;
        }
        else if (data.food_price_index > 2.0) {
            stressScore += 0.1;
        }
        if (data.consumer_confidence_index < 80) {
            stressScore += 0.25;
        }
        else if (data.consumer_confidence_index < 90) {
            stressScore += 0.2;
        }
        else if (data.consumer_confidence_index < 100) {
            stressScore += 0.15;
        }
        else if (data.consumer_confidence_index < 110) {
            stressScore += 0.1;
        }
        return Math.min(1.0, stressScore);
    }
    calculateDeliverySensitivity(data) {
        let sensitivity = 0.5;
        if (data.gas_price_avg > 5.0) {
            sensitivity = 0.9;
        }
        else if (data.gas_price_avg > 4.5) {
            sensitivity = 0.8;
        }
        else if (data.gas_price_avg > 4.0) {
            sensitivity = 0.7;
        }
        else if (data.gas_price_avg > 3.5) {
            sensitivity = 0.6;
        }
        if (data.unemployment_rate > 6.0) {
            sensitivity -= 0.2;
        }
        else if (data.unemployment_rate < 4.0) {
            sensitivity += 0.1;
        }
        if (data.consumer_confidence_index > 110) {
            sensitivity += 0.1;
        }
        else if (data.consumer_confidence_index < 85) {
            sensitivity -= 0.1;
        }
        return Math.max(0.1, Math.min(1.0, sensitivity));
    }
    assessValueSeekingBehavior(data) {
        const stressScore = this.calculateEconomicStressScore(data);
        const inflationPressure = data.food_price_index > 4.0;
        const lowConfidence = data.consumer_confidence_index < 95;
        return stressScore > 0.5 || inflationPressure || lowConfidence;
    }
    determineCategoryPreferences(data) {
        const preferences = [];
        const stressScore = this.calculateEconomicStressScore(data);
        if (stressScore >= 0.7) {
            preferences.push('fast food chains');
            preferences.push('value menu items');
            preferences.push('food trucks');
            preferences.push('ethnic restaurants');
            preferences.push('lunch specials');
        }
        else if (stressScore >= 0.5) {
            preferences.push('fast-casual dining');
            preferences.push('chain restaurants');
            preferences.push('happy hour deals');
            preferences.push('buffet-style restaurants');
            preferences.push('family-friendly chains');
        }
        else if (stressScore >= 0.3) {
            preferences.push('casual dining');
            preferences.push('mid-range restaurants');
            preferences.push('local favorites');
            preferences.push('themed restaurants');
            preferences.push('brunch spots');
        }
        else {
            preferences.push('fine dining');
            preferences.push('upscale casual');
            preferences.push('chef-driven restaurants');
            preferences.push('wine bars');
            preferences.push('experiential dining');
        }
        if (data.gas_price_avg > 4.5) {
            preferences.unshift('nearby locations preferred');
            preferences.push('delivery-friendly options');
        }
        if (data.food_price_index > 6.0) {
            preferences.unshift('portion size value');
            preferences.push('shareable plates');
        }
        if (data.consumer_confidence_index > 115) {
            preferences.push('new restaurant openings');
            preferences.push('premium experiences');
        }
        else if (data.consumer_confidence_index < 85) {
            preferences.unshift('reliable chains');
            preferences.push('comfort food establishments');
        }
        return preferences.slice(0, 8);
    }
};
exports.EconomicIntelligenceService = EconomicIntelligenceService;
exports.EconomicIntelligenceService = EconomicIntelligenceService = EconomicIntelligenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [fed_service_1.FederalReserveService])
], EconomicIntelligenceService);
//# sourceMappingURL=economic-intelligence.service.js.map