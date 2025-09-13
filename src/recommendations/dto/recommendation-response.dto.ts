import { ApiProperty } from '@nestjs/swagger';

export class RestaurantRecommendationDto {
  @ApiProperty({ description: 'Unique identifier for the restaurant' })
  id?: string;

  @ApiProperty({ description: 'Restaurant name' })
  name?: string;

  @ApiProperty({ description: 'Restaurant address' })
  address?: string;

  @ApiProperty({ description: 'Restaurant rating (1-5)', minimum: 1, maximum: 5 })
  rating?: number;

  @ApiProperty({ description: 'Price level ($, $$, $$$, $$$$)' })
  priceLevel?: string;

  @ApiProperty({ description: 'Cuisine type(s)', type: [String] })
  cuisineTypes?: string[];

  @ApiProperty({ description: 'Distance from user location in miles' })
  distance?: number;

  @ApiProperty({ description: 'Confidence score (0-100)', minimum: 0, maximum: 100 })
  confidenceScore?: number;

  @ApiProperty({ description: 'Reason for recommendation' })
  recommendationReason?: string;

  @ApiProperty({ description: 'Whether this place is currently trending' })
  isTrending?: boolean;

  @ApiProperty({ description: 'Estimated wait time in minutes', required: false })
  estimatedWaitTime?: number;

  @ApiProperty({ description: 'Restaurant phone number', required: false })
  phoneNumber?: string;

  @ApiProperty({ description: 'Restaurant website URL', required: false })
  website?: string;

  @ApiProperty({ description: 'Operating hours for today', required: false })
  hoursToday?: string;

  @ApiProperty({ description: 'Popular dishes at this restaurant', type: [String], required: false })
  popularDishes?: string[];

  @ApiProperty({ description: 'Social intelligence insights', required: false })
  socialInsights?: {
    recentOrderTrends: string;
    popularTimes: string;
    crowdLevel: 'low' | 'medium' | 'high';
  };
}

export class RecommendationResponseDto {
  @ApiProperty({ description: 'List of restaurant recommendations', type: [RestaurantRecommendationDto] })
  recommendations?: RestaurantRecommendationDto[];

  @ApiProperty({ description: 'Total number of recommendations returned' })
  totalResults?: number;

  @ApiProperty({ description: 'Search location used for recommendations' })
  searchLocation?: string;

  @ApiProperty({ description: 'Search radius used in miles' })
  searchRadius?: number;

  @ApiProperty({ description: 'Overall search confidence (0-100)', minimum: 0, maximum: 100 })
  overallConfidence?: number;

  @ApiProperty({ description: 'AI-generated summary of recommendations' })
  aiSummary?: string;

  @ApiProperty({ description: 'Social trends affecting recommendations', required: false })
  socialTrends?: {
    trendingCuisines: string[];
    popularMealTimes: string[];
    localEvents: string[];
  };

  @ApiProperty({ description: 'Timestamp of recommendation generation' })
  timestamp?: Date;

  @ApiProperty({ description: 'Recommendation request ID for tracking' })
  requestId?: string;
}