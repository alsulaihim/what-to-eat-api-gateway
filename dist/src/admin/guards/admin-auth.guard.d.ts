import { CanActivate, ExecutionContext } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { DatabaseService } from '../../common/database/database.service';
export declare class AdminAuthGuard implements CanActivate {
    private readonly firebaseService;
    private readonly databaseService;
    constructor(firebaseService: FirebaseService, databaseService: DatabaseService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private checkAdminPrivileges;
}
