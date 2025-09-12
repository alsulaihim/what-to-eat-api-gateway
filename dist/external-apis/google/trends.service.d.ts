import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../common/database/database.service';
export interface TrendsRequest {
    keywords: string[];
    location?: {
        latitude: number;
        longitude: number;
        radius: number;
    };
    timeRange?: 'now 1-d' | 'now 7-d' | 'today 1-m' | 'today 3-m' | 'today 12-m';
    category?: string;
}
export interface TrendingFood {
    keyword: string;
    interest: number;
    relatedQueries?: string[];
    risingPercentage?: number;
}
export declare class TrendsService {
    private configService;
    private databaseService;
    private readonly logger;
    private readonly httpClient;
    private readonly apiKey;
    constructor(configService: ConfigService, databaseService: DatabaseService);
    getTrendingFood(request: TrendsRequest): Promise<TrendingFood[]>;
    getLocalFoodTrends(location: {
        latitude: number;
        longitude: number;
        radius: number;
    }): Promise<TrendingFood[]>;
    getKeywordInterest(keywords: string[]): Promise<Map<string, number>>;
    private getMockTrendingData;
    private getMockLocalTrends;
    private calculateMockInterest;
    private adjustInterestByTime;
    private getCurrentSeason;
    private trackApiUsage;
}
