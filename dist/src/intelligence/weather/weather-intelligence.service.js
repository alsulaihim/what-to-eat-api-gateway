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
var WeatherIntelligenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const openweather_service_1 = require("../../external-apis/weather/openweather.service");
let WeatherIntelligenceService = WeatherIntelligenceService_1 = class WeatherIntelligenceService {
    weatherService;
    logger = new common_1.Logger(WeatherIntelligenceService_1.name);
    constructor(weatherService) {
        this.weatherService = weatherService;
    }
    async getWeatherFoodCorrelation(location) {
        try {
            const weatherData = await this.weatherService.getCurrentWeather(location);
            return this.analyzeWeatherFoodCorrelation(weatherData);
        }
        catch (error) {
            this.logger.error(`Failed to analyze weather for ${location}:`, error.message);
            throw new Error(`Weather intelligence unavailable: ${error.message}`);
        }
    }
    analyzeWeatherFoodCorrelation(weatherData) {
        const temperature = weatherData.temperature;
        const condition = weatherData.condition.toLowerCase();
        const humidity = weatherData.humidity;
        const airQuality = weatherData.air_quality.aqi;
        return {
            weather_context: {
                current_conditions: this.describeConditions(weatherData),
                forecast: this.describeForecast(weatherData),
                air_quality: airQuality,
                pollen_count: this.summarizePollenCount(weatherData.pollen),
            },
            food_correlation: {
                temperature_impact: this.calculateTemperatureImpact(temperature),
                precipitation_effect: this.analyzePrecipitationEffect(condition, weatherData.forecast.precipitation_probability),
                seasonal_trends: this.getSeasonalTrends(),
                comfort_food_trigger: this.isComfortFoodWeather(temperature, condition, airQuality),
            },
            recommendations: {
                cuisine_boost: this.getCuisineBoost(temperature, condition),
                temperature_preference: this.getTemperaturePreference(temperature, condition),
                dining_mode: this.getDiningModeRecommendation(weatherData),
            },
        };
    }
    describeConditions(weatherData) {
        const temp = weatherData.temperature;
        const condition = weatherData.condition;
        const visibility = weatherData.visibility;
        let description = `${temp}°C, ${condition.toLowerCase()}`;
        if (visibility < 5) {
            description += ', low visibility';
        }
        if (weatherData.uv_index > 7) {
            description += ', high UV';
        }
        return description;
    }
    describeForecast(weatherData) {
        const forecast = weatherData.forecast;
        let description = `Temperature ${forecast.temperature_trend}`;
        if (forecast.precipitation_probability > 50) {
            description += `, ${forecast.precipitation_probability}% chance of precipitation`;
        }
        if (forecast.condition_change !== 'conditions remaining stable') {
            description += `, ${forecast.condition_change}`;
        }
        return description;
    }
    summarizePollenCount(pollen) {
        const levels = Object.values(pollen);
        const highCount = levels.filter(level => level === 'high').length;
        if (highCount >= 3)
            return 'very high overall';
        if (highCount >= 2)
            return 'high overall';
        if (highCount >= 1)
            return 'moderate overall';
        return 'low overall';
    }
    calculateTemperatureImpact(temperature) {
        if (temperature < 5)
            return 0.9;
        if (temperature < 15)
            return 0.7;
        if (temperature > 30)
            return 0.8;
        if (temperature > 25)
            return 0.6;
        return 0.3;
    }
    analyzePrecipitationEffect(condition, precipitationProb) {
        if (condition.includes('rain') || condition.includes('storm') || precipitationProb > 70) {
            return 'strongly favors indoor dining and delivery';
        }
        if (condition.includes('cloud') || precipitationProb > 30) {
            return 'slightly favors indoor dining';
        }
        if (condition.includes('clear') || condition.includes('sun')) {
            return 'favors outdoor dining and patios';
        }
        return 'neutral impact on dining location preference';
    }
    getSeasonalTrends() {
        const month = new Date().getMonth();
        const trends = [];
        if (month >= 11 || month <= 2) {
            trends.push('hot soups and stews popular');
            trends.push('comfort food demand peaks');
            trends.push('warming spices trending');
            trends.push('hearty protein dishes favored');
        }
        else if (month >= 3 && month <= 5) {
            trends.push('fresh vegetables in season');
            trends.push('lighter fare gaining popularity');
            trends.push('outdoor dining reopening');
            trends.push('detox and health foods trending');
        }
        else if (month >= 6 && month <= 8) {
            trends.push('cold dishes and salads peak');
            trends.push('ice cream and frozen treats surge');
            trends.push('grilling and BBQ season');
            trends.push('fresh fruit consumption high');
        }
        else {
            trends.push('pumpkin and autumn spices popular');
            trends.push('harvest vegetables featured');
            trends.push('transition to comfort foods begins');
            trends.push('warm beverages return');
        }
        return trends;
    }
    isComfortFoodWeather(temperature, condition, airQuality) {
        if (temperature < 10)
            return true;
        if (condition.includes('rain') || condition.includes('storm') || condition.includes('snow')) {
            return true;
        }
        if (airQuality > 150)
            return true;
        if (condition.includes('overcast') || condition.includes('fog')) {
            return true;
        }
        return false;
    }
    getCuisineBoost(temperature, condition) {
        const boosts = [];
        if (temperature < 5) {
            boosts.push('Indian', 'Thai', 'Mexican', 'Italian');
        }
        else if (temperature < 15) {
            boosts.push('Chinese', 'Japanese', 'Korean', 'Italian');
        }
        else if (temperature > 30) {
            boosts.push('Mediterranean', 'Greek', 'Sushi', 'Vietnamese');
        }
        else if (temperature > 25) {
            boosts.push('Salad bars', 'Seafood', 'Mediterranean', 'Fresh Mexican');
        }
        if (condition.includes('rain') || condition.includes('storm')) {
            boosts.push('Pizza', 'Comfort food', 'Soup specialists');
        }
        if (condition.includes('sun') || condition.includes('clear')) {
            boosts.push('BBQ', 'Outdoor dining', 'Food trucks');
        }
        return [...new Set(boosts)];
    }
    getTemperaturePreference(temperature, condition) {
        if (temperature < 5) {
            return 'very hot foods and beverages strongly preferred';
        }
        else if (temperature < 15) {
            return 'hot foods and warm beverages preferred';
        }
        else if (temperature > 30) {
            return 'cold foods and iced beverages strongly preferred';
        }
        else if (temperature > 25) {
            return 'cool foods and cold beverages preferred';
        }
        else {
            return 'temperature-neutral food preferences';
        }
    }
    getDiningModeRecommendation(weatherData) {
        const temp = weatherData.temperature;
        const condition = weatherData.condition.toLowerCase();
        const precipProb = weatherData.forecast.precipitation_probability;
        const airQuality = weatherData.air_quality.aqi;
        if (condition.includes('storm') || precipProb > 80) {
            return 'strongly recommend delivery';
        }
        if (temp < 0 || temp > 35) {
            return 'delivery preferred due to extreme temperature';
        }
        if (airQuality > 200) {
            return 'indoor dining only, avoid outdoor seating';
        }
        if (condition.includes('rain') || precipProb > 50) {
            return 'delivery preferred, indoor dining acceptable';
        }
        if (temp < 5 || temp > 30) {
            return 'indoor dining preferred';
        }
        if (condition.includes('clear') || condition.includes('sun')) {
            if (temp >= 15 && temp <= 25) {
                return 'excellent conditions for outdoor dining';
            }
            else {
                return 'good conditions for dining out';
            }
        }
        return 'neutral - both delivery and dining out suitable';
    }
};
exports.WeatherIntelligenceService = WeatherIntelligenceService;
exports.WeatherIntelligenceService = WeatherIntelligenceService = WeatherIntelligenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openweather_service_1.OpenWeatherService])
], WeatherIntelligenceService);
//# sourceMappingURL=weather-intelligence.service.js.map