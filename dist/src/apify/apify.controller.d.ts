import { ApifyService } from './apify.service';
import { ApifyFoodTrendRequest, ApifyTwitterMentionsRequest, ApifyRedditDiscussionsRequest, ApifyTikTokTrendsRequest, ApifyYouTubeReviewsRequest, ApifyFacebookPagesRequest, ApifyComprehensiveRequest, ApifyUsageMetricsResponse } from './dto/apify.dto';
export declare class ApifyController {
    private readonly apifyService;
    private readonly logger;
    constructor(apifyService: ApifyService);
    getInstagramFoodTrends(request: ApifyFoodTrendRequest): Promise<import("../external-apis/apify/instagram-scraper.service").InstagramIntelligenceData>;
    getTwitterFoodMentions(request: ApifyTwitterMentionsRequest): Promise<import("../external-apis/apify/twitter-scraper.service").TwitterIntelligenceData>;
    getRedditFoodDiscussions(request: ApifyRedditDiscussionsRequest): Promise<import("../external-apis/apify/reddit-scraper.service").RedditIntelligenceData>;
    getTikTokViralFoodContent(request: ApifyTikTokTrendsRequest): Promise<import("../external-apis/apify/tiktok-scraper.service").TikTokIntelligenceData>;
    getYouTubeFoodReviews(request: ApifyYouTubeReviewsRequest): Promise<import("../external-apis/apify/youtube-scraper.service").YouTubeIntelligenceData>;
    getFacebookFoodPages(request: ApifyFacebookPagesRequest): Promise<import("../external-apis/apify/facebook-scraper.service").FacebookIntelligenceData>;
    getScrapingJobStatus(jobId: string): Promise<import("./dto/apify.dto").ApifyJobStatusResponse>;
    getComprehensiveSocialIntelligence(request: ApifyComprehensiveRequest): Promise<{
        instagram: import("../external-apis/apify/instagram-scraper.service").InstagramIntelligenceData | {
            posts: any[];
            error: string;
        };
        twitter: import("../external-apis/apify/twitter-scraper.service").TwitterIntelligenceData | {
            tweets: any[];
            error: string;
        };
        reddit: import("../external-apis/apify/reddit-scraper.service").RedditIntelligenceData | {
            discussions: any[];
            error: string;
        };
        tiktok: import("../external-apis/apify/tiktok-scraper.service").TikTokIntelligenceData | {
            videos: any[];
            error: string;
        };
        youtube: import("../external-apis/apify/youtube-scraper.service").YouTubeIntelligenceData | {
            videos: any[];
            error: string;
        };
        facebook: import("../external-apis/apify/facebook-scraper.service").FacebookIntelligenceData | {
            posts: any[];
            error: string;
        };
        summary: {
            totalSources: 6;
            successfulSources: number;
            failedSources: number;
            location: string;
            categories: string[];
            timestamp: string;
        };
    }>;
    getUsageMetrics(): Promise<ApifyUsageMetricsResponse>;
    estimateScrapingCost(request: {
        platform: string;
        data_size: number;
    }): Promise<import("./dto/apify.dto").ApifyCostEstimationResponse>;
    getUsageOptimizationSuggestions(request: {
        current_usage: any;
    }): Promise<import("./dto/apify.dto").ApifyOptimizationResponse>;
}
