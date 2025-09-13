import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  DemographicIntelligenceSimpleService,
  DemographicData,
  DemographicIntelligenceRequest,
  DemographicIntelligenceResponse
} from './demographic-intelligence-simple.service';

// Simple DTOs defined inline
class DemographicDataDto implements DemographicData {
  @ApiProperty({ example: 'US', required: false })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({ example: '25-34', required: false })
  @IsOptional()
  @IsString()
  ageGroup?: string;

  @ApiProperty({ example: 'asian', required: false })
  @IsOptional()
  @IsString()
  culturalBackground?: string;

  @ApiProperty({ example: 7, required: false })
  @IsOptional()
  @IsNumber()
  spiceToleranceLevel?: number;

  @ApiProperty({ example: 8, required: false })
  @IsOptional()
  @IsNumber()
  authenticityPreference?: number;
}

class DemographicIntelligenceRequestDto implements DemographicIntelligenceRequest {
  @ApiProperty({ type: DemographicDataDto })
  @ValidateNested()
  @Type(() => DemographicDataDto)
  userDemographics!: DemographicDataDto;

  @ApiProperty({ example: 'San Francisco' })
  @IsString()
  targetLocation!: string;
}

@ApiTags('Intelligence - Demographics')
@Controller('api/intelligence/demographics')
export class DemographicIntelligenceSimpleController {
  constructor(
    private readonly demographicIntelligenceService: DemographicIntelligenceSimpleService
  ) {}

  @Post('analyze')
  @ApiOperation({
    summary: 'Generate demographic intelligence analysis',
    description: 'Analyze user demographics to generate personalized food recommendations and insights'
  })
  @ApiResponse({ status: 200, description: 'Demographic intelligence analysis completed' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async analyzeDemographics(
    @Body() request: DemographicIntelligenceRequestDto
  ): Promise<DemographicIntelligenceResponse> {
    return this.demographicIntelligenceService.getDemographicIntelligence(request);
  }
}