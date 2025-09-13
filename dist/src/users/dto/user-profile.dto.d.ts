export declare class NotificationsDto {
    email?: boolean;
    push?: boolean;
    trending?: boolean;
}
export declare class DemographicDataDto {
    nationality?: string;
    ageGroup?: string;
    gender?: string;
    culturalBackground?: string;
    spiceToleranceLevel?: number;
    authenticityPreference?: number;
    languagePreference?: string;
    incomeBracket?: string;
    religiousDietaryRequirements?: string[];
    familyStructure?: string;
    occupationCategory?: string;
    livingArea?: string;
}
export declare class UserPreferencesDto {
    defaultLocation?: string;
    defaultPartySize?: number;
    defaultBudget?: string;
    defaultMode?: string;
    defaultRadius?: number;
    cuisinePreferences?: string[];
    dietaryRestrictions?: string[];
    notifications?: NotificationsDto;
    demographicData?: DemographicDataDto;
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
