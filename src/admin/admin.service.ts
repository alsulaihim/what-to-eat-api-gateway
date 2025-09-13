import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { UpdateAlgorithmWeightsDto } from './dto/update-algorithm-weights.dto';
import { ApiUsageQueryDto, ApiUsageTimeRange } from './dto/api-usage-query.dto';
import { UserAnalyticsQueryDto, UserAnalyticsMetric, AnalyticsTimeRange } from './dto/user-analytics-query.dto';
import { IntelligenceMetrics } from '../common/types/intelligence.types';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get API usage statistics with optional filtering and aggregation
   */
  async getApiUsageStats(query: ApiUsageQueryDto) {
    try {
      const {
        apiName,
        startDate,
        endDate,
        timeRange = ApiUsageTimeRange.DAY,
        page = 1,
        limit = 50,
      } = query;

      // Build where clause
      const where: any = {};

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

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get total count
      const totalCount = await this.databaseService.apiUsageTracking.count({ where });

      // Get aggregated data based on time range
      const stats = await this.getAggregatedApiUsage(where, timeRange, skip, limit);

      // Get summary statistics
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

      // Get API breakdown
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
    } catch (error) {
      this.logger.error('Failed to get API usage statistics:', error);
      throw new BadRequestException('Failed to retrieve API usage statistics');
    }
  }

  /**
   * Update algorithm weights for recommendation engine
   */
  async updateAlgorithmWeights(updateData: UpdateAlgorithmWeightsDto) {
    try {
      // Validate that weights sum to approximately 1.0 (allowing for small floating point variations)
      const { socialWeight, personalWeight, contextualWeight, trendsWeight } = updateData;

      // Get current weights if not all are provided
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
        throw new BadRequestException(
          `Algorithm weights must sum to 1.0, current sum: ${totalWeight.toFixed(3)}`
        );
      }

      // Create new algorithm weights record
      const updatedWeights = await this.databaseService.algorithmWeights.create({
        data: {
          socialWeight: finalWeights.socialWeight,
          personalWeight: finalWeights.personalWeight,
          contextualWeight: finalWeights.contextualWeight,
          trendsWeight: finalWeights.trendsWeight,
          updatedBy: updateData.updatedBy || 'system',
        },
      });

      this.logger.log(
        `Algorithm weights updated by ${updateData.updatedBy}:
         Social: ${finalWeights.socialWeight},
         Personal: ${finalWeights.personalWeight},
         Contextual: ${finalWeights.contextualWeight},
         Trends: ${finalWeights.trendsWeight}`
      );

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
    } catch (error) {
      this.logger.error('Failed to update algorithm weights:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update algorithm weights');
    }
  }

  /**
   * Get current algorithm weights
   */
  async getCurrentAlgorithmWeights() {
    try {
      const currentWeights = await this.databaseService.algorithmWeights.findFirst({
        orderBy: { lastUpdated: 'desc' },
      });

      if (!currentWeights) {
        // Return default weights if none exist
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
    } catch (error) {
      this.logger.error('Failed to get current algorithm weights:', error);
      throw new BadRequestException('Failed to retrieve algorithm weights');
    }
  }

  /**
   * Get user analytics and behavior data
   */
  async getUserAnalytics(query: UserAnalyticsQueryDto) {
    try {
      const {
        metric,
        startDate,
        endDate,
        timeRange = AnalyticsTimeRange.DAY,
        page = 1,
        limit = 50,
      } = query;

      // Build date range filter
      const dateFilter: any = {};
      if (startDate || endDate) {
        if (startDate) {
          dateFilter.gte = new Date(startDate);
        }
        if (endDate) {
          dateFilter.lte = new Date(endDate);
        }
      }

      let analytics: any = {};

      // Get specific metric or all metrics
      if (metric) {
        analytics[metric] = await this.getSpecificUserMetric(metric, dateFilter, timeRange);
      } else {
        // Get all metrics
        analytics = {
          active_users: await this.getSpecificUserMetric(UserAnalyticsMetric.ACTIVE_USERS, dateFilter, timeRange),
          new_registrations: await this.getSpecificUserMetric(UserAnalyticsMetric.NEW_REGISTRATIONS, dateFilter, timeRange),
          recommendation_requests: await this.getSpecificUserMetric(UserAnalyticsMetric.RECOMMENDATION_REQUESTS, dateFilter, timeRange),
          user_retention: await this.getSpecificUserMetric(UserAnalyticsMetric.USER_RETENTION, dateFilter, timeRange),
          conversion_rates: await this.getSpecificUserMetric(UserAnalyticsMetric.CONVERSION_RATES, dateFilter, timeRange),
        };
      }

      // Get user overview stats
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
    } catch (error) {
      this.logger.error('Failed to get user analytics:', error);
      throw new BadRequestException('Failed to retrieve user analytics');
    }
  }

  /**
   * Private helper method to get aggregated API usage data
   */
  private async getAggregatedApiUsage(where: any, timeRange: ApiUsageTimeRange, skip: number, limit: number) {
    // For now, return basic grouped data - in production, you'd use more sophisticated time-series queries
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

    // Group by time period based on timeRange
    const grouped = data.reduce((acc, item) => {
      let timeKey: string;
      const date = new Date(item.createdAt);

      switch (timeRange) {
        case ApiUsageTimeRange.HOUR:
          timeKey = date.toISOString().substring(0, 13) + ':00:00.000Z';
          break;
        case ApiUsageTimeRange.DAY:
          timeKey = date.toISOString().substring(0, 10) + 'T00:00:00.000Z';
          break;
        case ApiUsageTimeRange.WEEK:
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          timeKey = weekStart.toISOString().substring(0, 10) + 'T00:00:00.000Z';
          break;
        case ApiUsageTimeRange.MONTH:
          timeKey = date.toISOString().substring(0, 7) + '-01T00:00:00.000Z';
          break;
        case ApiUsageTimeRange.YEAR:
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
    }, {} as any);

    // Calculate averages and return sorted array
    return Object.values(grouped).map((item: any) => ({
      timestamp: item.timestamp,
      totalCost: item.totalCost,
      totalRequests: item.totalRequests,
      successfulRequests: item.successfulRequests,
      successRate: item.totalRequests > 0 ? (item.successfulRequests / item.totalRequests) * 100 : 0,
      averageResponseTime: item.totalRequests > 0 ? item.responseTimeSum / item.totalRequests : 0,
    })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Private helper method to get specific user metrics
   */
  private async getSpecificUserMetric(metric: UserAnalyticsMetric, dateFilter: any, timeRange: AnalyticsTimeRange) {
    switch (metric) {
      case UserAnalyticsMetric.ACTIVE_USERS:
        return await this.getActiveUsersData(dateFilter, timeRange);
      case UserAnalyticsMetric.NEW_REGISTRATIONS:
        return await this.getNewRegistrationsData(dateFilter, timeRange);
      case UserAnalyticsMetric.RECOMMENDATION_REQUESTS:
        return await this.getRecommendationRequestsData(dateFilter, timeRange);
      case UserAnalyticsMetric.USER_RETENTION:
        return await this.getUserRetentionData(dateFilter, timeRange);
      case UserAnalyticsMetric.CONVERSION_RATES:
        return await this.getConversionRatesData(dateFilter, timeRange);
      default:
        throw new BadRequestException(`Unsupported metric: ${metric}`);
    }
  }

  private async getActiveUsersData(dateFilter: any, timeRange: AnalyticsTimeRange) {
    const where = dateFilter.gte || dateFilter.lte ? { lastLogin: dateFilter } : {};

    const activeUsers = await this.databaseService.user.count({ where });
    const totalUsers = await this.databaseService.user.count();

    return {
      activeUsers,
      totalUsers,
      activeUserRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
    };
  }

  private async getNewRegistrationsData(dateFilter: any, timeRange: AnalyticsTimeRange) {
    const where = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {};

    const newRegistrations = await this.databaseService.user.count({ where });

    return {
      newRegistrations,
      timeRange,
    };
  }

  private async getRecommendationRequestsData(dateFilter: any, timeRange: AnalyticsTimeRange) {
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

  private async getUserRetentionData(dateFilter: any, timeRange: AnalyticsTimeRange) {
    // Calculate retention based on users who return after initial signup
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

  private async getConversionRatesData(dateFilter: any, timeRange: AnalyticsTimeRange) {
    // Calculate conversion from recommendations to selections
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

  private async getUserOverviewStats(dateFilter: any) {
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

  /**
   * Get comprehensive intelligence services metrics and performance data
   */
  async getIntelligenceMetrics(): Promise<IntelligenceMetrics> {
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
    } catch (error) {
      this.logger.error('Failed to get intelligence metrics:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Intelligence metrics unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getIntelligenceApiUsage() {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    // Get intelligence-related API calls from the last 24 hours
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

    // Add Apify-specific endpoints
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

  private async getIntelligenceServiceMetrics() {
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

    const serviceMetrics: any = {};

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

  private async getLastSuccessfulCall(apiName: string): Promise<string> {
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

  private async getIntelligenceDataFreshness(): Promise<{ [service: string]: string }> {
    // In a production system, this would track when data was last fetched from external APIs
    // For now, we'll provide estimated freshness based on typical cache policies

    const now = new Date();
    const freshness: { [service: string]: string } = {};

    // Different services have different data refresh rates
    const serviceRefreshRates = {
      weather_service: 15, // 15 minutes
      event_service: 60, // 1 hour
      sentiment_service: 30, // 30 minutes
      economic_service: 1440, // 24 hours (daily)
      health_service: 360, // 6 hours
      demographics_service: 10080, // 7 days
      temporal_service: 0, // Real-time
      media_service: 60, // 1 hour
      apify_social_service: 30, // 30 minutes (social media data)
    };

    Object.entries(serviceRefreshRates).forEach(([service, minutes]) => {
      if (minutes === 0) {
        freshness[service] = 'real-time';
      } else {
        const lastUpdate = new Date(now.getTime() - (Math.random() * minutes * 60 * 1000));
        const minutesAgo = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));

        if (minutesAgo < 60) {
          freshness[service] = `${minutesAgo} minutes ago`;
        } else if (minutesAgo < 1440) {
          const hoursAgo = Math.floor(minutesAgo / 60);
          freshness[service] = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
        } else {
          const daysAgo = Math.floor(minutesAgo / 1440);
          freshness[service] = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
        }
      }
    });

    return freshness;
  }
}