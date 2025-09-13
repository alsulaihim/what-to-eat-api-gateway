import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RecommendationMode {
  DELIVERY = 'delivery',
  DINE_OUT = 'dine_out',
}

export enum BudgetRange {
  LOW = '$',        // $
  MEDIUM = '$$',    // $$
  HIGH = '$$$',     // $$$
  PREMIUM = '$$$$'  // $$$$
}

export class RecommendationRequestDto {
  @ApiProperty({ 
    description: 'Mode of dining (delivery or dine out)', 
    enum: RecommendationMode,
    example: RecommendationMode.DINE_OUT 
  })
  @IsOptional()
  @IsEnum(RecommendationMode)
  mode?: RecommendationMode;

  @ApiProperty({ 
    description: 'Number of people in the party', 
    minimum: 1, 
    maximum: 20,
    example: 2 
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  partySize?: number;

  @ApiProperty({ 
    description: 'Budget range preference', 
    enum: BudgetRange,
    example: BudgetRange.MEDIUM 
  })
  @IsOptional()
  @IsEnum(BudgetRange)
  budget?: BudgetRange;

  @ApiPropertyOptional({ 
    description: 'User location (address or coordinates)', 
    example: 'New York, NY' 
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ 
    description: 'Latitude coordinate', 
    example: 40.7128 
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ 
    description: 'Longitude coordinate', 
    example: -74.0060 
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ 
    description: 'Preferred cuisine types', 
    type: [String],
    example: ['italian', 'mexican', 'asian'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuisinePreferences?: string[];

  @ApiPropertyOptional({ 
    description: 'Dietary restrictions', 
    type: [String],
    example: ['vegetarian', 'gluten-free'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions?: string[];

  @ApiPropertyOptional({ 
    description: 'Maximum distance in miles (for dine out)', 
    minimum: 0.1, 
    maximum: 50,
    example: 5 
  })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(50)
  maxDistance?: number;

  @ApiPropertyOptional({ 
    description: 'Include trending/popular places', 
    example: true 
  })
  @IsOptional()
  includeTrending?: boolean;
}