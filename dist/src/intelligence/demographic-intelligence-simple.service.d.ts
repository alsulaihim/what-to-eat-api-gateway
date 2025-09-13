import { DatabaseService } from '../common/database/database.service';
export interface DemographicData {
    nationality?: string;
    ageGroup?: string;
    culturalBackground?: string;
    spiceToleranceLevel?: number;
    authenticityPreference?: number;
}
export interface DemographicIntelligenceRequest {
    userDemographics: DemographicData;
    targetLocation: string;
}
export interface DemographicIntelligenceResponse {
    success: boolean;
    data: {
        similarUsers: {
            count: number;
            demographics: DemographicData[];
            commonPreferences: any;
        };
        recommendations: any;
        insights: any;
    };
    error?: string;
}
export declare class DemographicIntelligenceSimpleService {
    private readonly databaseService;
    private readonly logger;
    constructor(databaseService: DatabaseService);
    getDemographicIntelligence(request: DemographicIntelligenceRequest): Promise<DemographicIntelligenceResponse>;
}
