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
var HealthIntelligenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const cdc_service_1 = require("../../external-apis/government/cdc.service");
let HealthIntelligenceService = HealthIntelligenceService_1 = class HealthIntelligenceService {
    cdcService;
    logger = new common_1.Logger(HealthIntelligenceService_1.name);
    constructor(cdcService) {
        this.cdcService = cdcService;
    }
    async analyzeHealthFoodCorrelation(location) {
        try {
            const healthData = await this.cdcService.getHealthData(location);
            return this.processHealthDataForFood(healthData);
        }
        catch (error) {
            this.logger.error(`Failed to analyze health data for ${location}:`, error.message);
            throw new Error(`Health intelligence unavailable: ${error.message}`);
        }
    }
    processHealthDataForFood(data) {
        const nutritionalRecommendations = this.generateNutritionalRecommendations(data);
        return {
            health_trends: {
                flu_activity: data.flu_activity_level,
                air_quality_index: data.air_quality_index,
                allergy_forecast: data.pollen_forecast,
                fitness_season: this.determineFitnessSeason(),
            },
            nutritional_recommendations: nutritionalRecommendations,
        };
    }
    generateNutritionalRecommendations(data) {
        return {
            immune_boost_foods: this.getImmuneBoosters(data),
            respiratory_considerations: this.getRespiratoryConsiderations(data),
            anti_inflammatory: this.getAntiInflammatoryFoods(data),
            performance_nutrition: this.getPerformanceNutrition(),
        };
    }
    getImmuneBoosters(data) {
        const baseFoods = ['citrus fruits', 'leafy greens', 'yogurt', 'garlic', 'ginger'];
        const recommendations = [...baseFoods];
        if (data.flu_activity_level === 'high' || data.flu_activity_level === 'very high') {
            recommendations.push('bone broth', 'turmeric dishes', 'zinc-rich seafood', 'elderberry');
        }
        data.seasonal_health_trends.forEach(trend => {
            if (trend.includes('flu_season')) {
                recommendations.push('hot soups', 'herbal teas', 'spicy foods');
            }
            if (trend.includes('vitamin_d_deficiency')) {
                recommendations.push('fatty fish', 'fortified foods', 'mushrooms');
            }
        });
        return [...new Set(recommendations)].slice(0, 8);
    }
    getRespiratoryConsiderations(data) {
        const considerations = [];
        if (data.air_quality_index > 150) {
            considerations.push('avoid spicy foods that may irritate');
            considerations.push('choose anti-inflammatory options');
            considerations.push('stay hydrated with soups and broths');
            considerations.push('prefer indoor dining to limit exposure');
        }
        else if (data.air_quality_index > 100) {
            considerations.push('moderate spice levels recommended');
            considerations.push('focus on antioxidant-rich foods');
        }
        if (data.pollen_forecast === 'high') {
            considerations.push('avoid outdoor dining during peak hours');
            considerations.push('choose foods rich in quercetin');
            considerations.push('limit dairy if sensitive to mucus production');
            considerations.push('prefer HEPA-filtered indoor spaces');
        }
        if (data.flu_activity_level === 'high' || data.flu_activity_level === 'very high') {
            considerations.push('prioritize hygiene-conscious establishments');
            considerations.push('consider contactless dining options');
            considerations.push('choose well-ventilated spaces');
        }
        return considerations.slice(0, 6);
    }
    getAntiInflammatoryFoods(data) {
        const baseFoods = ['fatty fish', 'berries', 'leafy greens', 'nuts', 'olive oil'];
        const recommendations = [...baseFoods];
        if (data.air_quality_index > 100) {
            recommendations.push('turmeric-based dishes', 'green tea', 'dark chocolate');
        }
        if (data.pollen_forecast === 'high') {
            recommendations.push('quercetin-rich foods', 'omega-3 rich options', 'fresh herbs');
        }
        const month = new Date().getMonth();
        if (month >= 2 && month <= 5) {
            recommendations.push('nettle tea locations', 'local honey');
        }
        return [...new Set(recommendations)].slice(0, 8);
    }
    getPerformanceNutrition() {
        const season = this.determineFitnessSeason();
        const recommendations = [];
        switch (season) {
            case 'marathon_training':
                recommendations.push('complex carbohydrates', 'lean proteins', 'electrolyte-rich foods');
                break;
            case 'beach_season':
                recommendations.push('lean proteins', 'fresh fruits', 'hydrating foods', 'light meals');
                break;
            case 'bulk_season':
                recommendations.push('protein-rich meals', 'healthy fats', 'calorie-dense options');
                break;
            case 'outdoor_activity':
                recommendations.push('energy-sustaining foods', 'portable nutrition', 'hydration focus');
                break;
            default:
                recommendations.push('balanced macronutrients', 'whole foods', 'adequate protein');
        }
        recommendations.push('quinoa dishes', 'sweet potato options', 'Greek yogurt');
        return [...new Set(recommendations)].slice(0, 6);
    }
    determineFitnessSeason() {
        const month = new Date().getMonth();
        const day = new Date().getDate();
        if (month === 0 || (month === 1 && day < 15)) {
            return 'new_year_fitness';
        }
        if (month >= 2 && month <= 4) {
            return 'marathon_training';
        }
        if (month >= 4 && month <= 7) {
            return 'beach_season';
        }
        if (month >= 7 && month <= 9) {
            return 'outdoor_activity';
        }
        if (month >= 9 || month === 11) {
            return 'bulk_season';
        }
        return 'maintenance';
    }
};
exports.HealthIntelligenceService = HealthIntelligenceService;
exports.HealthIntelligenceService = HealthIntelligenceService = HealthIntelligenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cdc_service_1.CdcService])
], HealthIntelligenceService);
//# sourceMappingURL=health-intelligence.service.js.map