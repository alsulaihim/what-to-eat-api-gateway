import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber, Min, Max, IsEmail } from 'class-validator';

export class UserPreferencesDto {
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
    description: 'Cuisine preferences',
    example: ['italian', 'mexican', 'asian'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuisinePreferences?: string[];

  @ApiPropertyOptional({
    description: 'Budget range',
    example: 'moderate',
    enum: ['budget', 'moderate', 'upscale', 'fine-dining'],
  })
  @IsOptional()
  @IsString()
  budgetRange?: string;

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