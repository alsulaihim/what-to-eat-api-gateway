import { Controller, Post, Delete, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import type { AuthenticatedRequest } from './firebase-auth.guard';
import { ValidateTokenDto, ValidateTokenResponseDto } from './dto/validate-token.dto';

@ApiTags('Authentication')
@Controller('api/auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate Firebase ID token',
    description: 'Validates a Firebase ID token and returns user information',
  })
  @ApiResponse({
    status: 200,
    description: 'Token validation result',
    type: ValidateTokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  async validateToken(@Body() validateTokenDto: ValidateTokenDto): Promise<ValidateTokenResponseDto> {
    return this.authService.validateToken(validateTokenDto.idToken);
  }

  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description: 'Logs out the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  async logout(@Req() req: AuthenticatedRequest): Promise<{ success: boolean }> {
    return this.authService.logout(req.user.uid);
  }
}