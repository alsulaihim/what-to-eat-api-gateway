"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DemographicsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemographicsService = void 0;
const common_1 = require("@nestjs/common");
let DemographicsService = DemographicsService_1 = class DemographicsService {
    logger = new common_1.Logger(DemographicsService_1.name);
    async analyzeDemographicPatterns(location) {
        try {
            const areaProfile = await this.getAreaProfile(location);
            const foodCultureCorrelation = this.analyzeFoodCultureCorrelation(areaProfile);
            return {
                area_profile: areaProfile,
                food_culture_correlation: foodCultureCorrelation,
            };
        }
        catch (error) {
            this.logger.error(`Failed to analyze demographics for ${location}:`, error.message);
            throw new Error(`Demographics intelligence unavailable: ${error.message}`);
        }
    }
    async getAreaProfile(location) {
        const cityDemographics = this.getCityDemographics(location);
        return {
            median_age: cityDemographics.median_age,
            education_level: cityDemographics.education_level,
            income_bracket: cityDemographics.income_bracket,
            cultural_diversity: cityDemographics.cultural_diversity,
        };
    }
    getCityDemographics(location) {
        const normalizedLocation = location.toLowerCase().replace(/[^a-z\s]/g, '').trim();
        const cityData = {
            'new york': {
                median_age: 36.2,
                education_level: 'high',
                income_bracket: 'upper-middle',
                cultural_diversity: {
                    'white': 42.7,
                    'hispanic': 29.1,
                    'black': 24.3,
                    'asian': 14.1,
                    'other': 9.8,
                },
            },
            'los angeles': {
                median_age: 35.8,
                education_level: 'medium-high',
                income_bracket: 'middle',
                cultural_diversity: {
                    'hispanic': 48.5,
                    'white': 28.5,
                    'asian': 11.3,
                    'black': 8.2,
                    'other': 3.5,
                },
            },
            'chicago': {
                median_age: 34.8,
                education_level: 'medium-high',
                income_bracket: 'middle',
                cultural_diversity: {
                    'white': 45.0,
                    'black': 30.1,
                    'hispanic': 29.0,
                    'asian': 6.4,
                    'other': 4.5,
                },
            },
            'san francisco': {
                median_age: 38.5,
                education_level: 'very high',
                income_bracket: 'high',
                cultural_diversity: {
                    'white': 41.9,
                    'asian': 35.7,
                    'hispanic': 15.1,
                    'black': 5.1,
                    'other': 2.2,
                },
            },
            'houston': {
                median_age: 33.1,
                education_level: 'medium',
                income_bracket: 'middle',
                cultural_diversity: {
                    'hispanic': 44.8,
                    'white': 25.3,
                    'black': 22.9,
                    'asian': 6.8,
                    'other': 0.2,
                },
            },
            'miami': {
                median_age: 40.2,
                education_level: 'medium',
                income_bracket: 'middle',
                cultural_diversity: {
                    'hispanic': 70.0,
                    'white': 14.9,
                    'black': 12.3,
                    'asian': 1.4,
                    'other': 1.4,
                },
            },
            'atlanta': {
                median_age: 32.9,
                education_level: 'medium-high',
                income_bracket: 'middle',
                cultural_diversity: {
                    'black': 51.8,
                    'white': 38.4,
                    'hispanic': 5.2,
                    'asian': 3.8,
                    'other': 0.8,
                },
            },
            'seattle': {
                median_age: 35.1,
                education_level: 'very high',
                income_bracket: 'upper-middle',
                cultural_diversity: {
                    'white': 65.7,
                    'asian': 16.3,
                    'black': 7.1,
                    'hispanic': 6.6,
                    'other': 4.3,
                },
            },
        };
        return cityData[normalizedLocation] || this.getDefaultDemographics();
    }
    getDefaultDemographics() {
        return {
            median_age: 36.0,
            education_level: 'medium',
            income_bracket: 'middle',
            cultural_diversity: {
                'white': 60.0,
                'hispanic': 18.0,
                'black': 12.0,
                'asian': 6.0,
                'other': 4.0,
            },
        };
    }
    analyzeFoodCultureCorrelation(areaProfile) {
        const authenticityExpectations = this.determineAuthenticityExpectations(areaProfile);
        const fusionAcceptance = this.calculateFusionAcceptance(areaProfile);
        const experimentalDining = this.assessExperimentalDining(areaProfile);
        const culturalFoodEvents = this.identifyCulturalFoodEvents(areaProfile);
        return {
            authenticity_expectations: authenticityExpectations,
            fusion_acceptance: fusionAcceptance,
            experimental_dining: experimentalDining,
            cultural_food_events: culturalFoodEvents,
        };
    }
    determineAuthenticityExpectations(areaProfile) {
        const expectations = [];
        const diversity = areaProfile.cultural_diversity;
        if (diversity.asian > 15) {
            expectations.push('Chinese', 'Japanese', 'Korean', 'Vietnamese', 'Thai');
        }
        else if (diversity.asian > 8) {
            expectations.push('Chinese', 'Japanese', 'Sushi');
        }
        if (diversity.hispanic > 30) {
            expectations.push('Mexican', 'Latin American', 'Spanish', 'Caribbean');
        }
        else if (diversity.hispanic > 15) {
            expectations.push('Mexican', 'Tex-Mex');
        }
        if (diversity.black > 25) {
            expectations.push('Soul Food', 'Caribbean', 'Creole', 'Cajun');
        }
        else if (diversity.black > 15) {
            expectations.push('Soul Food', 'BBQ');
        }
        if (areaProfile.education_level === 'very high') {
            expectations.push('French', 'Italian', 'Farm-to-table');
        }
        if (areaProfile.income_bracket === 'high') {
            expectations.push('Fine dining', 'Wine pairings', 'Artisanal');
        }
        return [...new Set(expectations)];
    }
    calculateFusionAcceptance(areaProfile) {
        let acceptance = 0.5;
        switch (areaProfile.education_level) {
            case 'very high':
                acceptance += 0.3;
                break;
            case 'high':
                acceptance += 0.2;
                break;
            case 'medium-high':
                acceptance += 0.1;
                break;
        }
        switch (areaProfile.income_bracket) {
            case 'high':
                acceptance += 0.2;
                break;
            case 'upper-middle':
                acceptance += 0.15;
                break;
            case 'middle':
                acceptance += 0.05;
                break;
        }
        const diversityScore = this.calculateDiversityScore(areaProfile.cultural_diversity);
        acceptance += diversityScore * 0.3;
        if (areaProfile.median_age < 35) {
            acceptance += 0.1;
        }
        else if (areaProfile.median_age > 45) {
            acceptance -= 0.1;
        }
        return Math.max(0.1, Math.min(1.0, acceptance));
    }
    calculateDiversityScore(diversity) {
        const values = Object.values(diversity);
        const maxValue = Math.max(...values);
        return 1 - (maxValue / 100);
    }
    assessExperimentalDining(areaProfile) {
        let experimental = 0.4;
        switch (areaProfile.education_level) {
            case 'very high':
                experimental += 0.4;
                break;
            case 'high':
                experimental += 0.3;
                break;
            case 'medium-high':
                experimental += 0.2;
                break;
        }
        switch (areaProfile.income_bracket) {
            case 'high':
                experimental += 0.3;
                break;
            case 'upper-middle':
                experimental += 0.2;
                break;
            case 'middle':
                experimental += 0.1;
                break;
        }
        if (areaProfile.median_age < 30) {
            experimental += 0.2;
        }
        else if (areaProfile.median_age < 40) {
            experimental += 0.1;
        }
        else if (areaProfile.median_age > 50) {
            experimental -= 0.1;
        }
        const diversityScore = this.calculateDiversityScore(areaProfile.cultural_diversity);
        experimental += diversityScore * 0.2;
        return Math.max(0.1, Math.min(1.0, experimental));
    }
    identifyCulturalFoodEvents(areaProfile) {
        const events = [];
        const diversity = areaProfile.cultural_diversity;
        if (diversity.asian > 10) {
            events.push('Chinese New Year celebrations');
            events.push('Mid-Autumn Festival');
            if (diversity.asian > 20) {
                events.push('Diwali food festivals');
                events.push('Korean cultural festivals');
            }
        }
        if (diversity.hispanic > 15) {
            events.push('Cinco de Mayo celebrations');
            events.push('Day of the Dead festivities');
            if (diversity.hispanic > 30) {
                events.push('Hispanic Heritage Month events');
                events.push('Quinceañera catering traditions');
            }
        }
        if (diversity.black > 15) {
            events.push('Juneteenth celebrations');
            events.push('Black History Month events');
            if (diversity.black > 25) {
                events.push('Soul food festivals');
                events.push('Caribbean cultural events');
            }
        }
        if (this.calculateDiversityScore(diversity) > 0.6) {
            events.push('International food festivals');
            events.push('Cultural heritage months');
        }
        if (areaProfile.income_bracket === 'high' && areaProfile.education_level === 'very high') {
            events.push('Wine and food festivals');
            events.push('Farm-to-table events');
            events.push('Chef collaboration dinners');
        }
        return events.slice(0, 6);
    }
};
exports.DemographicsService = DemographicsService;
exports.DemographicsService = DemographicsService = DemographicsService_1 = __decorate([
    (0, common_1.Injectable)()
], DemographicsService);
//# sourceMappingURL=demographics.service.js.map