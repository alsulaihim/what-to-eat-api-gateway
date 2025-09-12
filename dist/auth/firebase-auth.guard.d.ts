import { CanActivate, ExecutionContext } from '@nestjs/common';
import { FirebaseService } from '../common/firebase/firebase.service';
import { Request } from 'express';
export interface AuthenticatedRequest extends Request {
    user: {
        uid: string;
        email: string | undefined;
        displayName: string | undefined;
        photoURL: string | undefined;
    };
}
export declare class FirebaseAuthGuard implements CanActivate {
    private firebaseService;
    private readonly logger;
    constructor(firebaseService: FirebaseService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
