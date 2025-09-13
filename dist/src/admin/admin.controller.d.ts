import { AdminService } from './admin.service';
import { UpdateAlgorithmWeightsDto } from './dto/update-algorithm-weights.dto';
import { ApiUsageQueryDto } from './dto/api-usage-query.dto';
import { UserAnalyticsQueryDto } from './dto/user-analytics-query.dto';
export declare class AdminController {
    private readonly adminService;
    private readonly logger;
    constructor(adminService: AdminService);
    getApiUsage(query: ApiUsageQueryDto, request: any): Promise<{
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
    updateAlgorithmWeights(updateData: UpdateAlgorithmWeightsDto, request: any): Promise<{
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
    getCurrentAlgorithmWeights(request: any): Promise<{
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
    getUserAnalytics(query: UserAnalyticsQueryDto, request: any): Promise<{
        timeRange: import("./dto/user-analytics-query.dto").AnalyticsTimeRange;
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
    getIntelligenceMetrics(request: any): Promise<import("../common/types/intelligence.types").IntelligenceMetrics>;
    getAdminHealth(request: any): Promise<{
        status: string;
        timestamp: Date;
        adminUser: {
            email: any;
            displayName: any;
            isAdmin: any;
        };
        services: {
            database: string;
            firebase: string;
            analytics: string;
            intelligence: string;
        };
    }>;
}
