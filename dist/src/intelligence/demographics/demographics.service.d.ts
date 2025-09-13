import { DemographicsIntelligence } from '../../common/types/intelligence.types';
export declare class DemographicsService {
    private readonly logger;
    analyzeDemographicPatterns(location: string): Promise<DemographicsIntelligence>;
    private getAreaProfile;
    private getCityDemographics;
    private getDefaultDemographics;
    private analyzeFoodCultureCorrelation;
    private determineAuthenticityExpectations;
    private calculateFusionAcceptance;
    private calculateDiversityScore;
    private assessExperimentalDining;
    private identifyCulturalFoodEvents;
}
