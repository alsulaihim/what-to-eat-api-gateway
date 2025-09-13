export declare enum RecommendationMode {
    DELIVERY = "delivery",
    DINE_OUT = "dine_out"
}
export declare enum BudgetRange {
    LOW = "$",
    MEDIUM = "$$",
    HIGH = "$$$",
    PREMIUM = "$$$$"
}
export declare class RecommendationRequestDto {
    mode?: RecommendationMode;
    partySize?: number;
    budget?: BudgetRange;
    location?: string;
    latitude?: number;
    longitude?: number;
    cuisinePreferences?: string[];
    dietaryRestrictions?: string[];
    maxDistance?: number;
    includeTrending?: boolean;
}
