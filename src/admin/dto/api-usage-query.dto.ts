import { IsOptional, IsString, IsDateString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ApiUsageTimeRange {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class ApiUsageQueryDto {
  @ApiProperty({
    description: 'Filter by specific API name',
    example: 'google_places',
    required: false,
  })
  @IsOptional()
  @IsString()
  apiName?: string;

  @ApiProperty({
    description: 'Start date for the query range (ISO string)',
    example: '2025-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for the query range (ISO string)',
    example: '2025-01-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Time range for aggregation',
    enum: ApiUsageTimeRange,
    example: ApiUsageTimeRange.DAY,
    required: false,
  })
  @IsOptional()
  @IsEnum(ApiUsageTimeRange)
  timeRange?: ApiUsageTimeRange;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 50,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}