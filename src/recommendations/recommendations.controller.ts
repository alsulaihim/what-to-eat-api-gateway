import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { RecommendationsService } from './recommendations.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RecommendationRequestDto } from './dto/recommendation-request.dto';
import { RecommendationResponseDto } from './dto/recommendation-response.dto';

@ApiTags('recommendations')
@Controller('api/recommendations')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Get food recommendations',
    description: 'Generate personalized restaurant recommendations based on user preferences, location, and real-time data'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated recommendations',
    type: RecommendationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid Firebase token required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - external API issues',
  })
  async getRecommendations(
    @Body() recommendationRequest: RecommendationRequestDto,
    @Req() request: Request,
  ): Promise<RecommendationResponseDto> {
    const userId = (request as any).user?.uid;
    
    return this.recommendationsService.generateRecommendations(
      recommendationRequest,
      userId,
    );
  }

  @Post('batch')
  @ApiOperation({ 
    summary: 'Get multiple recommendation sets',
    description: 'Generate multiple sets of recommendations for different scenarios (e.g., breakfast, lunch, dinner)'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated batch recommendations',
    type: [RecommendationResponseDto],
  })
  async getBatchRecommendations(
    @Body() requests: RecommendationRequestDto[],
    @Req() request: Request,
  ): Promise<RecommendationResponseDto[]> {
    const userId = (request as any).user?.uid;
    
    return this.recommendationsService.generateBatchRecommendations(requests, userId);
  }

  @Get('history')
  @ApiOperation({ 
    summary: 'Get user recommendation history',
    description: 'Retrieve past recommendations for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved recommendation history',
    type: [RecommendationResponseDto],
  })
  async getRecommendationHistory(
    @Req() request: Request,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ): Promise<RecommendationResponseDto[]> {
    const userId = (request as any).user?.uid;
    
    return this.recommendationsService.getUserRecommendationHistory(
      userId,
      limit,
      offset,
    );
  }

  @Get('trending')
  @ApiOperation({ 
    summary: 'Get trending restaurants',
    description: 'Get currently trending restaurants based on social intelligence data'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved trending restaurants',
  })
  async getTrendingRestaurants(
    @Query('location') location: string,
    @Query('radius') radius: number = 5,
  ) {
    return this.recommendationsService.getTrendingRestaurants(location, radius);
  }
}

// Test controller without authentication for development testing
@Controller('test/recommendations')
export class TestRecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post('test')
  @ApiOperation({ 
    summary: 'Test recommendation engine without authentication',
    description: 'Development endpoint to test the recommendation system without Firebase authentication'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated test recommendations',
  })
  async testRecommendations(
    @Body() recommendationRequest: RecommendationRequestDto,
  ): Promise<RecommendationResponseDto> {
    // Use a test user ID for development testing
    const testUserId = 'test-user-123';
    
    return this.recommendationsService.generateRecommendations(
      recommendationRequest,
      testUserId,
    );
  }

  @Get('trending-test')
  @ApiOperation({ 
    summary: 'Test trending restaurants without authentication',
    description: 'Development endpoint to test trending restaurants without Firebase authentication'
  })
  async testTrendingRestaurants(
    @Query('location') location: string = 'New York, NY',
    @Query('radius') radius: number = 10,
  ) {
    return this.recommendationsService.getTrendingRestaurants(location, radius);
  }
}