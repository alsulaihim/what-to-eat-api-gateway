import { DemographicDataDto } from '../../users/dto/user-profile.dto';
export declare class DemographicIntelligenceRequestDto {
    userDemographics: DemographicDataDto;
    targetLocation: string;
    cuisineTypes?: string[];
    priceRange?: string;
    diningMode?: string;
}
export declare class SimilarUserDto {
    count: number;
    demographics: DemographicDataDto[];
    commonPreferences: {
        topCuisines: Array<{
            name: string;
            popularity: number;
        }>;
        avgSpiceTolerance: number;
        avgAuthenticityPreference: number;
        commonDietaryRestrictions: string[];
    };
}
export declare class DemographicRecommendationsDto {
    cuisineBoosts: Array<{
        cuisine: string;
        boost: number;
        reason: string;
    }>;
    priceAdjustment: number;
    authenticityFactor: number;
    spiceLevelRecommendation: number;
    culturalMatches: Array<{
        restaurant: string;
        culturalRelevance: number;
    }>;
}
export declare class DemographicInsightsDto {
    culturalContext: string;
    dietaryConsiderations: string[];
    socialTrends: string[];
    confidenceScore: number;
}
export declare class DemographicIntelligenceResponseDto {
    success: boolean;
    data: {
        similarUsers: SimilarUserDto;
        recommendations: DemographicRecommendationsDto;
        insights: DemographicInsightsDto;
    };
    error?: string;
}
export declare class UserSimilarityRequestDto {
    userId: string;
    limit?: number;
    minSimilarityScore?: number;
}
export declare class UserSimilarityDto {
    userId: string;
    similarityScore: {
        overallScore: number;
        categoryScores: {
            cultural: number;
            dietary: number;
            lifestyle: number;
            preferences: number;
        };
        matchingFactors: string[];
        recommendationAdjustments: {
            cuisineBoost?: string[];
            priceAdjustment?: number;
            authenticityFactor?: number;
            spiceLevelAdjustment?: number;
        };
    };
    sharedPreferences: string[];
    recommendationHistory: {
        sharedRestaurants: string[];
        similarRatings: number;
    };
}
export declare class UserSimilarityResponseDto {
    success: boolean;
    data: UserSimilarityDto[];
    error?: string;
}
