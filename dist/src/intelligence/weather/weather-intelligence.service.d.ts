import { OpenWeatherService } from '../../external-apis/weather/openweather.service';
import { WeatherIntelligence } from '../../common/types/intelligence.types';
export declare class WeatherIntelligenceService {
    private readonly weatherService;
    private readonly logger;
    constructor(weatherService: OpenWeatherService);
    getWeatherFoodCorrelation(location: string): Promise<WeatherIntelligence>;
    private analyzeWeatherFoodCorrelation;
    private describeConditions;
    private describeForecast;
    private summarizePollenCount;
    private calculateTemperatureImpact;
    private analyzePrecipitationEffect;
    private getSeasonalTrends;
    private isComfortFoodWeather;
    private getCuisineBoost;
    private getTemperaturePreference;
    private getDiningModeRecommendation;
}
