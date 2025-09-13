import { ApifyClientService } from './apify-client.service';
export interface InstagramScrapingInput {
    hashtags: string[];
    location_tags: string[];
    results_limit: number;
    include_stories: boolean;
}
export interface InstagramPost {
    id: string;
    shortCode: string;
    caption: string;
    hashtags: string[];
    mentions: string[];
    url: string;
    commentsCount: number;
    likesCount: number;
    timestamp: string;
    locationName?: string;
    ownerUsername: string;
    ownerFullName?: string;
    isVideo: boolean;
    videoViewCount?: number;
    foodMentions: number;
    locationRelevant: boolean;
    engagementRate: number;
}
export interface InstagramIntelligenceData {
    posts_analyzed: number;
    trending_hashtags: string[];
    viral_restaurants: string[];
    user_sentiment: number;
    engagement_metrics: {
        avg_likes: number;
        avg_comments: number;
        top_influencers: string[];
    };
    location_insights: {
        tagged_locations: string[];
        food_hotspots: string[];
        trending_dishes: string[];
    };
    temporal_patterns: {
        peak_posting_hours: number[];
        weekly_trends: string[];
    };
}
export declare class InstagramScraperService {
    private readonly apifyClient;
    private readonly logger;
    private readonly ACTOR_ID;
    constructor(apifyClient: ApifyClientService);
    scrapeInstagramFoodTrends(location: string, categories?: string[]): Promise<InstagramIntelligenceData>;
    private analyzeInstagramData;
    private isFoodRelatedHashtag;
    private isRestaurantAccount;
    private analyzeSentiment;
    private extractDishKeywords;
    private calculatePeakHours;
    private calculateWeeklyTrends;
    private getFallbackData;
}
