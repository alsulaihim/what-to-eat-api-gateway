import { ApifyClientService } from './apify-client.service';
export interface TikTokScrapingInput {
    hashtags: string[];
    keywords: string[];
    video_limit: number;
}
export interface TikTokVideo {
    id: string;
    text: string;
    createTime: string;
    videoUrl: string;
    musicInfo?: {
        title: string;
        author: string;
    };
    authorInfo: {
        uniqueId: string;
        nickname: string;
        verified: boolean;
        followerCount: number;
    };
    stats: {
        diggCount: number;
        shareCount: number;
        commentCount: number;
        playCount: number;
    };
    hashtags: string[];
    mentions: string[];
    isAd: boolean;
    foodContent: boolean;
    locationMentioned: boolean;
    viralScore: number;
}
export interface TikTokIntelligenceData {
    videos_analyzed: number;
    viral_food_trends: string[];
    hashtag_performance: {
        [hashtag: string]: {
            video_count: number;
            total_views: number;
            engagement_rate: number;
        };
    };
    creator_influence: {
        top_creators: string[];
        trend_adoption_rate: number;
    };
    content_insights: {
        trending_sounds: Array<{
            title: string;
            usage_count: number;
            viral_potential: number;
        }>;
        popular_formats: string[];
        viral_triggers: string[];
    };
    audience_behavior: {
        peak_engagement_times: number[];
        content_preferences: string[];
        interaction_patterns: {
            like_to_view_ratio: number;
            share_rate: number;
            comment_engagement: number;
        };
    };
}
export declare class TikTokScraperService {
    private readonly apifyClient;
    private readonly logger;
    private readonly ACTOR_ID;
    constructor(apifyClient: ApifyClientService);
    scrapeTikTokFoodTrends(location: string, categories?: string[]): Promise<TikTokIntelligenceData>;
    private generateFoodHashtags;
    private generateFoodKeywords;
    private analyzeTikTokData;
    private extractViralTrends;
    private analyzeHashtagPerformance;
    private isFoodRelatedHashtag;
    private analyzeCreatorInfluence;
    private analyzeContentInsights;
    private analyzeAudienceBehavior;
    private getFallbackData;
}
