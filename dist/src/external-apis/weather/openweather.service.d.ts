import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { WeatherData } from '../../common/types/intelligence.types';
export declare class OpenWeatherService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly airPollutionUrl;
    private readonly apiKey;
    constructor(httpService: HttpService, configService: ConfigService);
    getCurrentWeather(location: string): Promise<WeatherData>;
    private getCoordinates;
    private getCurrentWeatherData;
    private getForecastData;
    private getAirPollutionData;
    private getMainPollutant;
    private analyzeTempTrend;
    private analyzeConditionChange;
    private getPollenLevel;
}
