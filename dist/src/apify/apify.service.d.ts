import { InstagramScraperService } from '../external-apis/apify/instagram-scraper.service';
import { TwitterScraperService } from '../external-apis/apify/twitter-scraper.service';
import { RedditScraperService } from '../external-apis/apify/reddit-scraper.service';
import { TikTokScraperService } from '../external-apis/apify/tiktok-scraper.service';
import { YouTubeScraperService } from '../external-apis/apify/youtube-scraper.service';
import { FacebookScraperService } from '../external-apis/apify/facebook-scraper.service';
import { ApifyClientService } from '../external-apis/apify/apify-client.service';
import { ApifyUsageMetricsResponse, ApifyJobStatusResponse, ApifyCostEstimationResponse, ApifyOptimizationResponse } from './dto/apify.dto';
export declare class ApifyService {
    private readonly instagramScraper;
    private readonly twitterScraper;
    private readonly redditScraper;
    private readonly tiktokScraper;
    private readonly youtubeScraper;
    private readonly facebookScraper;
    private readonly apifyClient;
    private readonly logger;
    constructor(instagramScraper: InstagramScraperService, twitterScraper: TwitterScraperService, redditScraper: RedditScraperService, tiktokScraper: TikTokScraperService, youtubeScraper: YouTubeScraperService, facebookScraper: FacebookScraperService, apifyClient: ApifyClientService);
    scrapeInstagramFoodTrends(location: string, categories: string[]): Promise<import("../external-apis/apify/instagram-scraper.service").InstagramIntelligenceData>;
    scrapeTwitterFoodMentions(location: string, categories: string[]): Promise<import("../external-apis/apify/twitter-scraper.service").TwitterIntelligenceData>;
    scrapeRedditFoodDiscussions(location: string, categories: string[]): Promise<import("../external-apis/apify/reddit-scraper.service").RedditIntelligenceData>;
    scrapeTikTokFoodTrends(location: string, categories: string[]): Promise<import("../external-apis/apify/tiktok-scraper.service").TikTokIntelligenceData>;
    scrapeYouTubeFoodReviews(location: string, categories: string[]): Promise<import("../external-apis/apify/youtube-scraper.service").YouTubeIntelligenceData>;
    scrapeFacebookFoodPages(location: string, categories: string[]): Promise<import("../external-apis/apify/facebook-scraper.service").FacebookIntelligenceData>;
    orchestrateComprehensiveSocialIntelligence(location: string, categories: string[], userPreferences: any): Promise<{
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
    getScrapingJobStatus(jobId: string): Promise<ApifyJobStatusResponse>;
    getUsageMetrics(): Promise<ApifyUsageMetricsResponse>;
    estimateScrapingCost(platform: string, dataSize: number): Promise<ApifyCostEstimationResponse>;
    generateOptimizationSuggestions(currentUsage: any): Promise<ApifyOptimizationResponse>;
}
