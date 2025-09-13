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
var ExternalWeatherSimpleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalWeatherSimpleService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let ExternalWeatherSimpleService = ExternalWeatherSimpleService_1 = class ExternalWeatherSimpleService {
    httpService;
    configService;
    logger = new common_1.Logger(ExternalWeatherSimpleService_1.name);
    baseUrl = 'http://api.openweathermap.org/data/2.5';
    airPollutionUrl = 'http://api.openweathermap.org/data/2.5/air_pollution';
    apiKey;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.apiKey = this.configService.get('OPENWEATHER_API_KEY');
        if (!this.apiKey) {
            this.logger.error('OPENWEATHER_API_KEY not configured');
        }
    }
    async getCurrentWeather(location) {
        try {
            if (!this.apiKey) {
                throw new Error('OpenWeather API key not configured');
            }
            const coordinates = await this.getCoordinates(location);
            const [currentWeather, forecast, airPollution] = await Promise.all([
                this.getCurrentWeatherData(coordinates.lat, coordinates.lon),
                this.getForecastData(coordinates.lat, coordinates.lon),
                this.getAirPollutionData(coordinates.lat, coordinates.lon),
            ]);
            return {
                temperature: Math.round(currentWeather.main.temp),
                condition: currentWeather.weather[0].main,
                humidity: currentWeather.main.humidity,
                pressure: currentWeather.main.pressure,
                visibility: currentWeather.visibility / 1000,
                uv_index: forecast.current?.uvi || 0,
                air_quality: {
                    aqi: airPollution.list[0].main.aqi,
                    main_pollutant: this.getMainPollutant(airPollution.list[0].components),
                },
                forecast: {
                    temperature_trend: this.analyzeTempTrend(forecast.daily.slice(0, 3)),
                    precipitation_probability: forecast.daily[0].pop * 100,
                    condition_change: this.analyzeConditionChange(forecast.daily.slice(0, 2)),
                },
                pollen: {
                    tree: this.getPollenLevel(currentWeather.main.temp, 'tree'),
                    grass: this.getPollenLevel(currentWeather.main.temp, 'grass'),
                    weed: this.getPollenLevel(currentWeather.main.temp, 'weed'),
                    mold: this.getPollenLevel(currentWeather.main.humidity, 'mold'),
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch weather data for ${location}:`, error.message);
            throw new Error(`Weather data unavailable: ${error.message}`);
        }
    }
    async getCoordinates(location) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/weather`, {
            params: {
                q: location,
                appid: this.apiKey,
                units: 'metric',
            },
        }));
        return {
            lat: response.data.coord.lat,
            lon: response.data.coord.lon,
        };
    }
    async getCurrentWeatherData(lat, lon) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/weather`, {
            params: {
                lat,
                lon,
                appid: this.apiKey,
                units: 'metric',
            },
        }));
        return response.data;
    }
    async getForecastData(lat, lon) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/onecall`, {
            params: {
                lat,
                lon,
                appid: this.apiKey,
                units: 'metric',
                exclude: 'minutely,alerts',
            },
        }));
        return response.data;
    }
    async getAirPollutionData(lat, lon) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(this.airPollutionUrl, {
            params: {
                lat,
                lon,
                appid: this.apiKey,
            },
        }));
        return response.data;
    }
    getMainPollutant(components) {
        const pollutants = [
            { name: 'pm2_5', value: components.pm2_5 },
            { name: 'pm10', value: components.pm10 },
            { name: 'o3', value: components.o3 },
            { name: 'no2', value: components.no2 },
            { name: 'so2', value: components.so2 },
        ];
        return pollutants.reduce((max, current) => current.value > max.value ? current : max).name;
    }
    analyzeTempTrend(dailyForecasts) {
        if (dailyForecasts.length < 2)
            return 'stable';
        const today = dailyForecasts[0].temp.max;
        const tomorrow = dailyForecasts[1].temp.max;
        const diff = tomorrow - today;
        if (diff > 5)
            return 'rising';
        if (diff < -5)
            return 'falling';
        return 'stable';
    }
    analyzeConditionChange(forecasts) {
        if (forecasts.length < 2)
            return 'no change expected';
        const todayCondition = forecasts[0].weather[0].main;
        const tomorrowCondition = forecasts[1].weather[0].main;
        if (todayCondition !== tomorrowCondition) {
            return `changing from ${todayCondition.toLowerCase()} to ${tomorrowCondition.toLowerCase()}`;
        }
        return 'conditions remaining stable';
    }
    getPollenLevel(value, type) {
        switch (type) {
            case 'tree':
                if (value > 15 && value < 25)
                    return 'high';
                if (value > 10 && value < 30)
                    return 'moderate';
                return 'low';
            case 'grass':
                if (value > 20 && value < 30)
                    return 'high';
                if (value > 15 && value < 35)
                    return 'moderate';
                return 'low';
            case 'weed':
                if (value > 25)
                    return 'high';
                if (value > 20)
                    return 'moderate';
                return 'low';
            case 'mold':
                if (value > 70)
                    return 'high';
                if (value > 50)
                    return 'moderate';
                return 'low';
            default:
                return 'unknown';
        }
    }
};
exports.ExternalWeatherSimpleService = ExternalWeatherSimpleService;
exports.ExternalWeatherSimpleService = ExternalWeatherSimpleService = ExternalWeatherSimpleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], ExternalWeatherSimpleService);
//# sourceMappingURL=external-weather-simple.service.js.map