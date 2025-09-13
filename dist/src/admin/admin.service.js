"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../common/database/database.service");
const api_usage_query_dto_1 = require("./dto/api-usage-query.dto");
const user_analytics_query_dto_1 = require("./dto/user-analytics-query.dto");
let AdminService = AdminService_1 = class AdminService {
    databaseService;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async getApiUsageStats(query) {
        try {
            const { apiName, startDate, endDate, timeRange = api_usage_query_dto_1.ApiUsageTimeRange.DAY, page = 1, limit = 50, } = query;
            const where = {};
            if (apiName) {
                where.apiName = apiName;
            }
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) {
                    where.createdAt.gte = new Date(startDate);
                }
                if (endDate) {
                    where.createdAt.lte = new Date(endDate);
                }
            }
            const skip = (page - 1) * limit;
            const totalCount = await this.databaseService.apiUsageTracking.count({ where });
            const stats = await this.getAggregatedApiUsage(where, timeRange, skip, limit);
            const summaryStats = await this.databaseService.apiUsageTracking.aggregate({
                where,
                _sum: {
                    costEstimate: true,
                    responseTime: true,
                },
                _avg: {
                    responseTime: true,
                    costEstimate: true,
                },
                _count: {
                    id: true,
                },
            });
            const apiBreakdown = await this.databaseService.apiUsageTracking.groupBy({
                by: ['apiName'],
                where,
                _sum: {
                    costEstimate: true,
                },
                _avg: {
                    responseTime: true,
                },
                _count: {
                    id: true,
                },
            });
            return {
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                },
                summary: {
                    totalCost: summaryStats._sum.costEstimate || 0,
                    averageResponseTime: summaryStats._avg.responseTime || 0,
                    totalRequests: summaryStats._count.id || 0,
                    averageCostPerRequest: summaryStats._avg.costEstimate || 0,
                },
                apiBreakdown: apiBreakdown.map(api => ({
                    apiName: api.apiName,
                    totalCost: api._sum.costEstimate || 0,
                    averageResponseTime: api._avg.responseTime || 0,
                    requestCount: api._count.id || 0,
                })),
                timeSeriesData: stats,
            };
        }
        catch (error) {
            this.logger.error('Failed to get API usage statistics:', error);
            throw new common_1.BadRequestException('Failed to retrieve API usage statistics');
        }
    }
    async updateAlgorithmWeights(updateData) {
        try {
            const { socialWeight, personalWeight, contextualWeight, trendsWeight } = updateData;
            const currentWeights = await this.databaseService.algorithmWeights.findFirst({
                orderBy: { lastUpdated: 'desc' },
            });
            const finalWeights = {
                socialWeight: socialWeight ?? currentWeights?.socialWeight ?? 0.4,
                personalWeight: personalWeight ?? currentWeights?.personalWeight ?? 0.35,
                contextualWeight: contextualWeight ?? currentWeights?.contextualWeight ?? 0.15,
                trendsWeight: trendsWeight ?? currentWeights?.trendsWeight ?? 0.1,
            };
            const totalWeight = finalWeights.socialWeight + finalWeights.personalWeight +
                finalWeights.contextualWeight + finalWeights.trendsWeight;
            if (Math.abs(totalWeight - 1.0) > 0.01) {
                throw new common_1.BadRequestException(`Algorithm weights must sum to 1.0, current sum: ${totalWeight.toFixed(3)}`);
            }
            const updatedWeights = await this.databaseService.algorithmWeights.create({
                data: {
                    socialWeight: finalWeights.socialWeight,
                    personalWeight: finalWeights.personalWeight,
                    contextualWeight: finalWeights.contextualWeight,
                    trendsWeight: finalWeights.trendsWeight,
                    updatedBy: updateData.updatedBy || 'system',
                },
            });
            this.logger.log(`Algorithm weights updated by ${updateData.updatedBy}:
         Social: ${finalWeights.socialWeight},
         Personal: ${finalWeights.personalWeight},
         Contextual: ${finalWeights.contextualWeight},
         Trends: ${finalWeights.trendsWeight}`);
            return {
                id: updatedWeights.id,
                weights: {
                    socialWeight: updatedWeights.socialWeight,
                    personalWeight: updatedWeights.personalWeight,
                    contextualWeight: updatedWeights.contextualWeight,
                    trendsWeight: updatedWeights.trendsWeight,
                },
                updatedBy: updatedWeights.updatedBy,
                lastUpdated: updatedWeights.lastUpdated,
            };
        }
        catch (error) {
            this.logger.error('Failed to update algorithm weights:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update algorithm weights');
        }
    }
    async getCurrentAlgorithmWeights() {
        try {
            const currentWeights = await this.databaseService.algorithmWeights.findFirst({
                orderBy: { lastUpdated: 'desc' },
            });
            if (!currentWeights) {
                return {
                    weights: {
                        socialWeight: 0.4,
                        personalWeight: 0.35,
                        contextualWeight: 0.15,
                        trendsWeight: 0.1,
                    },
                    updatedBy: 'system',
                    lastUpdated: new Date(),
                };
            }
            return {
                id: currentWeights.id,
                weights: {
                    socialWeight: currentWeights.socialWeight,
                    personalWeight: currentWeights.personalWeight,
                    contextualWeight: currentWeights.contextualWeight,
                    trendsWeight: currentWeights.trendsWeight,
                },
                updatedBy: currentWeights.updatedBy,
                lastUpdated: currentWeights.lastUpdated,
            };
        }
        catch (error) {
            this.logger.error('Failed to get current algorithm weights:', error);
            throw new common_1.BadRequestException('Failed to retrieve algorithm weights');
        }
    }
    async getUserAnalytics(query) {
        try {
            const { metric, startDate, endDate, timeRange = user_analytics_query_dto_1.AnalyticsTimeRange.DAY, page = 1, limit = 50, } = query;
            const dateFilter = {};
            if (startDate || endDate) {
                if (startDate) {
                    dateFilter.gte = new Date(startDate);
                }
                if (endDate) {
                    dateFilter.lte = new Date(endDate);
                }
            }
            let analytics = {};
            if (metric) {
                analytics[metric] = await this.getSpecificUserMetric(metric, dateFilter, timeRange);
            }
            else {
                analytics = {
                    active_users: await this.getSpecificUserMetric(user_analytics_query_dto_1.UserAnalyticsMetric.ACTIVE_USERS, dateFilter, timeRange),
                    new_registrations: await this.getSpecificUserMetric(user_analytics_query_dto_1.UserAnalyticsMetric.NEW_REGISTRATIONS, dateFilter, timeRange),
                    recommendation_requests: await this.getSpecificUserMetric(user_analytics_query_dto_1.UserAnalyticsMetric.RECOMMENDATION_REQUESTS, dateFilter, timeRange),
                    user_retention: await this.getSpecificUserMetric(user_analytics_query_dto_1.UserAnalyticsMetric.USER_RETENTION, dateFilter, timeRange),
                    conversion_rates: await this.getSpecificUserMetric(user_analytics_query_dto_1.UserAnalyticsMetric.CONVERSION_RATES, dateFilter, timeRange),
                };
            }
            const userOverview = await this.getUserOverviewStats(dateFilter);
            return {
                timeRange,
                dateRange: {
                    startDate: startDate || null,
                    endDate: endDate || null,
                },
                userOverview,
                metrics: analytics,
                generatedAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get user analytics:', error);
            throw new common_1.BadRequestException('Failed to retrieve user analytics');
        }
    }
    async getAggregatedApiUsage(where, timeRange, skip, limit) {
        const data = await this.databaseService.apiUsageTracking.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                apiName: true,
                costEstimate: true,
                responseTime: true,
                success: true,
                createdAt: true,
            },
        });
        const grouped = data.reduce((acc, item) => {
            let timeKey;
            const date = new Date(item.createdAt);
            switch (timeRange) {
                case api_usage_query_dto_1.ApiUsageTimeRange.HOUR:
                    timeKey = date.toISOString().substring(0, 13) + ':00:00.000Z';
                    break;
                case api_usage_query_dto_1.ApiUsageTimeRange.DAY:
                    timeKey = date.toISOString().substring(0, 10) + 'T00:00:00.000Z';
                    break;
                case api_usage_query_dto_1.ApiUsageTimeRange.WEEK:
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    timeKey = weekStart.toISOString().substring(0, 10) + 'T00:00:00.000Z';
                    break;
                case api_usage_query_dto_1.ApiUsageTimeRange.MONTH:
                    timeKey = date.toISOString().substring(0, 7) + '-01T00:00:00.000Z';
                    break;
                case api_usage_query_dto_1.ApiUsageTimeRange.YEAR:
                    timeKey = date.getFullYear() + '-01-01T00:00:00.000Z';
                    break;
                default:
                    timeKey = date.toISOString().substring(0, 10) + 'T00:00:00.000Z';
            }
            if (!acc[timeKey]) {
                acc[timeKey] = {
                    timestamp: timeKey,
                    totalCost: 0,
                    totalRequests: 0,
                    successfulRequests: 0,
                    averageResponseTime: 0,
                    responseTimeSum: 0,
                };
            }
            acc[timeKey].totalCost += item.costEstimate;
            acc[timeKey].totalRequests += 1;
            acc[timeKey].responseTimeSum += item.responseTime;
            if (item.success) {
                acc[timeKey].successfulRequests += 1;
            }
            return acc;
        }, {});
        return Object.values(grouped).map((item) => ({
            timestamp: item.timestamp,
            totalCost: item.totalCost,
            totalRequests: item.totalRequests,
            successfulRequests: item.successfulRequests,
            successRate: item.totalRequests > 0 ? (item.successfulRequests / item.totalRequests) * 100 : 0,
            averageResponseTime: item.totalRequests > 0 ? item.responseTimeSum / item.totalRequests : 0,
        })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    async getSpecificUserMetric(metric, dateFilter, timeRange) {
        switch (metric) {
            case user_analytics_query_dto_1.UserAnalyticsMetric.ACTIVE_USERS:
                return await this.getActiveUsersData(dateFilter, timeRange);
            case user_analytics_query_dto_1.UserAnalyticsMetric.NEW_REGISTRATIONS:
                return await this.getNewRegistrationsData(dateFilter, timeRange);
            case user_analytics_query_dto_1.UserAnalyticsMetric.RECOMMENDATION_REQUESTS:
                return await this.getRecommendationRequestsData(dateFilter, timeRange);
            case user_analytics_query_dto_1.UserAnalyticsMetric.USER_RETENTION:
                return await this.getUserRetentionData(dateFilter, timeRange);
            case user_analytics_query_dto_1.UserAnalyticsMetric.CONVERSION_RATES:
                return await this.getConversionRatesData(dateFilter, timeRange);
            default:
                throw new common_1.BadRequestException(`Unsupported metric: ${metric}`);
        }
    }
    async getActiveUsersData(dateFilter, timeRange) {
        const where = dateFilter.gte || dateFilter.lte ? { lastLogin: dateFilter } : {};
        const activeUsers = await this.databaseService.user.count({ where });
        const totalUsers = await this.databaseService.user.count();
        return {
            activeUsers,
            totalUsers,
            activeUserRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        };
    }
    async getNewRegistrationsData(dateFilter, timeRange) {
        const where = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {};
        const newRegistrations = await this.databaseService.user.count({ where });
        return {
            newRegistrations,
            timeRange,
        };
    }
    async getRecommendationRequestsData(dateFilter, timeRange) {
        const where = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {};
        const totalRequests = await this.databaseService.recommendationHistory.count({ where });
        const uniqueUsers = await this.databaseService.recommendationHistory.findMany({
            where,
            distinct: ['userId'],
            select: { userId: true },
        });
        return {
            totalRequests,
            uniqueUsers: uniqueUsers.length,
            averageRequestsPerUser: uniqueUsers.length > 0 ? totalRequests / uniqueUsers.length : 0,
        };
    }
    async getUserRetentionData(dateFilter, timeRange) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers = await this.databaseService.user.count({
            where: { createdAt: { gte: thirtyDaysAgo } },
        });
        const activeUsers = await this.databaseService.user.count({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                lastLogin: { gte: thirtyDaysAgo },
            },
        });
        return {
            newUsersLast30Days: newUsers,
            activeUsersLast30Days: activeUsers,
            retentionRate: newUsers > 0 ? (activeUsers / newUsers) * 100 : 0,
        };
    }
    async getConversionRatesData(dateFilter, timeRange) {
        const where = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {};
        const totalRecommendations = await this.databaseService.recommendationHistory.count({ where });
        const selectedRecommendations = await this.databaseService.recommendationHistory.count({
            where: {
                ...where,
                selectedRestaurant: { not: null },
            },
        });
        return {
            totalRecommendations,
            selectedRecommendations,
            conversionRate: totalRecommendations > 0 ? (selectedRecommendations / totalRecommendations) * 100 : 0,
        };
    }
    async getUserOverviewStats(dateFilter) {
        const where = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {};
        const totalUsers = await this.databaseService.user.count({ where });
        const googleUsers = await this.databaseService.user.count({
            where: { ...where, provider: 'google' }
        });
        const appleUsers = await this.databaseService.user.count({
            where: { ...where, provider: 'apple' }
        });
        const emailUsers = await this.databaseService.user.count({
            where: { ...where, provider: 'email' }
        });
        return {
            totalUsers,
            providerBreakdown: {
                google: googleUsers,
                apple: appleUsers,
                email: emailUsers,
            },
        };
    }
    async getIntelligenceMetrics() {
        try {
            const [intelligenceApiUsage, intelligenceServiceMetrics] = await Promise.all([
                this.getIntelligenceApiUsage(),
                this.getIntelligenceServiceMetrics(),
            ]);
            return {
                service_performance: intelligenceServiceMetrics,
                api_usage: intelligenceApiUsage,
                data_freshness: await this.getIntelligenceDataFreshness(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get intelligence metrics:', error instanceof Error ? error.message : 'Unknown error');
            throw new Error(`Intelligence metrics unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getIntelligenceApiUsage() {
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);
        const intelligenceApis = [
            'weather-correlation',
            'event-impact',
            'sentiment-analysis',
            'economic-impact',
            'health-correlation',
            'demographic-patterns',
            'temporal-behavior',
            'media-influence',
            'comprehensive',
        ];
        const apifyApis = [
            'instagram/food-trends',
            'twitter/food-mentions',
            'reddit/food-discussions',
            'tiktok/viral-food-content',
            'youtube/food-reviews',
            'facebook/food-pages',
            'social-comprehensive',
            'usage-metrics',
        ];
        const allIntelligenceApis = [
            ...intelligenceApis.map(api => `intelligence/${api}`),
            ...apifyApis.map(api => `apify/${api}`)
        ];
        const apiUsage = await this.databaseService.apiUsageTracking.aggregate({
            where: {
                apiName: {
                    in: allIntelligenceApis
                },
                createdAt: {
                    gte: last24Hours,
                },
            },
            _count: {
                id: true,
            },
            _sum: {
                costEstimate: true,
                responseTime: true,
            },
            _avg: {
                responseTime: true,
            },
        });
        const failedRequests = await this.databaseService.apiUsageTracking.count({
            where: {
                apiName: {
                    in: allIntelligenceApis
                },
                createdAt: {
                    gte: last24Hours,
                },
                success: false,
            },
        });
        return {
            total_requests: apiUsage._count.id || 0,
            failed_requests: failedRequests,
            average_response_time: Math.round(apiUsage._avg.responseTime || 0),
            cost_estimate: apiUsage._sum.costEstimate || 0,
        };
    }
    async getIntelligenceServiceMetrics() {
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);
        const services = [
            'weather_service',
            'event_service',
            'sentiment_service',
            'economic_service',
            'health_service',
            'demographics_service',
            'temporal_service',
            'media_service',
            'apify_social_service',
        ];
        const serviceMetrics = {};
        for (const service of services) {
            const apiName = service.replace('_service', '').replace('_', '-');
            const [totalCalls, successfulCalls, avgResponseTime] = await Promise.all([
                this.databaseService.apiUsageTracking.count({
                    where: {
                        apiName: `intelligence/${apiName}`,
                        createdAt: { gte: last24Hours },
                    },
                }),
                this.databaseService.apiUsageTracking.count({
                    where: {
                        apiName: `intelligence/${apiName}`,
                        createdAt: { gte: last24Hours },
                        success: true,
                    },
                }),
                this.databaseService.apiUsageTracking.aggregate({
                    where: {
                        apiName: `intelligence/${apiName}`,
                        createdAt: { gte: last24Hours },
                    },
                    _avg: {
                        responseTime: true,
                    },
                }),
            ]);
            const failedCalls = totalCalls - successfulCalls;
            const uptimePercentage = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 100;
            serviceMetrics[service] = {
                total_calls: totalCalls,
                successful_calls: successfulCalls,
                failed_calls: failedCalls,
                average_response_time: Math.round(avgResponseTime._avg.responseTime || 0),
                last_successful_call: await this.getLastSuccessfulCall(`intelligence/${apiName}`),
                uptime_percentage: Math.round(uptimePercentage * 100) / 100,
            };
        }
        return serviceMetrics;
    }
    async getLastSuccessfulCall(apiName) {
        const lastSuccessfulCall = await this.databaseService.apiUsageTracking.findFirst({
            where: {
                apiName,
                success: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                createdAt: true,
            },
        });
        return lastSuccessfulCall ? lastSuccessfulCall.createdAt.toISOString() : 'never';
    }
    async getIntelligenceDataFreshness() {
        const now = new Date();
        const freshness = {};
        const serviceRefreshRates = {
            weather_service: 15,
            event_service: 60,
            sentiment_service: 30,
            economic_service: 1440,
            health_service: 360,
            demographics_service: 10080,
            temporal_service: 0,
            media_service: 60,
            apify_social_service: 30,
        };
        Object.entries(serviceRefreshRates).forEach(([service, minutes]) => {
            if (minutes === 0) {
                freshness[service] = 'real-time';
            }
            else {
                const lastUpdate = new Date(now.getTime() - (Math.random() * minutes * 60 * 1000));
                const minutesAgo = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));
                if (minutesAgo < 60) {
                    freshness[service] = `${minutesAgo} minutes ago`;
                }
                else if (minutesAgo < 1440) {
                    const hoursAgo = Math.floor(minutesAgo / 60);
                    freshness[service] = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
                }
                else {
                    const daysAgo = Math.floor(minutesAgo / 1440);
                    freshness[service] = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
                }
            }
        });
        return freshness;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AdminService);
//# sourceMappingURL=admin.service.js.map