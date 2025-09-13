import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DatabaseService } from '../../common/database/database.service';
export interface TrendsRequest {
    keywords: string[];
    location?: {
        latitude: number;
        longitude: number;
        radius: number;
    };
    timeRange?: 'now 1-d' | 'now 7-d' | 'today 1-m' | 'today 3-m' | 'today 12-m';
    category?: string;
}
export interface TrendingFood {
    keyword: string;
    interest: number;
    relatedQueries?: string[];
    risingPercentage?: number;
    trend?: 'rising' | 'stable' | 'falling';
}
export interface GoogleTrendRSSItem {
    title: string;
    trafficVolume: string;
    description: string;
    pubDate: Date;
    category: string;
}
export declare class TrendsService {
    private configService;
    private httpService;
    private databaseService;
    private readonly logger;
    private readonly GOOGLE_TRENDS_RSS_URL;
    private readonly FOOD_KEYWORDS;
    private trendingCache;
    private readonly CACHE_DURATION;
    constructor(configService: ConfigService, httpService: HttpService, databaseService: DatabaseService);
    getTrendingFood(request: TrendsRequest): Promise<TrendingFood[]>;
    getLocalFoodTrends(location: {
        latitude: number;
        longitude: number;
        radius: number;
    }): Promise<TrendingFood[]>;
    getKeywordInterest(keywords: string[]): Promise<Map<string, number>>;
    private getRSSFoodTrends;
    private getSearchFoodTrends;
    private getGoogleSuggestionsForFood;
    private getLocationBasedTrends;
    private calculateRealWorldInterest;
    private getAlgorithmicTrends;
    private getAlgorithmicLocalTrends;
    private generateCacheKey;
    private parseRSSFeed;
    private filterFoodRelatedItems;
    private isFoodRelated;
    private convertRSSToTrendingFood;
    private extractKeywordFromTitle;
    private parseTrafficVolume;
    private processSuggestionsToTrends;
    private mergeAndDeduplicate;
    private getGeoCodeFromCoordinates;
    private getLocalHourFromCoordinates;
    private getRegionalCuisines;
    private getCurrentSeason;
    private getSeasonalFoods;
    private calculateLocationBasedInterest;
    private calculateTimeAwareInterest;
    private isMealTime;
    private getSeasonalBoost;
    private isUrbanArea;
    private trackApiUsage;
}
