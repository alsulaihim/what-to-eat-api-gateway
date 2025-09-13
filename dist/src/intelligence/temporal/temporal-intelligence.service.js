"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TemporalIntelligenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemporalIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
let TemporalIntelligenceService = TemporalIntelligenceService_1 = class TemporalIntelligenceService {
    logger = new common_1.Logger(TemporalIntelligenceService_1.name);
    async analyzeTemporalBehavior(timeZone = 'America/New_York') {
        try {
            const timeContext = this.getTimeContext(timeZone);
            const behavioralPatterns = this.analyzeBehavioralPatterns(timeContext);
            return {
                time_context: timeContext,
                behavioral_patterns: behavioralPatterns,
            };
        }
        catch (error) {
            this.logger.error('Failed to analyze temporal behavior:', error.message);
            throw new Error(`Temporal intelligence unavailable: ${error.message}`);
        }
    }
    getTimeContext(timeZone) {
        const now = new Date();
        const timeInZone = new Date(now.toLocaleString("en-US", { timeZone }));
        return {
            current_time: timeInZone.toLocaleTimeString('en-US', {
                hour12: true,
                hour: 'numeric',
                minute: '2-digit',
            }),
            day_of_week: timeInZone.toLocaleDateString('en-US', { weekday: 'long' }),
            seasonal_period: this.getSeasonalPeriod(timeInZone),
            local_time_zone: timeZone,
        };
    }
    getSeasonalPeriod(date) {
        const month = date.getMonth();
        const day = date.getDate();
        if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day < 20)) {
            return 'winter';
        }
        else if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
            return 'spring';
        }
        else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 22)) {
            return 'summer';
        }
        else {
            return 'fall';
        }
    }
    analyzeBehavioralPatterns(timeContext) {
        const currentTime = new Date();
        const hour = currentTime.getHours();
        const dayOfWeek = currentTime.getDay();
        return {
            energy_state: this.determineEnergyState(hour, dayOfWeek),
            craving_predictions: this.predictCravings(hour, dayOfWeek, timeContext.seasonal_period),
            social_dining_likelihood: this.calculateSocialDiningLikelihood(hour, dayOfWeek),
            meal_timing: this.determineMealTiming(hour),
        };
    }
    determineEnergyState(hour, dayOfWeek) {
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        if (isWeekend) {
            if (hour >= 6 && hour < 10) {
                return 'leisurely awakening - relaxed energy';
            }
            else if (hour >= 10 && hour < 14) {
                return 'peak weekend energy - social and active';
            }
            else if (hour >= 14 && hour < 18) {
                return 'afternoon relaxation - moderate energy';
            }
            else if (hour >= 18 && hour < 22) {
                return 'evening social energy - dining and entertainment';
            }
            else {
                return 'winding down - low energy';
            }
        }
        else {
            if (hour >= 6 && hour < 9) {
                return 'morning rush - high but focused energy';
            }
            else if (hour >= 9 && hour < 12) {
                return 'peak productivity - high mental energy';
            }
            else if (hour >= 12 && hour < 14) {
                return 'midday break - social energy for lunch';
            }
            else if (hour >= 14 && hour < 17) {
                return 'afternoon productivity - sustained energy';
            }
            else if (hour >= 17 && hour < 19) {
                return 'post-work transition - moderate energy';
            }
            else if (hour >= 19 && hour < 21) {
                return 'evening dining - social energy';
            }
            else {
                return 'evening wind-down - decreasing energy';
            }
        }
    }
    predictCravings(hour, dayOfWeek, season) {
        const cravings = [];
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        if (hour >= 6 && hour < 10) {
            cravings.push('coffee and pastries', 'hearty breakfast', 'fresh fruit');
            if (isWeekend) {
                cravings.push('brunch items', 'pancakes and waffles');
            }
        }
        else if (hour >= 10 && hour < 12) {
            cravings.push('coffee and snacks', 'light bites', 'energizing foods');
        }
        else if (hour >= 12 && hour < 14) {
            cravings.push('satisfying lunch', 'quick meals', 'protein-rich foods');
            if (!isWeekend) {
                cravings.push('convenient options', 'meal deals');
            }
        }
        else if (hour >= 14 && hour < 17) {
            cravings.push('afternoon snacks', 'caffeine boost', 'sweet treats');
        }
        else if (hour >= 17 && hour < 19) {
            cravings.push('happy hour items', 'appetizers', 'comfort food');
        }
        else if (hour >= 19 && hour < 21) {
            cravings.push('substantial dinner', 'social dining', 'indulgent foods');
        }
        else if (hour >= 21) {
            cravings.push('late night snacks', 'comfort food', 'easy options');
        }
        switch (season) {
            case 'winter':
                cravings.push('warm comfort foods', 'hot beverages', 'hearty stews');
                break;
            case 'spring':
                cravings.push('fresh vegetables', 'lighter fare', 'detox foods');
                break;
            case 'summer':
                cravings.push('cold refreshing foods', 'grilled items', 'fresh fruits');
                break;
            case 'fall':
                cravings.push('pumpkin spice', 'warming spices', 'harvest foods');
                break;
        }
        if (dayOfWeek === 1) {
            cravings.push('motivational foods', 'healthy restart options');
        }
        else if (dayOfWeek === 5) {
            cravings.push('celebratory foods', 'indulgent options', 'social dining');
        }
        else if (isWeekend) {
            cravings.push('leisurely dining', 'special treats', 'experimental foods');
        }
        return [...new Set(cravings)].slice(0, 8);
    }
    calculateSocialDiningLikelihood(hour, dayOfWeek) {
        let likelihood = 0.3;
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        if (hour >= 11 && hour < 14) {
            likelihood += isWeekend ? 0.4 : 0.3;
        }
        else if (hour >= 17 && hour < 22) {
            likelihood += isWeekend ? 0.5 : 0.4;
        }
        else if (hour >= 22 && hour < 24) {
            likelihood += isWeekend ? 0.3 : 0.1;
        }
        if (isWeekend) {
            likelihood += 0.3;
        }
        else if (dayOfWeek === 5) {
            likelihood += 0.4;
        }
        else if (dayOfWeek === 4) {
            likelihood += 0.2;
        }
        const date = new Date();
        if (this.isHoliday(date)) {
            likelihood += 0.4;
        }
        return Math.max(0.1, Math.min(1.0, likelihood));
    }
    determineMealTiming(hour) {
        if (hour >= 6 && hour < 11) {
            return 'breakfast time - morning fuel needed';
        }
        else if (hour >= 11 && hour < 14) {
            return 'lunch time - midday sustenance';
        }
        else if (hour >= 14 && hour < 17) {
            return 'afternoon snack time - energy maintenance';
        }
        else if (hour >= 17 && hour < 21) {
            return 'dinner time - main evening meal';
        }
        else if (hour >= 21 && hour < 24) {
            return 'late dinner/snack time - lighter options preferred';
        }
        else {
            return 'late night/early morning - minimal eating activity';
        }
    }
    isHoliday(date) {
        const month = date.getMonth();
        const day = date.getDate();
        const dayOfWeek = date.getDay();
        const holidays = [
            { month: 0, day: 1 },
            { month: 1, day: 14 },
            { month: 2, day: 17 },
            { month: 6, day: 4 },
            { month: 9, day: 31 },
            { month: 10, day: this.getThanksgivingDay(date.getFullYear()) },
            { month: 11, day: 24 },
            { month: 11, day: 25 },
            { month: 11, day: 31 },
        ];
        return holidays.some(holiday => holiday.month === month && holiday.day === day);
    }
    getThanksgivingDay(year) {
        const november1 = new Date(year, 10, 1);
        const firstThursday = 1 + (4 - november1.getDay() + 7) % 7;
        return firstThursday + 21;
    }
};
exports.TemporalIntelligenceService = TemporalIntelligenceService;
exports.TemporalIntelligenceService = TemporalIntelligenceService = TemporalIntelligenceService_1 = __decorate([
    (0, common_1.Injectable)()
], TemporalIntelligenceService);
//# sourceMappingURL=temporal-intelligence.service.js.map