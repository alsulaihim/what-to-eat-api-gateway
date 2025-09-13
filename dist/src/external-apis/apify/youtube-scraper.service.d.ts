import { ApifyClientService } from './apify-client.service';
export interface YouTubeScrapingInput {
    search_queries: string[];
    channel_ids: string[];
    video_limit: number;
}
export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    url: string;
    thumbnailUrl: string;
    channel: {
        id: string;
        title: string;
        subscriberCount?: number;
        verified: boolean;
    };
    publishedAt: string;
    duration: string;
    viewCount: number;
    likeCount?: number;
    commentCount?: number;
    tags: string[];
    category: string;
    isLiveContent: boolean;
    foodRelevant: boolean;
    locationMentioned: boolean;
    engagementScore: number;
}
export interface YouTubeIntelligenceData {
    videos_analyzed: number;
    review_sentiment: number;
    channel_recommendations: string[];
    trending_food_content: string[];
    subscriber_influence: number;
    content_analysis: {
        top_reviewed_restaurants: Array<{
            name: string;
            review_count: number;
            avg_sentiment: number;
            recent_reviews: string[];
        }>;
        popular_food_categories: Array<{
            category: string;
            video_count: number;
            total_views: number;
        }>;
        trending_cooking_channels: Array<{
            channel: string;
            subscriber_count: number;
            content_focus: string;
            engagement_rate: number;
        }>;
    };
    video_insights: {
        optimal_video_length: string;
        peak_publishing_days: string[];
        viral_video_patterns: string[];
        audience_retention_factors: string[];
    };
}
export declare class YouTubeScraperService {
    private readonly apifyClient;
    private readonly logger;
    private readonly ACTOR_ID;
    constructor(apifyClient: ApifyClientService);
    scrapeYouTubeFoodReviews(location: string, categories?: string[]): Promise<YouTubeIntelligenceData>;
    private generateSearchQueries;
    private getFoodChannelIds;
    private analyzeYouTubeData;
    private calculateReviewSentiment;
    private analyzeSentiment;
    private extractChannelRecommendations;
    private extractTrendingContent;
    private calculateSubscriberInfluence;
    private analyzeContent;
    private extractRestaurantMentions;
    private findRestaurantNames;
    private categorizeFoodVideo;
    private analyzeCookingChannels;
    private isCookingChannel;
    private getMostCommonContentType;
    private analyzeVideoInsights;
    private categorizeDuration;
    private extractViralPatterns;
    private getFallbackData;
}
