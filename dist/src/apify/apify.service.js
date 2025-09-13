"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ApifyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApifyService = void 0;
const common_1 = require("@nestjs/common");
const instagram_scraper_service_1 = require("../external-apis/apify/instagram-scraper.service");
const twitter_scraper_service_1 = require("../external-apis/apify/twitter-scraper.service");
const reddit_scraper_service_1 = require("../external-apis/apify/reddit-scraper.service");
const tiktok_scraper_service_1 = require("../external-apis/apify/tiktok-scraper.service");
const youtube_scraper_service_1 = require("../external-apis/apify/youtube-scraper.service");
const facebook_scraper_service_1 = require("../external-apis/apify/facebook-scraper.service");
const apify_client_service_1 = require("../external-apis/apify/apify-client.service");
let ApifyService = ApifyService_1 = class ApifyService {
    instagramScraper;
    twitterScraper;
    redditScraper;
    tiktokScraper;
    youtubeScraper;
    facebookScraper;
    apifyClient;
    logger = new common_1.Logger(ApifyService_1.name);
    constructor(instagramScraper, twitterScraper, redditScraper, tiktokScraper, youtubeScraper, facebookScraper, apifyClient) {
        this.instagramScraper = instagramScraper;
        this.twitterScraper = twitterScraper;
        this.redditScraper = redditScraper;
        this.tiktokScraper = tiktokScraper;
        this.youtubeScraper = youtubeScraper;
        this.facebookScraper = facebookScraper;
        this.apifyClient = apifyClient;
    }
    async scrapeInstagramFoodTrends(location, categories) {
        this.logger.log(`Starting Instagram food trends scraping for ${location}`);
        return await this.instagramScraper.scrapeInstagramFoodTrends(location, categories);
    }
    async scrapeTwitterFoodMentions(location, categories) {
        this.logger.log(`Starting Twitter food mentions scraping for ${location}`);
        return await this.twitterScraper.scrapeTwitterFoodMentions(location, categories);
    }
    async scrapeRedditFoodDiscussions(location, categories) {
        this.logger.log(`Starting Reddit food discussions scraping for ${location}`);
        return await this.redditScraper.scrapeRedditFoodDiscussions(location, categories);
    }
    async scrapeTikTokFoodTrends(location, categories) {
        this.logger.log(`Starting TikTok food trends scraping for ${location}`);
        return await this.tiktokScraper.scrapeTikTokFoodTrends(location, categories);
    }
    async scrapeYouTubeFoodReviews(location, categories) {
        this.logger.log(`Starting YouTube food reviews scraping for ${location}`);
        return await this.youtubeScraper.scrapeYouTubeFoodReviews(location, categories);
    }
    async scrapeFacebookFoodPages(location, categories) {
        this.logger.log(`Starting Facebook food pages scraping for ${location}`);
        return await this.facebookScraper.scrapeFacebookFoodPages(location, categories);
    }
    async orchestrateComprehensiveSocialIntelligence(location, categories, userPreferences) {
        this.logger.log(`Starting comprehensive social intelligence for ${location}`);
        try {
            const scrapingResults = await Promise.allSettled([
                this.instagramScraper.scrapeInstagramFoodTrends(location, categories),
                this.twitterScraper.scrapeTwitterFoodMentions(location, categories),
                this.redditScraper.scrapeRedditFoodDiscussions(location, categories),
                this.tiktokScraper.scrapeTikTokFoodTrends(location, categories),
                this.youtubeScraper.scrapeYouTubeFoodReviews(location, categories),
                this.facebookScraper.scrapeFacebookFoodPages(location, categories),
            ]);
            const [instagramResult, twitterResult, redditResult, tiktokResult, youtubeResult, facebookResult] = scrapingResults;
            return {
                instagram: instagramResult.status === 'fulfilled' ? instagramResult.value : { posts: [], error: 'Instagram scraping failed' },
                twitter: twitterResult.status === 'fulfilled' ? twitterResult.value : { tweets: [], error: 'Twitter scraping failed' },
                reddit: redditResult.status === 'fulfilled' ? redditResult.value : { discussions: [], error: 'Reddit scraping failed' },
                tiktok: tiktokResult.status === 'fulfilled' ? tiktokResult.value : { videos: [], error: 'TikTok scraping failed' },
                youtube: youtubeResult.status === 'fulfilled' ? youtubeResult.value : { videos: [], error: 'YouTube scraping failed' },
                facebook: facebookResult.status === 'fulfilled' ? facebookResult.value : { posts: [], error: 'Facebook scraping failed' },
                summary: {
                    totalSources: scrapingResults.length,
                    successfulSources: scrapingResults.filter(r => r.status === 'fulfilled').length,
                    failedSources: scrapingResults.filter(r => r.status === 'rejected').length,
                    location,
                    categories,
                    timestamp: new Date().toISOString(),
                }
            };
        }
        catch (error) {
            this.logger.error('Failed to orchestrate social intelligence', error);
            throw error;
        }
    }
    async getScrapingJobStatus(jobId) {
        try {
            this.logger.log(`Checking status for job: ${jobId}`);
            const runStatus = await this.apifyClient.getActorRun(jobId);
            let progress = 0;
            switch (runStatus.status) {
                case 'READY':
                    progress = 0;
                    break;
                case 'RUNNING':
                    const startedAt = runStatus.startedAt ? new Date(runStatus.startedAt).getTime() : Date.now();
                    const runningTime = Date.now() - startedAt;
                    progress = Math.min(90, Math.floor(runningTime / 2000));
                    break;
                case 'SUCCEEDED':
                    progress = 100;
                    break;
                case 'FAILED':
                case 'TIMED-OUT':
                case 'ABORTED':
                    progress = 100;
                    break;
                default:
                    progress = 50;
            }
            const response = {
                status: runStatus.status,
                job_id: jobId,
                progress,
                items_processed: 0,
                estimated_time_remaining: runStatus.status === 'RUNNING' ? 120 : 0,
                error_message: runStatus.status === 'FAILED' ? 'Scraping job failed' : undefined,
            };
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to get job status for ${jobId}:`, error instanceof Error ? error.message : 'Unknown error');
            throw new Error(`Job status unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getUsageMetrics() {
        try {
            this.logger.log('Retrieving Apify usage metrics');
            const metrics = await this.apifyClient.getUsageMetrics();
            const response = {
                current_usage: metrics.current_usage,
                daily_limit: metrics.daily_limit,
                remaining_budget: metrics.remaining_budget,
                success_rate: metrics.success_rate,
                average_response_time: metrics.average_response_time,
                platform_costs: {
                    instagram: 45.60,
                    twitter: 65.80,
                    reddit: 15.25,
                    tiktok: 35.50,
                    youtube: 20.30,
                    facebook: 15.25,
                },
                optimization_suggestions: [
                    'Enable intelligent caching for 15-30 minutes',
                    'Focus scraping on peak engagement hours (11am-2pm, 6pm-9pm)',
                    'Use geo-targeting to reduce irrelevant content',
                    'Implement result deduplication across platforms',
                    'Schedule bulk scraping during off-peak hours',
                ],
                estimated_monthly_cost: metrics.daily_limit * 30,
            };
            return response;
        }
        catch (error) {
            this.logger.error('Failed to get usage metrics:', error instanceof Error ? error.message : 'Unknown error');
            throw new Error(`Usage metrics unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async estimateScrapingCost(platform, dataSize) {
        try {
            this.logger.log(`Estimating cost for ${platform} scraping (${dataSize} items)`);
            const actorMap = {
                instagram: 'apify/instagram-scraper',
                twitter: 'apify/twitter-scraper',
                reddit: 'apify/reddit-scraper',
                tiktok: 'apify/tiktok-scraper',
                youtube: 'apify/youtube-scraper',
                facebook: 'apify/facebook-pages-scraper',
            };
            const actorId = actorMap[platform] || 'apify/instagram-scraper';
            const costEstimate = await this.apifyClient.estimateCost(actorId, dataSize);
            const response = {
                estimated_units: costEstimate.estimated_units,
                estimated_cost_usd: costEstimate.estimated_cost_usd,
                fits_daily_budget: costEstimate.fits_daily_budget,
                estimated_completion_time: Math.max(2, Math.min(30, dataSize / 50)),
            };
            return response;
        }
        catch (error) {
            this.logger.error(`Cost estimation failed for ${platform}:`, error instanceof Error ? error.message : 'Unknown error');
            throw new Error(`Cost estimation unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async generateOptimizationSuggestions(currentUsage) {
        try {
            this.logger.log('Generating Apify usage optimization suggestions');
            const suggestions = [
                {
                    type: 'caching',
                    description: 'Implement intelligent caching to store results for 15-30 minutes and avoid redundant scraping',
                    potential_savings: 25,
                    difficulty: 'easy',
                },
                {
                    type: 'scheduling',
                    description: 'Schedule bulk scraping operations during off-peak hours (2am-6am local time) for cost efficiency',
                    potential_savings: 20,
                    difficulty: 'medium',
                },
                {
                    type: 'geo-targeting',
                    description: 'Use precise geo-targeting to focus on relevant local content and reduce data processing',
                    potential_savings: 15,
                    difficulty: 'easy',
                },
                {
                    type: 'deduplication',
                    description: 'Implement cross-platform result deduplication to avoid processing duplicate content',
                    potential_savings: 30,
                    difficulty: 'medium',
                },
                {
                    type: 'rate-optimization',
                    description: 'Optimize request rates based on platform-specific limits to avoid penalties and retries',
                    potential_savings: 10,
                    difficulty: 'hard',
                },
                {
                    type: 'selective-fields',
                    description: 'Only scrape necessary data fields to reduce processing time and costs',
                    potential_savings: 18,
                    difficulty: 'easy',
                },
            ];
            const relevantSuggestions = suggestions.filter(suggestion => {
                return true;
            });
            const currentEfficiency = 0.78;
            const potentialSavings = relevantSuggestions.reduce((total, suggestion) => {
                return total + suggestion.potential_savings;
            }, 0);
            const response = {
                suggestions: relevantSuggestions,
                current_efficiency: currentEfficiency,
                potential_efficiency: Math.min(0.98, currentEfficiency + (potentialSavings / 1000)),
                total_potential_savings: 125.50,
            };
            return response;
        }
        catch (error) {
            this.logger.error('Failed to generate optimization suggestions:', error instanceof Error ? error.message : 'Unknown error');
            throw new Error(`Optimization suggestions unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
};
exports.ApifyService = ApifyService;
exports.ApifyService = ApifyService = ApifyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [instagram_scraper_service_1.InstagramScraperService,
        twitter_scraper_service_1.TwitterScraperService,
        reddit_scraper_service_1.RedditScraperService,
        tiktok_scraper_service_1.TikTokScraperService,
        youtube_scraper_service_1.YouTubeScraperService,
        facebook_scraper_service_1.FacebookScraperService,
        apify_client_service_1.ApifyClientService])
], ApifyService);
//# sourceMappingURL=apify.service.js.map