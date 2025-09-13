import { UsersService } from './users.service';
import type { AuthenticatedRequest } from '../auth/firebase-auth.guard';
import { UpdateUserProfileDto, UpdateUserPreferencesDto, UserProfileResponseDto } from './dto/user-profile.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getUserProfile(req: AuthenticatedRequest): Promise<UserProfileResponseDto>;
    updateUserProfile(req: AuthenticatedRequest, updateData: UpdateUserProfileDto): Promise<UserProfileResponseDto>;
    updateUserPreferences(req: AuthenticatedRequest, preferences: UpdateUserPreferencesDto): Promise<UserProfileResponseDto>;
    deleteUserAccount(req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
}
