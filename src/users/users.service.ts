import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { FirebaseService } from '../common/firebase/firebase.service';
import { User } from '@prisma/client';
import { 
  UpdateUserProfileDto, 
  UpdateUserPreferencesDto,
  UserProfileResponseDto,
  UserPreferencesDto 
} from './dto/user-profile.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private databaseService: DatabaseService,
    private firebaseService: FirebaseService,
  ) {}

  async getUserProfile(firebaseUid: string): Promise<UserProfileResponseDto> {
    try {
      let user = await this.databaseService.user.findUnique({
        where: { firebaseUid },
      });

      if (!user) {
        this.logger.log(`User with Firebase UID ${firebaseUid} not found, creating new user`);
        user = await this.createUserFromFirebase(firebaseUid);
      }

      return this.transformUserToResponse(user);
    } catch (error) {
      this.logger.error(`Failed to get user profile for ${firebaseUid}:`, error);
      throw error;
    }
  }

  async updateUserProfile(
    firebaseUid: string, 
    updateData: UpdateUserProfileDto
  ): Promise<UserProfileResponseDto> {
    try {
      const existingUser = await this.databaseService.user.findUnique({
        where: { firebaseUid },
      });

      if (!existingUser) {
        throw new NotFoundException(`User with Firebase UID ${firebaseUid} not found`);
      }

      const updatedUser = await this.databaseService.user.update({
        where: { firebaseUid },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Updated profile for user: ${firebaseUid}`);
      return this.transformUserToResponse(updatedUser);
    } catch (error) {
      this.logger.error(`Failed to update user profile for ${firebaseUid}:`, error);
      throw error;
    }
  }

  async updateUserPreferences(
    firebaseUid: string,
    preferences: UpdateUserPreferencesDto
  ): Promise<UserProfileResponseDto> {
    try {
      const existingUser = await this.databaseService.user.findUnique({
        where: { firebaseUid },
      });

      if (!existingUser) {
        throw new NotFoundException(`User with Firebase UID ${firebaseUid} not found`);
      }

      // Validate preferences
      this.validatePreferences(preferences);

      const updatedUser = await this.databaseService.user.update({
        where: { firebaseUid },
        data: {
          preferences: preferences as any, // Prisma Json type
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Updated preferences for user: ${firebaseUid}`);
      return this.transformUserToResponse(updatedUser);
    } catch (error) {
      this.logger.error(`Failed to update user preferences for ${firebaseUid}:`, error);
      throw error;
    }
  }

  async deleteUserAccount(firebaseUid: string): Promise<{ success: boolean }> {
    try {
      // Start a transaction to delete user data and Firebase account
      const user = await this.databaseService.user.findUnique({
        where: { firebaseUid },
      });

      if (!user) {
        throw new NotFoundException(`User with Firebase UID ${firebaseUid} not found`);
      }

      // Delete from our database (cascade will handle related data)
      await this.databaseService.user.delete({
        where: { firebaseUid },
      });

      // Delete from Firebase Auth
      await this.firebaseService.deleteUser(firebaseUid);

      this.logger.log(`Deleted user account: ${firebaseUid}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete user account for ${firebaseUid}:`, error);
      throw error;
    }
  }

  private validatePreferences(preferences: UpdateUserPreferencesDto): void {
    // Validate budget preference
    if (preferences.defaultBudget) {
      const validBudgetOptions = ['low', 'medium', 'high'];
      if (!validBudgetOptions.includes(preferences.defaultBudget)) {
        throw new BadRequestException(
          `Invalid budget preference. Must be one of: ${validBudgetOptions.join(', ')}`
        );
      }
    }

    // Validate dining mode
    if (preferences.defaultMode) {
      const validModes = ['dine_out', 'takeout', 'delivery'];
      if (!validModes.includes(preferences.defaultMode)) {
        throw new BadRequestException(
          `Invalid dining mode. Must be one of: ${validModes.join(', ')}`
        );
      }
    }

    // Validate party size
    if (preferences.defaultPartySize !== undefined) {
      if (preferences.defaultPartySize < 1 || preferences.defaultPartySize > 20) {
        throw new BadRequestException('Default party size must be between 1 and 20');
      }
    }

    // Validate dietary restrictions
    if (preferences.dietaryRestrictions) {
      const validRestrictions = [
        'vegetarian', 'vegan', 'pescatarian', 'gluten-free', 'dairy-free', 
        'nut-free', 'soy-free', 'kosher', 'halal', 'low-carb', 'keto'
      ];
      
      const invalidRestrictions = preferences.dietaryRestrictions.filter(
        restriction => !validRestrictions.includes(restriction.toLowerCase())
      );

      if (invalidRestrictions.length > 0) {
        this.logger.warn(`Invalid dietary restrictions: ${invalidRestrictions.join(', ')}`);
        // Allow unknown restrictions but log them for future reference
      }
    }
  }

  private async createUserFromFirebase(firebaseUid: string): Promise<User> {
    try {
      const firebaseUser = await this.firebaseService.getUserByUid(firebaseUid);

      if (!firebaseUser) {
        throw new NotFoundException(`Firebase user with UID ${firebaseUid} not found`);
      }

      const defaultPreferences = {
        defaultLocation: '',
        defaultPartySize: 2,
        defaultBudget: 'medium',
        defaultMode: 'dine_out',
        defaultRadius: 10,
        cuisinePreferences: [],
        dietaryRestrictions: [],
        notifications: {
          email: true,
          push: false,
          trending: true,
        },
      };

      const user = await this.databaseService.user.create({
        data: {
          firebaseUid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || null,
          photoURL: firebaseUser.photoURL || null,
          provider: firebaseUser.providerData?.[0]?.providerId || 'firebase',
          preferences: defaultPreferences,
          lastLogin: new Date(),
        },
      });

      this.logger.log(`Created new user for Firebase UID: ${firebaseUid}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user for Firebase UID ${firebaseUid}:`, error);
      throw error;
    }
  }

  private transformUserToResponse(user: User): UserProfileResponseDto {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      provider: user.provider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      preferences: user.preferences as UserPreferencesDto | undefined,
    };
  }
}