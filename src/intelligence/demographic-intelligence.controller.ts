import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DemographicIntelligenceService } from './demographic-intelligence.service';
import {
  DemographicIntelligenceRequestDto,
  DemographicIntelligenceResponseDto,
  UserSimilarityRequestDto,
  UserSimilarityResponseDto
} from './dto/demographic-intelligence.dto';
import {
  DemographicIntelligenceRequest,
  UserSimilarityMatch
} from '../common/types/demographic.types';

@ApiTags('Demographic Intelligence')
@Controller('intelligence/demographics')
export class DemographicIntelligenceController {
  constructor(
    private readonly demographicIntelligenceService: DemographicIntelligenceService
  ) {}

  @Post('analyze')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get demographic intelligence analysis',
    description: 'Analyze user demographics to provide personalized restaurant recommendations based on similar users and cultural preferences'
  })
  @ApiBody({ type: DemographicIntelligenceRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Demographic intelligence analysis completed successfully',
    type: DemographicIntelligenceResponseDto
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request parameters'
  })
  async analyzeDemographics(
    @Request() req: any,
    @Body() request: DemographicIntelligenceRequestDto
  ): Promise<DemographicIntelligenceResponseDto> {
    const intelligenceRequest: DemographicIntelligenceRequest = {
      userDemographics: {
        nationality: request.userDemographics.nationality,
        ageGroup: request.userDemographics.ageGroup,
        gender: request.userDemographics.gender,
        culturalBackground: request.userDemographics.culturalBackground,
        spiceToleranceLevel: request.userDemographics.spiceToleranceLevel,
        authenticityPreference: request.userDemographics.authenticityPreference,
        languagePreference: request.userDemographics.languagePreference,
        incomeBracket: request.userDemographics.incomeBracket,
        religiousDietaryRequirements: request.userDemographics.religiousDietaryRequirements,
        familyStructure: request.userDemographics.familyStructure,
        occupationCategory: request.userDemographics.occupationCategory,
        livingArea: request.userDemographics.livingArea
      },
      targetLocation: request.targetLocation,
      cuisineTypes: request.cuisineTypes,
      priceRange: request.priceRange,
      diningMode: request.diningMode
    };

    return this.demographicIntelligenceService.getDemographicIntelligence(intelligenceRequest);
  }

  @Post('similarity')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Find similar users based on demographics',
    description: 'Find users with similar demographic profiles for collaborative filtering recommendations'
  })
  @ApiBody({ type: UserSimilarityRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Similar users found successfully',
    type: UserSimilarityResponseDto
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found'
  })
  async findSimilarUsers(
    @Request() req: any,
    @Body() request: UserSimilarityRequestDto
  ): Promise<UserSimilarityResponseDto> {
    try {
      // For now, return a placeholder implementation
      // In a full implementation, this would use the demographic intelligence service
      // to find similar users and calculate similarity scores

      return {
        success: true,
        data: [
          {
            userId: 'user123',
            similarityScore: {
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
            sharedPreferences: ['italian_cuisine', 'medium_spice', 'family_dining'],
            recommendationHistory: {
              sharedRestaurants: ['Olive Garden', 'Taco Bell'],
              similarRatings: 0.7
            }
          }
        ]
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @Get('insights/:userId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get demographic insights for a user',
    description: 'Get cultural context and demographic insights for personalized recommendations'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Demographic insights retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            culturalContext: { type: 'string' },
            dietaryConsiderations: { type: 'array', items: { type: 'string' } },
            socialTrends: { type: 'array', items: { type: 'string' } },
            recommendationFactors: {
              type: 'object',
              properties: {
                cuisineBoosts: { type: 'array', items: { type: 'string' } },
                priceAdjustment: { type: 'number' },
                authenticityPreference: { type: 'number' },
                spiceToleranceLevel: { type: 'number' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found'
  })
  async getUserDemographicInsights(
    @Request() req: any,
    @Param('userId') userId: string
  ): Promise<any> {
    try {
      // Placeholder implementation
      // In a full implementation, this would retrieve user demographics from database
      // and generate insights using the demographic intelligence service

      return {
        success: true,
        data: {
          culturalContext: 'Diverse cultural preferences with emphasis on authentic cuisines',
          dietaryConsiderations: ['Moderate spice tolerance', 'Open to international cuisines'],
          socialTrends: ['Weekend brunch', 'Craft cocktails', 'Instagram-worthy presentation'],
          recommendationFactors: {
            cuisineBoosts: ['italian', 'mexican', 'asian'],
            priceAdjustment: 0.0,
            authenticityPreference: 0.7,
            spiceToleranceLevel: 6
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @Get('trends')
  @ApiOperation({
    summary: 'Get demographic-based dining trends',
    description: 'Get current dining trends filtered by demographic segments'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Demographic trends retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            trendsByAge: { type: 'object' },
            trendsByCulture: { type: 'object' },
            trendsByLocation: { type: 'object' },
            emergingTrends: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  })
  async getDemographicTrends(
    @Query('ageGroup') ageGroup?: string,
    @Query('culturalBackground') culturalBackground?: string,
    @Query('location') location?: string
  ): Promise<any> {
    try {
      // Placeholder implementation
      // In a full implementation, this would analyze demographic trends from social media
      // and user behavior data

      return {
        success: true,
        data: {
          trendsByAge: {
            '18-24': ['bubble tea', 'korean bbq', 'ramen', 'acai bowls'],
            '25-34': ['craft cocktails', 'farm-to-table', 'fusion cuisine', 'food trucks'],
            '35-44': ['family restaurants', 'wine bars', 'mediterranean', 'healthy options'],
            '45-54': ['steakhouses', 'italian', 'seafood', 'fine dining'],
            '55+': ['classic american', 'continental', 'comfort food', 'early dining']
          },
          trendsByCulture: {
            asian: ['authentic regional cuisines', 'hot pot', 'dim sum', 'boba tea'],
            hispanic_latino: ['street food', 'authentic tacos', 'ceviche', 'craft mezcal'],
            middle_eastern: ['halal options', 'mediterranean', 'kebabs', 'hookah lounges']
          },
          trendsByLocation: {
            urban: ['food halls', 'rooftop dining', 'pop-up restaurants', 'late night eats'],
            suburban: ['chain restaurants', 'family dining', 'sports bars', 'delivery'],
            rural: ['local favorites', 'comfort food', 'diners', 'bbq']
          },
          emergingTrends: [
            'plant-based meat alternatives',
            'ghost kitchens',
            'contactless dining',
            'hyper-local ingredients',
            'cultural fusion'
          ]
        }
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}