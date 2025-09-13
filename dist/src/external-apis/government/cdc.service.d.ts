import { HttpService } from '@nestjs/axios';
import { HealthData } from '../../common/types/intelligence.types';
export declare class CdcService {
    private readonly httpService;
    private readonly logger;
    constructor(httpService: HttpService);
    getHealthData(location: string): Promise<HealthData>;
    private getFluActivity;
    private interpretFluActivity;
    private getSeasonalFluActivity;
    private getAirQualityEstimate;
    private getLatitude;
    private getLongitude;
    private getPollenForecast;
    private getSeasonalHealthTrends;
}
