import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber, Min, Max, IsEmail, IsBoolean, IsIn, IsDateString } from 'class-validator';

export class NotificationsDto {
  @ApiPropertyOptional({
    description: 'Email notifications enabled',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiPropertyOptional({
    description: 'Push notifications enabled',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @ApiPropertyOptional({
    description: 'Trending notifications enabled',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  trending?: boolean;
}

export class DemographicDataDto {
  @ApiPropertyOptional({
    description: 'User nationality (ISO 3166-1 alpha-2 code)',
    example: 'US',
  })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({
    description: 'Age group',
    example: '25-34',
    enum: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['18-24', '25-34', '35-44', '45-54', '55-64', '65+'])
  ageGroup?: string;

  @ApiPropertyOptional({
    description: 'Gender identity',
    example: 'other',
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: string;

  @ApiPropertyOptional({
    description: 'Cultural background/ethnicity',
    example: 'latino',
    enum: ['asian', 'black', 'hispanic_latino', 'middle_eastern', 'native_american', 'pacific_islander', 'white', 'mixed', 'other', 'prefer_not_to_say'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['asian', 'black', 'hispanic_latino', 'middle_eastern', 'native_american', 'pacific_islander', 'white', 'mixed', 'other', 'prefer_not_to_say'])
  culturalBackground?: string;

  @ApiPropertyOptional({
    description: 'Spice tolerance level (1-10 scale)',
    example: 7,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  spiceToleranceLevel?: number;

  @ApiPropertyOptional({
    description: 'Authenticity preference level (1-10 scale)',
    example: 8,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  authenticityPreference?: number;

  @ApiPropertyOptional({
    description: 'Primary language preference (ISO 639-1 code)',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  languagePreference?: string;

  @ApiPropertyOptional({
    description: 'Income bracket for dining budget estimation',
    example: 'middle',
    enum: ['low', 'lower_middle', 'middle', 'upper_middle', 'high', 'prefer_not_to_say'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['low', 'lower_middle', 'middle', 'upper_middle', 'high', 'prefer_not_to_say'])
  incomeBracket?: string;

  @ApiPropertyOptional({
    description: 'Religious dietary requirements',
    example: ['halal'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  religiousDietaryRequirements?: string[];

  @ApiPropertyOptional({
    description: 'Family structure for recommendation context',
    example: 'couple',
    enum: ['single', 'couple', 'family_with_kids', 'extended_family', 'roommates', 'other'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['single', 'couple', 'family_with_kids', 'extended_family', 'roommates', 'other'])
  familyStructure?: string;

  @ApiPropertyOptional({
    description: 'Occupation category for dining pattern analysis',
    example: 'technology',
    enum: ['student', 'technology', 'healthcare', 'education', 'finance', 'retail', 'hospitality', 'government', 'arts', 'other', 'prefer_not_to_say'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['student', 'technology', 'healthcare', 'education', 'finance', 'retail', 'hospitality', 'government', 'arts', 'other', 'prefer_not_to_say'])
  occupationCategory?: string;

  @ApiPropertyOptional({
    description: 'Living area type',
    example: 'urban',
    enum: ['urban', 'suburban', 'rural'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['urban', 'suburban', 'rural'])
  livingArea?: string;
}

export class UserPreferencesDto {
  @ApiPropertyOptional({
    description: 'Default location',
    example: 'New York, NY',
  })
  @IsOptional()
  @IsString()
  defaultLocation?: string;

  @ApiPropertyOptional({
    description: 'Default party size',
    example: 2,
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  defaultPartySize?: number;

  @ApiPropertyOptional({
    description: 'Default budget preference',
    example: 'medium',
    enum: ['low', 'medium', 'high'],
  })
  @IsOptional()
  @IsString()
  defaultBudget?: string;

  @ApiPropertyOptional({
    description: 'Default dining mode',
    example: 'dine_out',
    enum: ['dine_out', 'takeout', 'delivery'],
  })
  @IsOptional()
  @IsString()
  defaultMode?: string;

  @ApiPropertyOptional({
    description: 'Default search radius in km',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  defaultRadius?: number;

  @ApiPropertyOptional({
    description: 'Cuisine preferences',
    example: ['italian', 'mexican', 'asian'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuisinePreferences?: string[];

  @ApiPropertyOptional({
    description: 'Dietary restrictions',
    example: ['vegetarian', 'gluten-free'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions?: string[];

  @ApiPropertyOptional({
    description: 'Notification preferences',
    type: NotificationsDto,
  })
  @IsOptional()
  notifications?: NotificationsDto;

  @ApiPropertyOptional({
    description: 'Demographic information for enhanced recommendations',
    type: DemographicDataDto,
  })
  @IsOptional()
  demographicData?: DemographicDataDto;
}

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({
    description: 'User photo URL',
    example: 'https://example.com/photo.jpg',
  })
  @IsOptional()
  @IsString()
  photoURL?: string;
}

export class UpdateUserPreferencesDto extends UserPreferencesDto {}

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clm123456789',
  })
  id!: string;

  @ApiProperty({
    description: 'Firebase user ID',
    example: 'firebase-uid-123',
  })
  firebaseUid!: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email!: string;

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
  })
  displayName?: string;

  @ApiPropertyOptional({
    description: 'User photo URL',
    example: 'https://example.com/photo.jpg',
  })
  photoURL?: string;

  @ApiProperty({
    description: 'Authentication provider',
    example: 'google',
    enum: ['google', 'apple', 'email'],
  })
  provider!: string;

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last profile update',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Last login date',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastLogin!: Date;

  @ApiPropertyOptional({
    description: 'User preferences',
    type: UserPreferencesDto,
  })
  preferences?: UserPreferencesDto;
}