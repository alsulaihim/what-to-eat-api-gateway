import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../common/firebase/firebase.service';
import { DatabaseService } from '../common/database/database.service';
import { User } from '@prisma/client';
import * as admin from 'firebase-admin';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface ValidateTokenResponse {
  valid: boolean;
  user: {
    uid: string;
    email: string | undefined;
    displayName: string | undefined;
    photoURL: string | undefined;
    provider: string | undefined;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private firebaseService: FirebaseService,
    private databaseService: DatabaseService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async validateToken(idToken: string): Promise<ValidateTokenResponse> {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);
      
      // Get or create user in our database
      await this.syncUserWithDatabase(decodedToken);

      return {
        valid: true,
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          displayName: decodedToken.name,
          photoURL: decodedToken.picture,
          provider: this.getProviderFromToken(decodedToken),
        },
      };
    } catch (error) {
      this.logger.error('Token validation failed:', error);
      return {
        valid: false,
        user: {
          uid: '',
          email: undefined,
          displayName: undefined,
          photoURL: undefined,
          provider: undefined,
        },
      };
    }
  }

  async syncUserWithDatabase(decodedToken: admin.auth.DecodedIdToken): Promise<User> {
    try {
      const existingUser = await this.databaseService.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
      });

      if (existingUser) {
        // Update last login time
        const updatedUser = await this.databaseService.user.update({
          where: { firebaseUid: decodedToken.uid },
          data: {
            lastLogin: new Date(),
            displayName: decodedToken.name,
            photoURL: decodedToken.picture,
          },
        });
        
        this.logger.debug(`Updated existing user: ${decodedToken.uid}`);
        return updatedUser;
      } else {
        // Create new user
        const newUser = await this.databaseService.user.create({
          data: {
            firebaseUid: decodedToken.uid,
            email: decodedToken.email || '',
            displayName: decodedToken.name,
            photoURL: decodedToken.picture,
            provider: this.getProviderFromToken(decodedToken),
            lastLogin: new Date(),
          },
        });

        this.logger.log(`Created new user: ${decodedToken.uid}`);
        return newUser;
      }
    } catch (error) {
      this.logger.error('Failed to sync user with database:', error);
      throw error;
    }
  }

  async logout(uid: string): Promise<{ success: boolean }> {
    try {
      // We don't revoke Firebase tokens as they're stateless
      // Just log the logout event
      this.logger.log(`User ${uid} logged out`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Logout failed for user ${uid}:`, error);
      return { success: false };
    }
  }

  async refreshToken(refreshToken: string): Promise<{
    success: boolean;
    idToken?: string;
    refreshToken?: string;
    expiresIn?: string;
    error?: string;
  }> {
    try {
      const apiKey = this.configService.get<string>('FIREBASE_WEB_API_KEY');
      if (!apiKey) {
        throw new BadRequestException('Firebase Web API key not configured');
      }

      // Use Firebase REST API to refresh token
      const response = await firstValueFrom(
        this.httpService.post(
          `https://securetoken.googleapis.com/v1/token?key=${apiKey}`,
          {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      );

      const data = response.data;

      // Verify the new token is valid by decoding it
      await this.firebaseService.verifyIdToken(data.id_token);

      this.logger.log('Token refresh successful');

      return {
        success: true,
        idToken: data.id_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      this.logger.error('Token refresh failed:', error);

      let errorMessage = 'Token refresh failed';
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.error?.message) {
          errorMessage = axiosError.response.data.error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private getProviderFromToken(decodedToken: admin.auth.DecodedIdToken): string {
    // Firebase provider IDs: 'google.com', 'apple.com', 'password' for email
    const providerId = decodedToken.firebase?.sign_in_provider;
    
    switch (providerId) {
      case 'google.com':
        return 'google';
      case 'apple.com':
        return 'apple';
      case 'password':
        return 'email';
      default:
        return 'unknown';
    }
  }
}