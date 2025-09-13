import { Controller, Get, Post, Body, Param, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ApifyService } from './apify.service';
import {
  ApifyFoodTrendRequest,
  ApifyTwitterMentionsRequest,
  ApifyRedditDiscussionsRequest,
  ApifyTikTokTrendsRequest,
  ApifyYouTubeReviewsRequest,
  ApifyFacebookPagesRequest,
  ApifyComprehensiveRequest,
  ApifyUsageMetricsResponse,
} from './dto/apify.dto';

@ApiTags('Apify Social Media Intelligence')
@Controller('api/apify')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class ApifyController {
  private readonly logger = new Logger(ApifyController.name);

  constructor(private readonly apifyService: ApifyService) {}

  @Post('instagram/food-trends')
  @ApiOperation({ summary: 'Analyze Instagram food trends via Apify scraping' })
  @ApiResponse({
    status: 200,
    description: 'Instagram food trends analyzed successfully',
  })
  async getInstagramFoodTrends(@Body() request: ApifyFoodTrendRequest) {
    try {
      this.logger.log(`Analyzing Instagram food trends for ${request.location}`);
      return await this.apifyService.scrapeInstagramFoodTrends(
        request.location,
        request.categories || []
      );
    } catch (error) {
      this.logger.error(`Instagram food trends failed: ${error.message}`);
      throw error;
    }
  }

  @Post('twitter/food-mentions')
  @ApiOperation({ summary: 'Analyze Twitter food mentions and sentiment via Apify' })
  @ApiResponse({
    status: 200,
    description: 'Twitter food mentions analyzed successfully',
  })
  async getTwitterFoodMentions(@Body() request: ApifyTwitterMentionsRequest) {
    try {
      this.logger.log(`Analyzing Twitter food mentions for ${request.location}`);
      return await this.apifyService.scrapeTwitterFoodMentions(
        request.location,
        request.categories || []
      );
    } catch (error) {
      this.logger.error(`Twitter food mentions failed: ${error.message}`);
      throw error;
    }
  }

  @Post('reddit/food-discussions')
  @ApiOperation({ summary: 'Scrape Reddit food discussions and community insights' })
  @ApiResponse({
    status: 200,
    description: 'Reddit food discussions analyzed successfully',
  })
  async getRedditFoodDiscussions(@Body() request: ApifyRedditDiscussionsRequest) {
    try {
      this.logger.log(`Analyzing Reddit food discussions for ${request.location}`);
      return await this.apifyService.scrapeRedditFoodDiscussions(
        request.location,
        request.categories || []
      );
    } catch (error) {
      this.logger.error(`Reddit food discussions failed: ${error.message}`);
      throw error;
    }
  }

  @Post('tiktok/viral-food-content')
  @ApiOperation({ summary: 'Analyze TikTok viral food content and trends' })
  @ApiResponse({
    status: 200,
    description: 'TikTok viral food content analyzed successfully',
  })
  async getTikTokViralFoodContent(@Body() request: ApifyTikTokTrendsRequest) {
    try {
      this.logger.log(`Analyzing TikTok viral food content for ${request.location}`);
      return await this.apifyService.scrapeTikTokFoodTrends(
        request.location,
        request.categories || []
      );
    } catch (error) {
      this.logger.error(`TikTok viral content analysis failed: ${error.message}`);
      throw error;
    }
  }

  @Post('youtube/food-reviews')
  @ApiOperation({ summary: 'Analyze YouTube food reviews and channel insights' })
  @ApiResponse({
    status: 200,
    description: 'YouTube food reviews analyzed successfully',
  })
  async getYouTubeFoodReviews(@Body() request: ApifyYouTubeReviewsRequest) {
    try {
      this.logger.log(`Analyzing YouTube food reviews for ${request.location}`);
      return await this.apifyService.scrapeYouTubeFoodReviews(
        request.location,
        request.categories || []
      );
    } catch (error) {
      this.logger.error(`YouTube food reviews analysis failed: ${error.message}`);
      throw error;
    }
  }

  @Post('facebook/food-pages')
  @ApiOperation({ summary: 'Scrape Facebook food pages and community activity' })
  @ApiResponse({
    status: 200,
    description: 'Facebook food pages analyzed successfully',
  })
  async getFacebookFoodPages(@Body() request: ApifyFacebookPagesRequest) {
    try {
      this.logger.log(`Analyzing Facebook food pages for ${request.location}`);
      return await this.apifyService.scrapeFacebookFoodPages(
        request.location,
        request.categories || []
      );
    } catch (error) {
      this.logger.error(`Facebook food pages analysis failed: ${error.message}`);
      throw error;
    }
  }

  @Get('scraping-status/:jobId')
  @ApiOperation({ summary: 'Check Apify scraping job status' })
  @ApiResponse({
    status: 200,
    description: 'Scraping job status retrieved successfully',
  })
  async getScrapingJobStatus(@Param('jobId') jobId: string) {
    try {
      this.logger.log(`Checking Apify job status: ${jobId}`);
      return await this.apifyService.getScrapingJobStatus(jobId);
    } catch (error) {
      this.logger.error(`Job status check failed: ${error.message}`);
      throw error;
    }
  }

  @Post('social-comprehensive')
  @ApiOperation({ summary: 'Comprehensive multi-platform social media intelligence analysis' })
  @ApiResponse({
    status: 200,
    description: 'Comprehensive social intelligence analyzed successfully',
  })
  async getComprehensiveSocialIntelligence(@Body() request: ApifyComprehensiveRequest) {
    try {
      this.logger.log(`Running comprehensive social intelligence for ${request.location}`);
      return await this.apifyService.orchestrateComprehensiveSocialIntelligence(
        request.location,
        request.categories || [],
        request.user_preferences || {}
      );
    } catch (error) {
      this.logger.error(`Comprehensive social intelligence failed: ${error.message}`);
      throw error;
    }
  }

  @Get('usage-metrics')
  @ApiOperation({ summary: 'Get Apify usage metrics and cost tracking' })
  @ApiResponse({
    status: 200,
    description: 'Usage metrics retrieved successfully',
    type: ApifyUsageMetricsResponse,
  })
  async getUsageMetrics(): Promise<ApifyUsageMetricsResponse> {
    try {
      this.logger.log('Retrieving Apify usage metrics');
      return await this.apifyService.getUsageMetrics();
    } catch (error) {
      this.logger.error(`Usage metrics retrieval failed: ${error.message}`);
      throw error;
    }
  }

  @Post('cost-estimation')
  @ApiOperation({ summary: 'Estimate cost for Apify scraping operation' })
  @ApiResponse({
    status: 200,
    description: 'Cost estimation completed successfully',
  })
  async estimateScrapingCost(@Body() request: { platform: string; data_size: number }) {
    try {
      this.logger.log(`Estimating cost for ${request.platform} scraping`);
      return await this.apifyService.estimateScrapingCost(request.platform, request.data_size);
    } catch (error) {
      this.logger.error(`Cost estimation failed: ${error.message}`);
      throw error;
    }
  }

  @Post('optimize-usage')
  @ApiOperation({ summary: 'Get optimization suggestions for Apify usage' })
  @ApiResponse({
    status: 200,
    description: 'Optimization suggestions generated successfully',
  })
  async getUsageOptimizationSuggestions(@Body() request: { current_usage: any }) {
    try {
      this.logger.log('Generating Apify usage optimization suggestions');
      return await this.apifyService.generateOptimizationSuggestions(request.current_usage);
    } catch (error) {
      this.logger.error(`Optimization suggestions failed: ${error.message}`);
      throw error;
    }
  }
}