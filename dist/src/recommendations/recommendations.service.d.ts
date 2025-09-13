import { ConfigService } from '@nestjs/config';
import { GooglePlacesService } from '../external-apis/google/places.service';
import { MapsService } from '../external-apis/google/maps.service';
import { TrendsService } from '../external-apis/google/trends.service';
import { ChatGPTService } from '../external-apis/openai/chatgpt.service';
import { DatabaseService } from '../common/database/database.service';
import { RecommendationRequestDto } from './dto/recommendation-request.dto';
import { RecommendationResponseDto } from './dto/recommendation-response.dto';
interface AlgorithmWeights {
    socialTrends: number;
    personalPreferences: number;
    contextualFactors: number;
    locationRelevance: number;
    ratingQuality: number;
    priceMatch: number;
}
export declare class RecommendationsService {
    private readonly googlePlacesService;
    private readonly mapsService;
    private readonly trendsService;
    private readonly chatGPTService;
    private readonly databaseService;
    private readonly configService;
    private readonly logger;
    private algorithmWeights;
    constructor(googlePlacesService: GooglePlacesService, mapsService: MapsService, trendsService: TrendsService, chatGPTService: ChatGPTService, databaseService: DatabaseService, configService: ConfigService);
    generateRecommendations(request: RecommendationRequestDto, userId: string): Promise<RecommendationResponseDto>;
    private resolveLocation;
    private getUserProfile;
    private getContextualFactors;
    private searchRestaurants;
    private buildSearchQuery;
    private getSocialIntelligence;
    private scoreAndRankRestaurants;
    private calculateSocialTrendsScore;
    private calculatePersonalPreferencesScore;
    private calculateContextualScore;
    private calculateLocationScore;
    private calculateRatingScore;
    private calculatePriceScore;
    private formatRestaurantRecommendation;
    private generateRecommendationReason;
    private generateAIRecommendationInsights;
    private calculateOverallConfidence;
    private saveRecommendationHistory;
    generateBatchRecommendations(requests: RecommendationRequestDto[], userId: string): Promise<RecommendationResponseDto[]>;
    getUserRecommendationHistory(userId: string, limit: number, offset: number): Promise<any>;
    getTrendingRestaurants(location: string, radius: number): Promise<any>;
    updateAlgorithmWeights(weights: Partial<AlgorithmWeights>): Promise<AlgorithmWeights>;
    getAlgorithmWeights(): Promise<AlgorithmWeights>;
    clearUserRecommendationHistory(userId: string): Promise<{
        success: boolean;
    }>;
    deleteUserRecommendationEntry(userId: string, entryId: string): Promise<{
        success: boolean;
    }>;
    private getCurrentSeason;
}
export {};
