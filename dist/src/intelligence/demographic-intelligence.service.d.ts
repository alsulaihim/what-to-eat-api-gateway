import { DatabaseService } from '../common/database/database.service';
import { DemographicData, DemographicSimilarityScore, DemographicIntelligenceRequest, DemographicIntelligenceResponse } from '../common/types/demographic.types';
export declare class DemographicIntelligenceService {
    private readonly databaseService;
    private readonly logger;
    constructor(databaseService: DatabaseService);
    getDemographicIntelligence(request: DemographicIntelligenceRequest): Promise<DemographicIntelligenceResponse>;
    findSimilarUsers(demographics: DemographicData): Promise<Array<{
        demographics: DemographicData;
        userId: string;
    }>>;
    calculateSimilarityScore(userA: DemographicData, userB: DemographicData): DemographicSimilarityScore;
    private calculateCulturalSimilarity;
    private calculateDietarySimilarity;
    private calculateLifestyleSimilarity;
    private calculatePreferencesSimilarity;
    private getMatchingFactors;
    private getRecommendationAdjustments;
    private getCuisineBoosts;
    private getPriceAdjustment;
    private generateDemographicRecommendations;
    private analyzeCommonPreferences;
    private generateCulturalInsights;
    private getCulturalContext;
    private getDietaryConsiderations;
    private getSocialTrends;
}
