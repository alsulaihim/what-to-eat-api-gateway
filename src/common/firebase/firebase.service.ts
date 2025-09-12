import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App | undefined;

  constructor(private configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.initializeFirebase();
  }

  private async initializeFirebase(): Promise<void> {
    try {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const rawPrivateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

      if (!projectId || !rawPrivateKey || !clientEmail) {
        this.logger.warn('Firebase configuration incomplete - running in development mode');
        this.logger.warn('Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL');
        return; // Don't throw error, just skip Firebase initialization for development
      }

      // Process private key with multiple fallbacks
      let privateKey = rawPrivateKey;
      
      // First try: replace literal \n with newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      // Second try: remove trailing backslashes from each line (common .env formatting issue)
      privateKey = privateKey.replace(/\\\n/g, '\n');
      
      // Third try: ensure proper PEM formatting
      if (!privateKey.includes('\n')) {
        // If no newlines, try to format as proper PEM
        privateKey = privateKey
          .replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n')
          .replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----')
          .replace(/(.{64})/g, '$1\n')
          .replace(/\n\n/g, '\n');
      }

      this.logger.debug('Attempting Firebase initialization...');

      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey,
          clientEmail,
        }),
        projectId,
      });

      this.logger.log(`Firebase initialized successfully for project: ${projectId}`);
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error);
      this.logger.error('This will affect authentication functionality');
      // Don't throw error in development - allow app to start without Firebase
      if (this.configService.get<string>('NODE_ENV') === 'production') {
        throw error;
      }
    }
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      if (!this.app) {
        throw new Error('Firebase app not initialized');
      }
      
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      this.logger.debug(`Token verified for user: ${decodedToken.uid}`);
      return decodedToken;
    } catch (error) {
      this.logger.error('Token verification failed:', error);
      throw error;
    }
  }

  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      if (!this.app) {
        throw new Error('Firebase app not initialized');
      }
      
      const userRecord = await admin.auth().getUser(uid);
      return userRecord;
    } catch (error) {
      this.logger.error(`Failed to get user ${uid}:`, error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      if (!this.app) {
        throw new Error('Firebase app not initialized');
      }
      
      await admin.auth().deleteUser(uid);
      this.logger.log(`User ${uid} deleted from Firebase`);
    } catch (error) {
      this.logger.error(`Failed to delete user ${uid}:`, error);
      throw error;
    }
  }

  getApp(): admin.app.App {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }
    return this.app;
  }
}