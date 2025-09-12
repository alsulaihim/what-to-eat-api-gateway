import { FirebaseService } from '../common/firebase/firebase.service';
import { DatabaseService } from '../common/database/database.service';
import { User } from '@prisma/client';
import * as admin from 'firebase-admin';
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
    private readonly logger;
    constructor(firebaseService: FirebaseService, databaseService: DatabaseService);
    validateToken(idToken: string): Promise<ValidateTokenResponse>;
    syncUserWithDatabase(decodedToken: admin.auth.DecodedIdToken): Promise<User>;
    logout(uid: string): Promise<{
        success: boolean;
    }>;
    private getProviderFromToken;
}
