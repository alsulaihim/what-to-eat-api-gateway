import { CdcService } from '../../external-apis/government/cdc.service';
import { HealthIntelligence } from '../../common/types/intelligence.types';
export declare class HealthIntelligenceService {
    private readonly cdcService;
    private readonly logger;
    constructor(cdcService: CdcService);
    analyzeHealthFoodCorrelation(location: string): Promise<HealthIntelligence>;
    private processHealthDataForFood;
    private generateNutritionalRecommendations;
    private getImmuneBoosters;
    private getRespiratoryConsiderations;
    private getAntiInflammatoryFoods;
    private getPerformanceNutrition;
    private determineFitnessSeason;
}
