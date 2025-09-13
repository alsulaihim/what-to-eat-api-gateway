import { Controller, Get, Post, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { WeatherIntelligenceService } from './weather/weather-intelligence.service';
import { EventIntelligenceService } from './events/event-intelligence.service';
import { SentimentAnalysisService } from './sentiment/sentiment-analysis.service';
import { EconomicIntelligenceService } from './economic/economic-intelligence.service';
import { HealthIntelligenceService } from './health/health-intelligence.service';
import { DemographicsService } from './demographics/demographics.service';
import { TemporalIntelligenceService } from './temporal/temporal-intelligence.service';
import { MediaIntelligenceService } from './media/media-intelligence.service';
import { IntelligenceService } from './intelligence.service';
import {
  WeatherIntelligence,
  EventIntelligence,
  SentimentIntelligence,
  EconomicIntelligence,
  HealthIntelligence,
  DemographicsIntelligence,
  TemporalIntelligence,
  MediaIntelligence,
  type ComprehensiveIntelligenceRequest,
  ComprehensiveIntelligenceResponse,
} from '../common/types/intelligence.types';

@ApiTags('intelligence')
@Controller('intelligence')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class IntelligenceController {
  constructor(
    private readonly weatherService: WeatherIntelligenceService,
    private readonly eventService: EventIntelligenceService,
    private readonly sentimentService: SentimentAnalysisService,
    private readonly economicService: EconomicIntelligenceService,
    private readonly healthService: HealthIntelligenceService,
    private readonly demographicsService: DemographicsService,
    private readonly temporalService: TemporalIntelligenceService,
    private readonly mediaService: MediaIntelligenceService,
    private readonly intelligenceService: IntelligenceService,
  ) {}

  @Get('weather-correlation')
  @ApiOperation({
    summary: 'Get weather-food correlation analysis',
    description: 'Analyzes weather conditions and their impact on food preferences and dining behavior',
  })
  @ApiResponse({
    status: 200,
    description: 'Weather intelligence data retrieved successfully',
    type: Object, // In production, create proper DTOs
  })
  async getWeatherCorrelation(
    @Query('location') location: string,
    @Req() request: any,
  ): Promise<WeatherIntelligence> {
    if (!location) {
      throw new Error('Location parameter is required');
    }
    return this.weatherService.getWeatherFoodCorrelation(location);
  }

  @Get('event-impact')
  @ApiOperation({
    summary: 'Get event impact analysis',
    description: 'Analyzes local events impact on restaurant demand and dining patterns',
  })
  @ApiResponse({
    status: 200,
    description: 'Event intelligence data retrieved successfully',
  })
  async getEventImpact(
    @Query('location') location: string,
    @Query('radius') radiusKm: string = '25',
    @Req() request: any,
  ): Promise<EventIntelligence> {
    if (!location) {
      throw new Error('Location parameter is required');
    }
    return this.eventService.getEventImpactAnalysis(location, parseInt(radiusKm, 10));
  }

  @Get('sentiment-analysis')
  @ApiOperation({
    summary: 'Get food sentiment analysis',
    description: 'Analyzes real-time sentiment around cuisines and food trends',
  })
  @ApiResponse({
    status: 200,
    description: 'Sentiment intelligence data retrieved successfully',
  })
  async getSentimentAnalysis(
    @Query('location') location: string,
    @Req() request: any,
  ): Promise<SentimentIntelligence> {
    if (!location) {
      throw new Error('Location parameter is required');
    }
    return this.sentimentService.analyzeFoodSentiment(location);
  }

  @Get('economic-impact')
  @ApiOperation({
    summary: 'Get economic impact analysis',
    description: 'Analyzes economic indicators and their effect on dining behavior',
  })
  @ApiResponse({
    status: 200,
    description: 'Economic intelligence data retrieved successfully',
  })
  async getEconomicImpact(@Req() request: any): Promise<EconomicIntelligence> {
    return this.economicService.analyzeEconomicImpact();
  }

  @Get('health-correlation')
  @ApiOperation({
    summary: 'Get health-food correlation analysis',
    description: 'Analyzes health trends and their correlation with nutritional recommendations',
  })
  @ApiResponse({
    status: 200,
    description: 'Health intelligence data retrieved successfully',
  })
  async getHealthCorrelation(
    @Query('location') location: string,
    @Req() request: any,
  ): Promise<HealthIntelligence> {
    if (!location) {
      throw new Error('Location parameter is required');
    }
    return this.healthService.analyzeHealthFoodCorrelation(location);
  }

  @Get('demographic-patterns')
  @ApiOperation({
    summary: 'Get demographic food patterns',
    description: 'Analyzes demographic data and cultural food preferences',
  })
  @ApiResponse({
    status: 200,
    description: 'Demographics intelligence data retrieved successfully',
  })
  async getDemographicPatterns(
    @Query('location') location: string,
    @Req() request: any,
  ): Promise<DemographicsIntelligence> {
    if (!location) {
      throw new Error('Location parameter is required');
    }
    return this.demographicsService.analyzeDemographicPatterns(location);
  }

  @Get('temporal-behavior')
  @ApiOperation({
    summary: 'Get temporal behavior analysis',
    description: 'Analyzes time-based patterns in food behavior and preferences',
  })
  @ApiResponse({
    status: 200,
    description: 'Temporal intelligence data retrieved successfully',
  })
  async getTemporalBehavior(
    @Query('timezone') timezone: string = 'America/New_York',
    @Req() request: any,
  ): Promise<TemporalIntelligence> {
    return this.temporalService.analyzeTemporalBehavior(timezone);
  }

  @Get('media-influence')
  @ApiOperation({
    summary: 'Get media influence analysis',
    description: 'Analyzes media trends and their influence on food preferences',
  })
  @ApiResponse({
    status: 200,
    description: 'Media intelligence data retrieved successfully',
  })
  async getMediaInfluence(
    @Query('location') location: string,
    @Req() request: any,
  ): Promise<MediaIntelligence> {
    if (!location) {
      throw new Error('Location parameter is required');
    }
    return this.mediaService.analyzeMediaInfluence(location);
  }

  @Post('comprehensive')
  @ApiOperation({
    summary: 'Get comprehensive intelligence analysis',
    description: 'Aggregates all intelligence layers for comprehensive food recommendation context',
  })
  @ApiResponse({
    status: 200,
    description: 'Comprehensive intelligence data retrieved successfully',
  })
  async getComprehensiveIntelligence(
    @Body() request: ComprehensiveIntelligenceRequest,
    @Req() req: any,
  ): Promise<ComprehensiveIntelligenceResponse> {
    if (!request.location) {
      throw new Error('Location is required');
    }
    if (!request.user_context) {
      throw new Error('User context is required');
    }
    return this.intelligenceService.getComprehensiveIntelligence(request);
  }
}