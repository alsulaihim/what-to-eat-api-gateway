import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAlgorithmWeightsDto {
  @ApiProperty({
    description: 'Weight for social signals (0.0 to 1.0)',
    example: 0.4,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  socialWeight?: number;

  @ApiProperty({
    description: 'Weight for personal preferences (0.0 to 1.0)',
    example: 0.35,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  personalWeight?: number;

  @ApiProperty({
    description: 'Weight for contextual factors (0.0 to 1.0)',
    example: 0.15,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  contextualWeight?: number;

  @ApiProperty({
    description: 'Weight for trending factors (0.0 to 1.0)',
    example: 0.1,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  trendsWeight?: number;

  @ApiProperty({
    description: 'Admin user ID making the update',
    example: 'admin-user-123',
  })
  @IsString()
  @IsOptional()
  updatedBy?: string;
}