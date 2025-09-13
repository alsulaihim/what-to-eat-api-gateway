import { HttpService } from '@nestjs/axios';
import { EconomicData } from '../../common/types/intelligence.types';
export declare class FederalReserveService {
    private readonly httpService;
    private readonly logger;
    private readonly baseUrl;
    constructor(httpService: HttpService);
    getEconomicIndicators(): Promise<EconomicData>;
    private getUnemploymentRate;
    private getGasPrices;
    private getFoodInflationRate;
    private getConsumerConfidenceIndex;
    private getInflationRate;
}
