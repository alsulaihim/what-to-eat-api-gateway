import type { Request } from 'express';
import { RecommendationsService } from './recommendations.service';
import { RecommendationRequestDto } from './dto/recommendation-request.dto';
import { RecommendationResponseDto } from './dto/recommendation-response.dto';
export declare class RecommendationsController {
    private readonly recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    getRecommendations(recommendationRequest: RecommendationRequestDto, request: Request): Promise<RecommendationResponseDto>;
    getBatchRecommendations(requests: RecommendationRequestDto[], request: Request): Promise<RecommendationResponseDto[]>;
    getRecommendationHistory(request: Request, limit?: number, offset?: number): Promise<RecommendationResponseDto[]>;
    clearRecommendationHistory(request: Request): Promise<{
        success: boolean;
    }>;
    deleteRecommendationEntry(entryId: string, request: Request): Promise<{
        success: boolean;
    }>;
    getTrendingRestaurants(location: string, radius?: number): Promise<any>;
}
export declare class TestRecommendationsController {
    private readonly recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    testRecommendations(recommendationRequest: RecommendationRequestDto): Promise<RecommendationResponseDto>;
    testTrendingRestaurants(location?: string, radius?: number): Promise<any>;
}
