import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../common/database/database.service';
export interface RecommendationContext {
    userPreferences?: {
        dietaryRestrictions?: string[];
        cuisinePreferences?: string[];
        budgetRange?: string;
        defaultPartySize?: number;
    };
    contextualFactors: {
        timeOfDay: string;
        weather?: string;
        dayOfWeek: string;
        season: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string;
        };
    };
    socialIntelligence: {
        trendingFoods: Array<{
            keyword: string;
            interest: number;
            risingPercentage?: number;
        }>;
        localTrends: Array<{
            keyword: string;
            interest: number;
        }>;
    };
    nearbyRestaurants: Array<{
        place_id: string;
        name: string;
        rating?: number;
        price_level?: number;
        cuisine_type?: string[];
    }>;
    mode: 'delivery' | 'dine-out' | 'pickup';
}
export interface ChatGPTRecommendation {
    restaurantId: string;
    restaurantName: string;
    confidenceScore: number;
    reasoning: string;
    matchFactors: {
        personalMatch: number;
        socialTrends: number;
        contextualFit: number;
        accessibility: number;
    };
    suggestedDishes?: string[];
}
export interface RecommendationResponse {
    recommendations: ChatGPTRecommendation[];
    overallReasoning: string;
    additionalTips?: string[];
}
export declare class ChatGPTService {
    private configService;
    private databaseService;
    private readonly logger;
    private readonly httpClient;
    private readonly apiKey;
    private readonly baseUrl;
    constructor(configService: ConfigService, databaseService: DatabaseService);
    generateRecommendations(context: RecommendationContext): Promise<RecommendationResponse>;
    explainRecommendation(recommendation: ChatGPTRecommendation, context: RecommendationContext): Promise<string>;
    private getSystemPrompt;
    private buildRecommendationPrompt;
    private validateAndTransformResponse;
    private generateFallbackRecommendations;
    private calculateCost;
    private trackApiUsage;
}
