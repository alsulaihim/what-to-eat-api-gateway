import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
export declare class FirebaseService implements OnModuleInit {
    private configService;
    private readonly logger;
    private app;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initializeFirebase;
    verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken>;
    getUserByUid(uid: string): Promise<admin.auth.UserRecord>;
    deleteUser(uid: string): Promise<void>;
    getApp(): admin.app.App;
}
