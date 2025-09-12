export declare class UserPreferencesDto {
    dietaryRestrictions?: string[];
    cuisinePreferences?: string[];
    budgetRange?: string;
    defaultPartySize?: number;
}
export declare class UpdateUserProfileDto {
    displayName?: string;
    photoURL?: string;
}
export declare class UpdateUserPreferencesDto extends UserPreferencesDto {
}
export declare class UserProfileResponseDto {
    id: string;
    firebaseUid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    provider: string;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date;
    preferences?: UserPreferencesDto;
}
