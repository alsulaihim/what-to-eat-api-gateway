import { DemographicIntelligenceSimpleService, DemographicData, DemographicIntelligenceRequest, DemographicIntelligenceResponse } from './demographic-intelligence-simple.service';
declare class DemographicDataDto implements DemographicData {
    nationality?: string;
    ageGroup?: string;
    culturalBackground?: string;
    spiceToleranceLevel?: number;
    authenticityPreference?: number;
}
declare class DemographicIntelligenceRequestDto implements DemographicIntelligenceRequest {
    userDemographics: DemographicDataDto;
    targetLocation: string;
}
export declare class DemographicIntelligenceSimpleController {
    private readonly demographicIntelligenceService;
    constructor(demographicIntelligenceService: DemographicIntelligenceSimpleService);
    analyzeDemographics(request: DemographicIntelligenceRequestDto): Promise<DemographicIntelligenceResponse>;
}
export {};
