import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateTokenDto {
  @ApiProperty({
    description: 'Firebase ID token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}

export class ValidateTokenResponseDto {
  @ApiProperty({
    description: 'Whether the token is valid',
    example: true,
  })
  valid!: boolean;

  @ApiProperty({
    description: 'User information from the token',
    example: {
      uid: 'firebase-user-id',
      email: 'user@example.com',
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg',
      provider: 'google',
    },
  })
  user!: {
    uid: string;
    email: string | undefined;
    displayName: string | undefined;
    photoURL: string | undefined;
    provider: string | undefined;
  };
}