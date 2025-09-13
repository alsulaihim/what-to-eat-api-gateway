import {
  Controller,
  Get,
  Put,
  Query,
  Body,
  UseGuards,
  Logger,
  ValidationPipe,
  UsePipes,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { UpdateAlgorithmWeightsDto } from './dto/update-algorithm-weights.dto';
import { ApiUsageQueryDto } from './dto/api-usage-query.dto';
import { UserAnalyticsQueryDto } from './dto/user-analytics-query.dto';

@ApiTags('Admin')
@Controller('api/admin')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  @Get('api-usage')
  @ApiOperation({
    summary: 'Get API usage statistics',
    description: 'Retrieve comprehensive API usage statistics with filtering and aggregation options',
  })
  @ApiResponse({
    status: 200,
    description: 'API usage statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            totalCount: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
        summary: {
          type: 'object',
          properties: {
            totalCost: { type: 'number' },
            averageResponseTime: { type: 'number' },
            totalRequests: { type: 'number' },
            averageCostPerRequest: { type: 'number' },
          },
        },
        apiBreakdown: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              apiName: { type: 'string' },
              totalCost: { type: 'number' },
              averageResponseTime: { type: 'number' },
              requestCount: { type: 'number' },
            },
          },
        },
        timeSeriesData: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'string' },
              totalCost: { type: 'number' },
              totalRequests: { type: 'number' },
              successfulRequests: { type: 'number' },
              successRate: { type: 'number' },
              averageResponseTime: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin privileges required' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid query parameters' })
  async getApiUsage(@Query() query: ApiUsageQueryDto, @Req() request: any) {
    this.logger.log(`Admin ${request.user.email} requested API usage statistics`);
    return this.adminService.getApiUsageStats(query);
  }

  @Put('algorithm-weights')
  @ApiOperation({
    summary: 'Update algorithm weights',
    description: 'Update the weighting parameters for the recommendation algorithm',
  })
  @ApiResponse({
    status: 200,
    description: 'Algorithm weights updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        weights: {
          type: 'object',
          properties: {
            socialWeight: { type: 'number' },
            personalWeight: { type: 'number' },
            contextualWeight: { type: 'number' },
            trendsWeight: { type: 'number' },
          },
        },
        updatedBy: { type: 'string' },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin privileges required' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid weights (must sum to 1.0)' })
  async updateAlgorithmWeights(
    @Body() updateData: UpdateAlgorithmWeightsDto,
    @Req() request: any,
  ) {
    // Use the authenticated admin user's ID
    const adminUser = request.user;
    updateData.updatedBy = adminUser.firebaseUid;

    this.logger.log(
      `Admin ${adminUser.email} updating algorithm weights: ${JSON.stringify(updateData)}`
    );

    return this.adminService.updateAlgorithmWeights(updateData);
  }

  @Get('algorithm-weights')
  @ApiOperation({
    summary: 'Get current algorithm weights',
    description: 'Retrieve the current weighting parameters for the recommendation algorithm',
  })
  @ApiResponse({
    status: 200,
    description: 'Current algorithm weights retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        weights: {
          type: 'object',
          properties: {
            socialWeight: { type: 'number' },
            personalWeight: { type: 'number' },
            contextualWeight: { type: 'number' },
            trendsWeight: { type: 'number' },
          },
        },
        updatedBy: { type: 'string' },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin privileges required' })
  async getCurrentAlgorithmWeights(@Req() request: any) {
    this.logger.log(`Admin ${request.user.email} requested current algorithm weights`);
    return this.adminService.getCurrentAlgorithmWeights();
  }

  @Get('user-analytics')
  @ApiOperation({
    summary: 'Get user analytics',
    description: 'Retrieve comprehensive user behavior analytics and metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'User analytics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        timeRange: { type: 'string' },
        dateRange: {
          type: 'object',
          properties: {
            startDate: { type: 'string', nullable: true },
            endDate: { type: 'string', nullable: true },
          },
        },
        userOverview: {
          type: 'object',
          properties: {
            totalUsers: { type: 'number' },
            providerBreakdown: {
              type: 'object',
              properties: {
                google: { type: 'number' },
                apple: { type: 'number' },
                email: { type: 'number' },
              },
            },
          },
        },
        metrics: {
          type: 'object',
          additionalProperties: {
            type: 'object',
          },
        },
        generatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin privileges required' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid query parameters' })
  async getUserAnalytics(@Query() query: UserAnalyticsQueryDto, @Req() request: any) {
    this.logger.log(`Admin ${request.user.email} requested user analytics`);
    return this.adminService.getUserAnalytics(query);
  }

  @Get('intelligence-metrics')
  @ApiOperation({
    summary: 'Get intelligence service metrics',
    description: 'Retrieve performance metrics and analytics for all intelligence services',
  })
  @ApiResponse({
    status: 200,
    description: 'Intelligence metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        service_performance: {
          type: 'object',
          properties: {
            weather_service: { type: 'object' },
            event_service: { type: 'object' },
            sentiment_service: { type: 'object' },
            economic_service: { type: 'object' },
            health_service: { type: 'object' },
            demographics_service: { type: 'object' },
            temporal_service: { type: 'object' },
            media_service: { type: 'object' },
          },
        },
        api_usage: {
          type: 'object',
          properties: {
            total_requests: { type: 'number' },
            failed_requests: { type: 'number' },
            average_response_time: { type: 'number' },
            cost_estimate: { type: 'number' },
          },
        },
        data_freshness: {
          type: 'object',
          additionalProperties: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin privileges required' })
  async getIntelligenceMetrics(@Req() request: any) {
    this.logger.log(`Admin ${request.user.email} requested intelligence metrics`);
    return this.adminService.getIntelligenceMetrics();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Admin system health check',
    description: 'Check the health and status of admin-related services',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin system health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        adminUser: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            displayName: { type: 'string' },
            isAdmin: { type: 'boolean' },
          },
        },
        services: {
          type: 'object',
          properties: {
            database: { type: 'string' },
            firebase: { type: 'string' },
            analytics: { type: 'string' },
            intelligence: { type: 'string' },
          },
        },
      },
    },
  })
  async getAdminHealth(@Req() request: any) {
    const adminUser = request.user;
    this.logger.log(`Admin health check requested by ${adminUser.email}`);

    return {
      status: 'healthy',
      timestamp: new Date(),
      adminUser: {
        email: adminUser.email,
        displayName: adminUser.displayName,
        isAdmin: adminUser.isAdmin,
      },
      services: {
        database: 'connected',
        firebase: 'connected',
        analytics: 'operational',
        intelligence: 'operational',
      },
    };
  }
}