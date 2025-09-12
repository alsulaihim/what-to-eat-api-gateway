import { Controller, Get, Put, Delete, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { AuthenticatedRequest } from '../auth/firebase-auth.guard';
import { 
  UpdateUserProfileDto, 
  UpdateUserPreferencesDto,
  UserProfileResponseDto 
} from './dto/user-profile.dto';

@ApiTags('User Management')
@Controller('api/users')
@UseGuards(ThrottlerGuard, FirebaseAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieves the authenticated user\'s profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  async getUserProfile(@Req() req: AuthenticatedRequest): Promise<UserProfileResponseDto> {
    return this.usersService.getUserProfile(req.user.uid);
  }

  @Put('profile')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Updates the authenticated user\'s profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  async updateUserProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateData: UpdateUserProfileDto
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateUserProfile(req.user.uid, updateData);
  }

  @Put('preferences')
  @ApiOperation({
    summary: 'Update user preferences',
    description: 'Updates the authenticated user\'s food preferences for recommendations',
  })
  @ApiResponse({
    status: 200,
    description: 'User preferences updated successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid preference data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  async updateUserPreferences(
    @Req() req: AuthenticatedRequest,
    @Body() preferences: UpdateUserPreferencesDto
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateUserPreferences(req.user.uid, preferences);
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete user account',
    description: 'Permanently deletes the authenticated user\'s account and all associated data',
  })
  @ApiResponse({
    status: 200,
    description: 'User account deleted successfully',
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
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  async deleteUserAccount(@Req() req: AuthenticatedRequest): Promise<{ success: boolean }> {
    return this.usersService.deleteUserAccount(req.user.uid);
  }
}