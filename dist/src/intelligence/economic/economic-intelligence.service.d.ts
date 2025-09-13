import { FederalReserveService } from '../../external-apis/government/fed.service';
import { EconomicIntelligence } from '../../common/types/intelligence.types';
export declare class EconomicIntelligenceService {
    private readonly fedService;
    private readonly logger;
    constructor(fedService: FederalReserveService);
    analyzeEconomicImpact(): Promise<EconomicIntelligence>;
    private processEconomicData;
    private analyzeDiningBehaviorImpact;
    private determineBudgetShift;
    private calculateEconomicStressScore;
    private calculateDeliverySensitivity;
    private assessValueSeekingBehavior;
    private determineCategoryPreferences;
}
