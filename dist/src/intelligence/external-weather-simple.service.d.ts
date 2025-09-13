import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface SimpleWeatherData {
    temperature: number;
    condition: string;
    humidity: number;
    pressure: number;
    visibility: number;
    uv_index: number;
    air_quality: {
        aqi: number;
        main_pollutant: string;
    };
    forecast: {
        temperature_trend: string;
        precipitation_probability: number;
        condition_change: string;
    };
    pollen: {
        tree: string;
        grass: string;
        weed: string;
        mold: string;
    };
}
export declare class ExternalWeatherSimpleService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly airPollutionUrl;
    private readonly apiKey;
    constructor(httpService: HttpService, configService: ConfigService);
    getCurrentWeather(location: string): Promise<SimpleWeatherData>;
    private getCoordinates;
    private getCurrentWeatherData;
    private getForecastData;
    private getAirPollutionData;
    private getMainPollutant;
    private analyzeTempTrend;
    private analyzeConditionChange;
    private getPollenLevel;
}
