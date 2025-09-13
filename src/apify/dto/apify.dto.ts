import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApifyFoodTrendRequest {
  @ApiProperty({
    description: 'Location to analyze food trends for',
    example: 'San Francisco, CA',
  })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({
    description: 'Food categories to focus on',
    example: ['italian', 'asian', 'pizza'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  categories?: string[];
}

export class ApifyTwitterMentionsRequest {
  @ApiProperty({
    description: 'Location to analyze Twitter mentions for',
    example: 'New York, NY',
  })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({
    description: 'Food categories to focus on',
    example: ['burger', 'sushi', 'pizza'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  categories?: string[];
}

export class ApifyRedditDiscussionsRequest {
  @ApiProperty({
    description: 'Location to analyze Reddit discussions for',
    example: 'Chicago, IL',
  })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({
    description: 'Food categories to focus on',
    example: ['deep dish', 'hot dogs', 'italian beef'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  categories?: string[];
}

export class ApifyTikTokTrendsRequest {
  @ApiProperty({
    description: 'Location to analyze TikTok trends for',
    example: 'Los Angeles, CA',
  })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({
    description: 'Food categories to focus on',
    example: ['mexican', 'korean', 'vegan'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  categories?: string[];
}

export class ApifyYouTubeReviewsRequest {
  @ApiProperty({
    description: 'Location to analyze YouTube reviews for',
    example: 'Miami, FL',
  })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({
    description: 'Food categories to focus on',
    example: ['cuban', 'seafood', 'latin'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  categories?: string[];
}

export class ApifyFacebookPagesRequest {
  @ApiProperty({
    description: 'Location to analyze Facebook pages for',
    example: 'Seattle, WA',
  })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({
    description: 'Food categories to focus on',
    example: ['coffee', 'seafood', 'farm to table'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  categories?: string[];
}

export class ApifyComprehensiveRequest {
  @ApiProperty({
    description: 'Location for comprehensive social intelligence analysis',
    example: 'Austin, TX',
  })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({
    description: 'Food categories to focus on',
    example: ['bbq', 'tacos', 'food trucks'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  categories?: string[];

  @ApiProperty({
    description: 'User preferences for personalized analysis',
    example: {
      dietary_restrictions: ['vegetarian'],
      budget: '$$',
      group_size: 2,
      mode: 'dine-out'
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  user_preferences?: {
    dietary_restrictions?: string[];
    budget?: string;
    group_size?: number;
    mode?: string;
    preferences?: string[];
  };
}

export class ApifyUsageMetricsResponse {
  @ApiProperty({
    description: 'Current Apify usage in units',
    example: 1250,
  })
  current_usage!: number;

  @ApiProperty({
    description: 'Daily budget limit in USD',
    example: 15,
  })
  daily_limit!: number;

  @ApiProperty({
    description: 'Remaining budget for today',
    example: 8.75,
  })
  remaining_budget!: number;

  @ApiProperty({
    description: 'Success rate of scraping operations',
    example: 0.95,
  })
  success_rate!: number;

  @ApiProperty({
    description: 'Average response time in milliseconds',
    example: 25000,
  })
  average_response_time!: number;

  @ApiProperty({
    description: 'Cost breakdown by platform',
    example: {
      instagram: 45.60,
      twitter: 65.80,
      reddit: 15.25,
      tiktok: 35.50,
      youtube: 20.30,
      facebook: 15.25
    },
  })
  platform_costs!: {
    instagram: number;
    twitter: number;
    reddit: number;
    tiktok: number;
    youtube: number;
    facebook: number;
  };

  @ApiProperty({
    description: 'Optimization suggestions',
    example: [
      'Enable intelligent caching for 15-30 minutes',
      'Focus scraping on peak engagement hours',
      'Use geo-targeting to reduce irrelevant content'
    ],
  })
  optimization_suggestions!: string[];

  @ApiProperty({
    description: 'Total monthly estimated cost',
    example: 450,
  })
  estimated_monthly_cost!: number;
}

export class ApifyJobStatusResponse {
  @ApiProperty({
    description: 'Current status of the scraping job',
    example: 'RUNNING',
  })
  status!: string;

  @ApiProperty({
    description: 'Job ID',
    example: 'abc123def456',
  })
  job_id!: string;

  @ApiProperty({
    description: 'Progress percentage',
    example: 75,
  })
  progress!: number;

  @ApiProperty({
    description: 'Items processed so far',
    example: 150,
  })
  items_processed!: number;

  @ApiProperty({
    description: 'Estimated time remaining in seconds',
    example: 180,
  })
  estimated_time_remaining!: number;

  @ApiProperty({
    description: 'Error message if job failed',
    required: false,
  })
  error_message?: string;
}

export class ApifyCostEstimationRequest {
  @ApiProperty({
    description: 'Platform to estimate cost for',
    example: 'instagram',
  })
  @IsString()
  @IsNotEmpty()
  platform!: string;

  @ApiProperty({
    description: 'Expected data size to scrape',
    example: 500,
  })
  @IsNumber()
  data_size!: number;
}

export class ApifyCostEstimationResponse {
  @ApiProperty({
    description: 'Estimated Apify units to consume',
    example: 12.5,
  })
  estimated_units!: number;

  @ApiProperty({
    description: 'Estimated cost in USD',
    example: 0.31,
  })
  estimated_cost_usd!: number;

  @ApiProperty({
    description: 'Whether this fits within daily budget',
    example: true,
  })
  fits_daily_budget!: boolean;

  @ApiProperty({
    description: 'Time to complete estimation in minutes',
    example: 4.5,
  })
  estimated_completion_time!: number;
}

export class ApifyOptimizationSuggestion {
  @ApiProperty({
    description: 'Type of optimization',
    example: 'caching',
  })
  type!: string;

  @ApiProperty({
    description: 'Description of the optimization',
    example: 'Enable intelligent caching for 15-30 minutes to reduce redundant scraping',
  })
  description!: string;

  @ApiProperty({
    description: 'Potential cost savings percentage',
    example: 25,
  })
  potential_savings!: number;

  @ApiProperty({
    description: 'Implementation difficulty',
    example: 'easy',
  })
  difficulty!: string;
}

export class ApifyOptimizationResponse {
  @ApiProperty({
    description: 'List of optimization suggestions',
    type: [ApifyOptimizationSuggestion],
  })
  suggestions!: ApifyOptimizationSuggestion[];

  @ApiProperty({
    description: 'Current efficiency score',
    example: 0.78,
  })
  current_efficiency!: number;

  @ApiProperty({
    description: 'Potential efficiency with optimizations',
    example: 0.92,
  })
  potential_efficiency!: number;

  @ApiProperty({
    description: 'Total potential monthly savings in USD',
    example: 125.50,
  })
  total_potential_savings!: number;
}