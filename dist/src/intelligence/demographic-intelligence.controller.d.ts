import { DemographicIntelligenceService } from './demographic-intelligence.service';
import { DemographicIntelligenceRequestDto, DemographicIntelligenceResponseDto, UserSimilarityRequestDto, UserSimilarityResponseDto } from './dto/demographic-intelligence.dto';
export declare class DemographicIntelligenceController {
    private readonly demographicIntelligenceService;
    constructor(demographicIntelligenceService: DemographicIntelligenceService);
    analyzeDemographics(req: any, request: DemographicIntelligenceRequestDto): Promise<DemographicIntelligenceResponseDto>;
    findSimilarUsers(req: any, request: UserSimilarityRequestDto): Promise<UserSimilarityResponseDto>;
    getUserDemographicInsights(req: any, userId: string): Promise<any>;
    getDemographicTrends(ageGroup?: string, culturalBackground?: string, location?: string): Promise<any>;
}
