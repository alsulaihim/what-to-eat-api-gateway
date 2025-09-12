import { DatabaseService } from '../common/database/database.service';
import { FirebaseService } from '../common/firebase/firebase.service';
import { UpdateUserProfileDto, UpdateUserPreferencesDto, UserProfileResponseDto } from './dto/user-profile.dto';
export declare class UsersService {
    private databaseService;
    private firebaseService;
    private readonly logger;
    constructor(databaseService: DatabaseService, firebaseService: FirebaseService);
    getUserProfile(firebaseUid: string): Promise<UserProfileResponseDto>;
    updateUserProfile(firebaseUid: string, updateData: UpdateUserProfileDto): Promise<UserProfileResponseDto>;
    updateUserPreferences(firebaseUid: string, preferences: UpdateUserPreferencesDto): Promise<UserProfileResponseDto>;
    deleteUserAccount(firebaseUid: string): Promise<{
        success: boolean;
    }>;
    private validatePreferences;
    private transformUserToResponse;
}
