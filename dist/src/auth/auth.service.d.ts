import { FirebaseService } from '../common/firebase/firebase.service';
import { DatabaseService } from '../common/database/database.service';
import { User } from '@prisma/client';
import * as admin from 'firebase-admin';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
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
export declare class AuthService {
    private firebaseService;
    private databaseService;
    private httpService;
    private configService;
    private readonly logger;
    constructor(firebaseService: FirebaseService, databaseService: DatabaseService, httpService: HttpService, configService: ConfigService);
    validateToken(idToken: string): Promise<ValidateTokenResponse>;
    syncUserWithDatabase(decodedToken: admin.auth.DecodedIdToken): Promise<User>;
    logout(uid: string): Promise<{
        success: boolean;
    }>;
    refreshToken(refreshToken: string): Promise<{
        success: boolean;
        idToken?: string;
        refreshToken?: string;
        expiresIn?: string;
        error?: string;
    }>;
    private getProviderFromToken;
}
