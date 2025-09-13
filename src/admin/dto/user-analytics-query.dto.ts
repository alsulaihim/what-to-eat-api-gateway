import { IsOptional, IsDateString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum UserAnalyticsMetric {
  ACTIVE_USERS = 'active_users',
  NEW_REGISTRATIONS = 'new_registrations',
  RECOMMENDATION_REQUESTS = 'recommendation_requests',
  USER_RETENTION = 'user_retention',
  CONVERSION_RATES = 'conversion_rates',
}

export enum AnalyticsTimeRange {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class UserAnalyticsQueryDto {
  @ApiProperty({
    description: 'Specific metric to analyze',
    enum: UserAnalyticsMetric,
    example: UserAnalyticsMetric.ACTIVE_USERS,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserAnalyticsMetric)
  metric?: UserAnalyticsMetric;

  @ApiProperty({
    description: 'Start date for analytics range (ISO string)',
    example: '2025-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for analytics range (ISO string)',
    example: '2025-01-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Time range for data aggregation',
    enum: AnalyticsTimeRange,
    example: AnalyticsTimeRange.DAY,
    required: false,
  })
  @IsOptional()
  @IsEnum(AnalyticsTimeRange)
  timeRange?: AnalyticsTimeRange;

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