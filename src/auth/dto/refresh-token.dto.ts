import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Firebase refresh token',
    example: 'AEu4IL1234...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string = '';
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'Whether the token refresh was successful',
    example: true,
  })
  success: boolean = false;

  @ApiProperty({
    description: 'New Firebase ID token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  idToken?: string;

  @ApiProperty({
    description: 'New refresh token',
    example: 'AEu4IL1234...',
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  expiresIn?: string;

  @ApiProperty({
    description: 'Error message if refresh failed',
    example: 'Invalid refresh token',
  })
  error?: string;
}