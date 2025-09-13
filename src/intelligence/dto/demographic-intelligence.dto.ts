import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber, Min, Max, IsIn } from 'class-validator';
import { DemographicDataDto } from '../../users/dto/user-profile.dto';

export class DemographicIntelligenceRequestDto {
  @ApiProperty({
    description: 'User demographic data for similarity matching',
    type: DemographicDataDto,
  })
  userDemographics!: DemographicDataDto;

  @ApiProperty({
    description: 'Target location for recommendations',
    example: 'New York, NY',
  })
  @IsString()
  targetLocation!: string;

  @ApiPropertyOptional({
    description: 'Preferred cuisine types',
    example: ['italian', 'mexican', 'asian'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuisineTypes?: string[];

  @ApiPropertyOptional({
    description: 'Price range preference',
    example: 'medium',
    enum: ['low', 'medium', 'high'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['low', 'medium', 'high'])
  priceRange?: string;

  @ApiPropertyOptional({
    description: 'Dining mode preference',
    example: 'dine_out',
    enum: ['dine_out', 'takeout', 'delivery'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['dine_out', 'takeout', 'delivery'])
  diningMode?: string;
}

export class SimilarUserDto {
  @ApiProperty({
    description: 'Number of similar users found',
    example: 25,
  })
  count!: number;

  @ApiProperty({
    description: 'Demographic data of similar users',
    type: [DemographicDataDto],
  })
  demographics!: DemographicDataDto[];

  @ApiProperty({
    description: 'Common preferences among similar users',
    example: {
      topCuisines: [
        { name: 'italian', popularity: 0.8 },
        { name: 'mexican', popularity: 0.6 }
      ],
      avgSpiceTolerance: 6.5,
      avgAuthenticityPreference: 7.2,
      commonDietaryRestrictions: ['vegetarian', 'gluten-free']
    },
  })
  commonPreferences!: {
    topCuisines: Array<{ name: string; popularity: number }>;
    avgSpiceTolerance: number;
    avgAuthenticityPreference: number;
    commonDietaryRestrictions: string[];
  };
}

export class DemographicRecommendationsDto {
  @ApiProperty({
    description: 'Cuisine type boosts based on demographics',
    example: [
      { cuisine: 'italian', boost: 0.2, reason: 'Cultural preference' },
      { cuisine: 'mexican', boost: 0.15, reason: 'Similar user preferences' }
    ],
  })
  cuisineBoosts!: Array<{ cuisine: string; boost: number; reason: string }>;

  @ApiProperty({
    description: 'Price adjustment factor (-1.0 to 1.0)',
    example: 0.1,
  })
  priceAdjustment!: number;

  @ApiProperty({
    description: 'Authenticity preference factor (0.0 to 1.0)',
    example: 0.8,
  })
  authenticityFactor!: number;

  @ApiProperty({
    description: 'Recommended spice level (1-10 scale)',
    example: 7,
  })
  spiceLevelRecommendation!: number;

  @ApiProperty({
    description: 'Restaurants with cultural relevance',
    example: [
      { restaurant: 'Authentic Thai Kitchen', culturalRelevance: 0.9 },
      { restaurant: 'Little Italy Bistro', culturalRelevance: 0.7 }
    ],
  })
  culturalMatches!: Array<{ restaurant: string; culturalRelevance: number }>;
}

export class DemographicInsightsDto {
  @ApiProperty({
    description: 'Cultural context explanation',
    example: 'Strong preference for authentic Asian cuisines with emphasis on fresh ingredients',
  })
  culturalContext!: string;

  @ApiProperty({
    description: 'Dietary considerations based on demographics',
    example: ['Halal certification required', 'High spice tolerance'],
    type: [String],
  })
  dietaryConsiderations!: string[];

  @ApiProperty({
    description: 'Social trends relevant to user demographics',
    example: ['Instagram-worthy presentation', 'Craft cocktails', 'Weekend brunch'],
    type: [String],
  })
  socialTrends!: string[];

  @ApiProperty({
    description: 'Confidence score of the analysis (0.0 to 1.0)',
    example: 0.85,
  })
  confidenceScore!: number;
}

export class DemographicIntelligenceResponseDto {
  @ApiProperty({
    description: 'Whether the request was successful',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Demographic intelligence data',
    type: Object,
  })
  data!: {
    similarUsers: SimilarUserDto;
    recommendations: DemographicRecommendationsDto;
    insights: DemographicInsightsDto;
  };

  @ApiPropertyOptional({
    description: 'Error message if request failed',
    example: 'Insufficient demographic data for analysis',
  })
  error?: string;
}

export class UserSimilarityRequestDto {
  @ApiProperty({
    description: 'Current user ID',
    example: 'clm123456789',
  })
  @IsString()
  userId!: string;

  @ApiPropertyOptional({
    description: 'Maximum number of similar users to return',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Minimum similarity score threshold (0.0 to 1.0)',
    example: 0.5,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  minSimilarityScore?: number;
}

export class UserSimilarityDto {
  @ApiProperty({
    description: 'Similar user ID',
    example: 'clm987654321',
  })
  userId!: string;

  @ApiProperty({
    description: 'Similarity score breakdown',
    example: {
      overallScore: 0.85,
      categoryScores: {
        cultural: 0.9,
        dietary: 0.8,
        lifestyle: 0.85,
        preferences: 0.8
      },
      matchingFactors: ['nationality', 'cultural_background', 'age_group'],
      recommendationAdjustments: {
        cuisineBoost: ['italian', 'mexican'],
        priceAdjustment: 0.1,
        authenticityFactor: 0.8,
        spiceLevelAdjustment: 7
      }
    },
  })
  similarityScore!: {
    overallScore: number;
    categoryScores: {
      cultural: number;
      dietary: number;
      lifestyle: number;
      preferences: number;
    };
    matchingFactors: string[];
    recommendationAdjustments: {
      cuisineBoost?: string[];
      priceAdjustment?: number;
      authenticityFactor?: number;
      spiceLevelAdjustment?: number;
    };
  };

  @ApiProperty({
    description: 'Shared preferences between users',
    example: ['italian_cuisine', 'medium_spice', 'family_dining'],
    type: [String],
  })
  sharedPreferences!: string[];

  @ApiProperty({
    description: 'Recommendation history analysis',
    example: {
      sharedRestaurants: ['Olive Garden', 'Taco Bell'],
      similarRatings: 0.7
    },
  })
  recommendationHistory!: {
    sharedRestaurants: string[];
    similarRatings: number;
  };
}

export class UserSimilarityResponseDto {
  @ApiProperty({
    description: 'Whether the request was successful',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Array of similar users',
    type: [UserSimilarityDto],
  })
  data!: UserSimilarityDto[];

  @ApiPropertyOptional({
    description: 'Error message if request failed',
    example: 'User not found',
  })
  error?: string;
}