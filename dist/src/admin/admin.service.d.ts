import { DatabaseService } from '../common/database/database.service';
import { UpdateAlgorithmWeightsDto } from './dto/update-algorithm-weights.dto';
import { ApiUsageQueryDto } from './dto/api-usage-query.dto';
import { UserAnalyticsQueryDto, AnalyticsTimeRange } from './dto/user-analytics-query.dto';
import { IntelligenceMetrics } from '../common/types/intelligence.types';
export declare class AdminService {
    private readonly databaseService;
    private readonly logger;
    constructor(databaseService: DatabaseService);
    getApiUsageStats(query: ApiUsageQueryDto): Promise<{
        pagination: {
            page: number;
            limit: number;
            totalCount: number;
            totalPages: number;
        };
        summary: {
            totalCost: number;
            averageResponseTime: number;
            totalRequests: number;
            averageCostPerRequest: number;
        };
        apiBreakdown: {
            apiName: string;
            totalCost: number;
            averageResponseTime: number;
            requestCount: number;
        }[];
        timeSeriesData: {
            timestamp: any;
            totalCost: any;
            totalRequests: any;
            successfulRequests: any;
            successRate: number;
            averageResponseTime: number;
        }[];
    }>;
    updateAlgorithmWeights(updateData: UpdateAlgorithmWeightsDto): Promise<{
        id: string;
        weights: {
            socialWeight: number;
            personalWeight: number;
            contextualWeight: number;
            trendsWeight: number;
        };
        updatedBy: string;
        lastUpdated: Date;
    }>;
    getCurrentAlgorithmWeights(): Promise<{
        weights: {
            socialWeight: number;
            personalWeight: number;
            contextualWeight: number;
            trendsWeight: number;
        };
        updatedBy: string;
        lastUpdated: Date;
        id?: undefined;
    } | {
        id: string;
        weights: {
            socialWeight: number;
            personalWeight: number;
            contextualWeight: number;
            trendsWeight: number;
        };
        updatedBy: string;
        lastUpdated: Date;
    }>;
    getUserAnalytics(query: UserAnalyticsQueryDto): Promise<{
        timeRange: AnalyticsTimeRange;
        dateRange: {
            startDate: string;
            endDate: string;
        };
        userOverview: {
            totalUsers: number;
            providerBreakdown: {
                google: number;
                apple: number;
                email: number;
            };
        };
        metrics: any;
        generatedAt: Date;
    }>;
    private getAggregatedApiUsage;
    private getSpecificUserMetric;
    private getActiveUsersData;
    private getNewRegistrationsData;
    private getRecommendationRequestsData;
    private getUserRetentionData;
    private getConversionRatesData;
    private getUserOverviewStats;
    getIntelligenceMetrics(): Promise<IntelligenceMetrics>;
    private getIntelligenceApiUsage;
    private getIntelligenceServiceMetrics;
    private getLastSuccessfulCall;
    private getIntelligenceDataFreshness;
}
