import { ApifyClientService } from './apify-client.service';
export interface FacebookScrapingInput {
    page_urls: string[];
    keywords: string[];
    post_limit: number;
}
export interface FacebookPost {
    id: string;
    text: string;
    url: string;
    publishedAt: string;
    author: {
        name: string;
        profileUrl: string;
        verified?: boolean;
    };
    page: {
        name: string;
        url: string;
        likes?: number;
        followers?: number;
        category?: string;
    };
    stats: {
        likes: number;
        shares: number;
        comments: number;
        reactions: {
            like: number;
            love: number;
            haha: number;
            wow: number;
            sad: number;
            angry: number;
        };
    };
    mediaType: 'photo' | 'video' | 'text' | 'link';
    hashtags: string[];
    mentions: string[];
    foodRelevant: boolean;
    locationMentioned: boolean;
    eventPost: boolean;
    engagementScore: number;
}
export interface FacebookIntelligenceData {
    posts_analyzed: number;
    page_engagement: number;
    event_mentions: string[];
    community_sentiment: number;
    page_insights: {
        most_active_pages: Array<{
            name: string;
            category: string;
            engagement_rate: number;
            follower_count: number;
        }>;
        content_performance: {
            top_performing_posts: Array<{
                text: string;
                page: string;
                engagement: number;
                reactions_breakdown: any;
            }>;
            optimal_posting_times: number[];
            viral_content_patterns: string[];
        };
    };
    community_insights: {
        local_food_events: Array<{
            event_name: string;
            date: string;
            page: string;
            engagement: number;
        }>;
        restaurant_promotions: Array<{
            restaurant: string;
            promotion_type: string;
            engagement: number;
        }>;
        community_discussions: Array<{
            topic: string;
            sentiment: number;
            participation_level: number;
        }>;
    };
    trend_analysis: {
        emerging_restaurants: string[];
        popular_cuisines: Array<{
            cuisine: string;
            mention_count: number;
            sentiment: number;
        }>;
        seasonal_trends: string[];
    };
}
export declare class FacebookScraperService {
    private readonly apifyClient;
    private readonly logger;
    private readonly ACTOR_ID;
    constructor(apifyClient: ApifyClientService);
    scrapeFacebookFoodPages(location: string, categories?: string[]): Promise<FacebookIntelligenceData>;
    private generateFoodPageUrls;
    private generateFoodKeywords;
    private analyzeFacebookData;
    private calculatePageEngagement;
    private extractEventMentions;
    private calculateCommunitySentiment;
    private analyzeSentiment;
    private analyzePageInsights;
    private identifyViralPatterns;
    private analyzeCommunityInsights;
    private extractEventInfo;
    private classifyPromotion;
    private findPostsAboutTopic;
    private analyzeTrends;
    private extractRestaurantNames;
    private getFallbackData;
}
