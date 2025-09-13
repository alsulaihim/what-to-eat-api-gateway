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
var ApifySocialIntelligenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApifySocialIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const instagram_scraper_service_1 = require("../external-apis/apify/instagram-scraper.service");
const twitter_scraper_service_1 = require("../external-apis/apify/twitter-scraper.service");
const reddit_scraper_service_1 = require("../external-apis/apify/reddit-scraper.service");
const tiktok_scraper_service_1 = require("../external-apis/apify/tiktok-scraper.service");
const youtube_scraper_service_1 = require("../external-apis/apify/youtube-scraper.service");
const facebook_scraper_service_1 = require("../external-apis/apify/facebook-scraper.service");
const apify_client_service_1 = require("../external-apis/apify/apify-client.service");
let ApifySocialIntelligenceService = ApifySocialIntelligenceService_1 = class ApifySocialIntelligenceService {
    instagramScraper;
    twitterScraper;
    redditScraper;
    tiktokScraper;
    youtubeScraper;
    facebookScraper;
    apifyClient;
    logger = new common_1.Logger(ApifySocialIntelligenceService_1.name);
    constructor(instagramScraper, twitterScraper, redditScraper, tiktokScraper, youtubeScraper, facebookScraper, apifyClient) {
        this.instagramScraper = instagramScraper;
        this.twitterScraper = twitterScraper;
        this.redditScraper = redditScraper;
        this.tiktokScraper = tiktokScraper;
        this.youtubeScraper = youtubeScraper;
        this.facebookScraper = facebookScraper;
        this.apifyClient = apifyClient;
    }
    async orchestrateSocialIntelligence(location, categories = []) {
        try {
            this.logger.log(`Starting comprehensive social media intelligence for ${location}`);
            const scrapingResults = await Promise.allSettled([
                this.instagramScraper.scrapeInstagramFoodTrends(location, categories),
                this.twitterScraper.scrapeTwitterFoodMentions(location, categories),
                this.redditScraper.scrapeRedditFoodDiscussions(location, categories),
                this.tiktokScraper.scrapeTikTokFoodTrends(location, categories),
                this.youtubeScraper.scrapeYouTubeFoodReviews(location, categories),
                this.facebookScraper.scrapeFacebookFoodPages(location, categories),
            ]);
            const [instagramResult, twitterResult, redditResult, tiktokResult, youtubeResult, facebookResult] = scrapingResults;
            const instagramData = instagramResult.status === 'fulfilled'
                ? instagramResult.value
                : this.getFallbackInstagramData();
            const twitterData = twitterResult.status === 'fulfilled'
                ? twitterResult.value
                : this.getFallbackTwitterData();
            const redditData = redditResult.status === 'fulfilled'
                ? redditResult.value
                : this.getFallbackRedditData();
            const tiktokData = tiktokResult.status === 'fulfilled'
                ? tiktokResult.value
                : this.getFallbackTikTokData();
            const youtubeData = youtubeResult.status === 'fulfilled'
                ? youtubeResult.value
                : this.getFallbackYouTubeData();
            const facebookData = facebookResult.status === 'fulfilled'
                ? facebookResult.value
                : this.getFallbackFacebookData();
            scrapingResults.forEach((result, index) => {
                const platforms = ['Instagram', 'Twitter', 'Reddit', 'TikTok', 'YouTube', 'Facebook'];
                if (result.status === 'rejected') {
                    this.logger.warn(`${platforms[index]} scraping failed: ${result.reason?.message || 'Unknown error'}`);
                }
            });
            const crossPlatformAnalysis = this.analyzeCrossPlatformData(instagramData, twitterData, redditData, tiktokData, youtubeData, facebookData);
            const aiInsights = await this.generateAIInsights(crossPlatformAnalysis);
            const costTracking = await this.calculateCostTracking();
            const socialIntelligence = {
                platform_data: {
                    instagram: {
                        posts_analyzed: instagramData.posts_analyzed,
                        trending_hashtags: instagramData.trending_hashtags,
                        viral_restaurants: instagramData.viral_restaurants,
                        user_sentiment: instagramData.user_sentiment,
                        engagement_metrics: instagramData.engagement_metrics,
                    },
                    twitter: {
                        tweets_analyzed: twitterData.tweets_analyzed,
                        trending_topics: twitterData.trending_topics,
                        mention_sentiment: twitterData.mention_sentiment,
                        retweet_velocity: twitterData.retweet_velocity,
                        influence_metrics: twitterData.influence_metrics,
                    },
                    reddit: {
                        discussions_analyzed: redditData.discussions_analyzed,
                        hot_topics: redditData.hot_topics,
                        community_recommendations: redditData.community_recommendations,
                        upvote_sentiment: redditData.upvote_sentiment,
                        subreddit_activity: redditData.subreddit_activity,
                    },
                    tiktok: {
                        videos_analyzed: tiktokData.videos_analyzed,
                        viral_food_trends: tiktokData.viral_food_trends,
                        hashtag_performance: tiktokData.hashtag_performance,
                        creator_influence: tiktokData.creator_influence,
                    },
                    youtube: {
                        videos_analyzed: youtubeData.videos_analyzed,
                        review_sentiment: youtubeData.review_sentiment,
                        channel_recommendations: youtubeData.channel_recommendations,
                        trending_food_content: youtubeData.trending_food_content,
                        subscriber_influence: youtubeData.subscriber_influence,
                    },
                    facebook: {
                        posts_analyzed: facebookData.posts_analyzed,
                        page_engagement: facebookData.page_engagement,
                        event_mentions: facebookData.event_mentions,
                        community_sentiment: facebookData.community_sentiment,
                    },
                },
                cross_platform_analysis: crossPlatformAnalysis,
                ai_social_insights: aiInsights,
                cost_tracking: costTracking,
            };
            this.logger.log(`Completed social media intelligence analysis for ${location}`);
            return socialIntelligence;
        }
        catch (error) {
            this.logger.error(`Social media intelligence failed for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
            return this.getFallbackSocialIntelligence();
        }
    }
    analyzeCrossPlatformData(instagram, twitter, reddit, tiktok, youtube, facebook) {
        const sentiments = [
            { platform: 'instagram', sentiment: instagram.user_sentiment, weight: 0.2 },
            { platform: 'twitter', sentiment: twitter.mention_sentiment, weight: 0.25 },
            { platform: 'reddit', sentiment: reddit.upvote_sentiment, weight: 0.15 },
            { platform: 'tiktok', sentiment: 0.5, weight: 0.15 },
            { platform: 'youtube', sentiment: youtube.review_sentiment, weight: 0.15 },
            { platform: 'facebook', sentiment: facebook.community_sentiment, weight: 0.1 },
        ];
        const unifiedSentiment = sentiments.reduce((sum, item) => {
            return sum + (item.sentiment * item.weight);
        }, 0);
        const allTrends = [
            ...instagram.trending_hashtags.map(h => h.replace('#', '')),
            ...twitter.trending_topics.map(t => t.replace('#', '')),
            ...reddit.hot_topics,
            ...tiktok.viral_food_trends,
            ...youtube.trending_food_content,
            ...facebook.event_mentions,
        ];
        const trendCounts = new Map();
        allTrends.forEach(trend => {
            const normalizedTrend = trend.toLowerCase();
            trendCounts.set(normalizedTrend, (trendCounts.get(normalizedTrend) || 0) + 1);
        });
        const viralConvergence = Array.from(trendCounts.entries())
            .filter(([_, count]) => count >= 3)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([trend]) => trend);
        const platformInfluence = [
            { platform: 'Instagram', score: instagram.posts_analyzed * 0.3 + instagram.engagement_metrics.avg_likes * 0.001 },
            { platform: 'Twitter', score: twitter.tweets_analyzed * 0.4 + twitter.influence_metrics.follower_reach * 0.0001 },
            { platform: 'Reddit', score: reddit.discussions_analyzed * 0.5 + Object.keys(reddit.subreddit_activity).length * 10 },
            { platform: 'TikTok', score: tiktok.videos_analyzed * 0.6 + tiktok.creator_influence.trend_adoption_rate * 100 },
            { platform: 'YouTube', score: youtube.videos_analyzed * 0.7 + youtube.subscriber_influence * 50 },
            { platform: 'Facebook', score: facebook.posts_analyzed * 0.2 + facebook.page_engagement * 100 },
        ];
        const platformInfluenceRanking = platformInfluence
            .sort((a, b) => b.score - a.score)
            .map(item => item.platform);
        const emergingTrends = viralConvergence.slice(0, 3);
        const peakTrends = viralConvergence.slice(3, 6);
        const decliningTrends = viralConvergence.slice(6, 8);
        return {
            unified_sentiment: Math.max(-1, Math.min(1, unifiedSentiment)),
            viral_convergence: viralConvergence,
            platform_influence_ranking: platformInfluenceRanking,
            trend_lifecycle: {
                emerging: emergingTrends,
                peak: peakTrends,
                declining: decliningTrends,
            },
        };
    }
    async generateAIInsights(crossPlatformData) {
        const authenticityScore = crossPlatformData.viral_convergence.length > 0 ? 0.8 : 0.4;
        const platformCount = crossPlatformData.platform_influence_ranking.length;
        const trendSustainability = Math.min(1, platformCount / 6);
        let localVsGlobal = 'mixed';
        if (crossPlatformData.viral_convergence.length > 5) {
            localVsGlobal = 'global';
        }
        else if (crossPlatformData.viral_convergence.length < 2) {
            localVsGlobal = 'local';
        }
        const demographicAppeal = ['millennials', 'gen z', 'food enthusiasts'];
        const optimalTiming = 'peak posting hours: 11am-2pm, 6pm-9pm';
        return {
            authenticity_score: authenticityScore,
            trend_sustainability: trendSustainability,
            local_vs_global: localVsGlobal,
            demographic_appeal: demographicAppeal,
            optimal_recommendation_timing: optimalTiming,
        };
    }
    async calculateCostTracking() {
        try {
            const usageMetrics = await this.apifyClient.getUsageMetrics();
            return {
                apify_units_consumed: usageMetrics.current_usage,
                estimated_monthly_cost: usageMetrics.daily_limit * 30,
                cost_per_intelligence_query: usageMetrics.current_usage > 0 ? usageMetrics.daily_limit / usageMetrics.current_usage : 0,
                optimization_suggestions: [
                    'Enable intelligent caching for 15-30 minutes',
                    'Focus scraping on peak engagement hours',
                    'Use geo-targeting to reduce irrelevant content',
                    'Implement result deduplication'
                ],
            };
        }
        catch (error) {
            this.logger.warn('Failed to calculate cost tracking:', error instanceof Error ? error.message : 'Unknown error');
            return {
                apify_units_consumed: 0,
                estimated_monthly_cost: 0,
                cost_per_intelligence_query: 0,
                optimization_suggestions: [],
            };
        }
    }
    async orchestrateDemographicFilteredIntelligence(location, categories = [], demographicFilter) {
        try {
            this.logger.log(`Starting demographic-filtered social media intelligence for ${location}`);
            if (!demographicFilter) {
                return this.orchestrateSocialIntelligence(location, categories);
            }
            const demographicHashtags = this.generateDemographicHashtags(demographicFilter);
            const demographicKeywords = this.generateDemographicKeywords(demographicFilter);
            const enhancedCategories = this.enhanceCategoriesWithDemographics(categories, demographicFilter);
            const scrapingResults = await Promise.allSettled([
                this.instagramScraper.scrapeInstagramFoodTrends(location, enhancedCategories),
                this.twitterScraper.scrapeTwitterFoodMentions(location, enhancedCategories),
                this.redditScraper.scrapeRedditFoodDiscussions(location, enhancedCategories),
                this.tiktokScraper.scrapeTikTokFoodTrends(location, enhancedCategories),
                this.youtubeScraper.scrapeYouTubeFoodReviews(location, enhancedCategories),
                this.facebookScraper.scrapeFacebookFoodPages(location, enhancedCategories),
            ]);
            const [instagramResult, twitterResult, redditResult, tiktokResult, youtubeResult, facebookResult] = scrapingResults;
            const instagramData = instagramResult.status === 'fulfilled'
                ? this.applyDemographicFilter(instagramResult.value, demographicFilter, 'instagram')
                : this.getFallbackInstagramData();
            const twitterData = twitterResult.status === 'fulfilled'
                ? this.applyDemographicFilter(twitterResult.value, demographicFilter, 'twitter')
                : this.getFallbackTwitterData();
            const redditData = redditResult.status === 'fulfilled'
                ? this.applyDemographicFilter(redditResult.value, demographicFilter, 'reddit')
                : this.getFallbackRedditData();
            const tiktokData = tiktokResult.status === 'fulfilled'
                ? this.applyDemographicFilter(tiktokResult.value, demographicFilter, 'tiktok')
                : this.getFallbackTikTokData();
            const youtubeData = youtubeResult.status === 'fulfilled'
                ? this.applyDemographicFilter(youtubeResult.value, demographicFilter, 'youtube')
                : this.getFallbackYouTubeData();
            const facebookData = facebookResult.status === 'fulfilled'
                ? this.applyDemographicFilter(facebookResult.value, demographicFilter, 'facebook')
                : this.getFallbackFacebookData();
            const crossPlatformAnalysis = this.analyzeDemographicCrossPlatformData(instagramData, twitterData, redditData, tiktokData, youtubeData, facebookData, demographicFilter);
            const aiInsights = this.generateDemographicAIInsights(instagramData, twitterData, redditData, tiktokData, youtubeData, facebookData, demographicFilter);
            const costTracking = await this.calculateDemographicFilteringCosts(demographicFilter);
            const socialIntelligence = {
                platform_data: {
                    instagram: {
                        posts_analyzed: instagramData.posts_analyzed,
                        trending_hashtags: instagramData.trending_hashtags,
                        viral_restaurants: instagramData.viral_restaurants,
                        user_sentiment: instagramData.user_sentiment,
                        engagement_metrics: instagramData.engagement_metrics,
                    },
                    twitter: {
                        tweets_analyzed: twitterData.tweets_analyzed,
                        trending_topics: twitterData.trending_topics,
                        mention_sentiment: twitterData.mention_sentiment,
                        retweet_velocity: twitterData.retweet_velocity,
                        influence_metrics: twitterData.influence_metrics,
                    },
                    reddit: {
                        discussions_analyzed: redditData.discussions_analyzed,
                        hot_topics: redditData.hot_topics,
                        community_recommendations: redditData.community_recommendations,
                        upvote_sentiment: redditData.upvote_sentiment,
                        subreddit_activity: redditData.subreddit_activity,
                    },
                    tiktok: {
                        videos_analyzed: tiktokData.videos_analyzed,
                        viral_food_trends: tiktokData.viral_food_trends,
                        hashtag_performance: tiktokData.hashtag_performance,
                        creator_influence: tiktokData.creator_influence,
                    },
                    youtube: {
                        videos_analyzed: youtubeData.videos_analyzed,
                        review_sentiment: youtubeData.review_sentiment,
                        channel_recommendations: youtubeData.channel_recommendations,
                        trending_food_content: youtubeData.trending_food_content,
                        subscriber_influence: youtubeData.subscriber_influence,
                    },
                    facebook: {
                        posts_analyzed: facebookData.posts_analyzed,
                        page_engagement: facebookData.page_engagement,
                        event_mentions: facebookData.event_mentions,
                        community_sentiment: facebookData.community_sentiment,
                    },
                },
                cross_platform_analysis: crossPlatformAnalysis,
                ai_social_insights: aiInsights,
                cost_tracking: costTracking,
            };
            this.logger.log(`Completed demographic-filtered social media intelligence analysis for ${location}`);
            return socialIntelligence;
        }
        catch (error) {
            this.logger.error(`Demographic-filtered social media intelligence failed for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
            return this.getFallbackSocialIntelligence();
        }
    }
    generateDemographicHashtags(filter) {
        const hashtags = [];
        if (filter.ageGroups) {
            filter.ageGroups.forEach(age => {
                switch (age) {
                    case '18-24':
                        hashtags.push('#genz', '#trendy', '#viral', '#youthfood');
                        break;
                    case '25-34':
                        hashtags.push('#millennial', '#foodie', '#brunch', '#craftcocktails');
                        break;
                    case '35-44':
                        hashtags.push('#familydining', '#workingparents', '#healthyeating');
                        break;
                    case '45-54':
                        hashtags.push('#finedining', '#quality', '#mature');
                        break;
                    case '55+':
                        hashtags.push('#classic', '#traditional', '#comfort');
                        break;
                }
            });
        }
        if (filter.culturalBackgrounds) {
            filter.culturalBackgrounds.forEach(culture => {
                switch (culture) {
                    case 'asian':
                        hashtags.push('#asianfood', '#authentic', '#umami', '#noodles');
                        break;
                    case 'hispanic_latino':
                        hashtags.push('#latinofood', '#tacos', '#salsa', '#sabor');
                        break;
                    case 'middle_eastern':
                        hashtags.push('#mediterranean', '#halal', '#kebab', '#hummus');
                        break;
                    case 'black':
                        hashtags.push('#soulfood', '#caribbean', '#jerk', '#comfort');
                        break;
                }
            });
        }
        return hashtags;
    }
    generateDemographicKeywords(filter) {
        const keywords = ['food', 'restaurant', 'dining'];
        if (filter.incomeBrackets) {
            filter.incomeBrackets.forEach(income => {
                switch (income) {
                    case 'low':
                        keywords.push('budget', 'cheap', 'affordable', 'value');
                        break;
                    case 'high':
                        keywords.push('luxury', 'premium', 'upscale', 'fine dining');
                        break;
                    case 'middle':
                        keywords.push('casual', 'moderate', 'quality');
                        break;
                }
            });
        }
        if (filter.familyStructures) {
            filter.familyStructures.forEach(family => {
                switch (family) {
                    case 'family_with_kids':
                        keywords.push('family friendly', 'kids menu', 'playground');
                        break;
                    case 'couple':
                        keywords.push('romantic', 'date night', 'intimate');
                        break;
                    case 'single':
                        keywords.push('solo dining', 'counter seating', 'quick');
                        break;
                }
            });
        }
        return keywords;
    }
    enhanceCategoriesWithDemographics(categories, filter) {
        const enhanced = [...categories];
        if (filter.culturalBackgrounds) {
            filter.culturalBackgrounds.forEach(culture => {
                switch (culture) {
                    case 'asian':
                        enhanced.push('chinese', 'japanese', 'korean', 'thai', 'vietnamese', 'indian');
                        break;
                    case 'hispanic_latino':
                        enhanced.push('mexican', 'spanish', 'peruvian', 'cuban');
                        break;
                    case 'middle_eastern':
                        enhanced.push('mediterranean', 'turkish', 'lebanese', 'greek');
                        break;
                }
            });
        }
        return [...new Set(enhanced)];
    }
    applyDemographicFilter(platformData, filter, platform) {
        const filtered = { ...platformData };
        if (filter.minSpiceTolerance || filter.maxSpiceTolerance) {
            if (platform === 'instagram' && filtered.trending_hashtags) {
                filtered.trending_hashtags = filtered.trending_hashtags.filter((hashtag) => {
                    const isSpicy = hashtag.toLowerCase().includes('spicy') || hashtag.toLowerCase().includes('hot');
                    return !isSpicy || (filter.minSpiceTolerance && filter.minSpiceTolerance >= 6);
                });
            }
        }
        if (filter.minAuthenticityPreference) {
            if (platform === 'reddit' && filtered.community_recommendations) {
                filtered.community_recommendations = filtered.community_recommendations.map((rec) => ({
                    ...rec,
                    authenticity_boost: filter.minAuthenticityPreference >= 7 ? 1.3 : 1.0
                }));
            }
        }
        return filtered;
    }
    analyzeDemographicCrossPlatformData(instagram, twitter, reddit, tiktok, youtube, facebook, filter) {
        const baseAnalysis = this.analyzeCrossPlatformData(instagram, twitter, reddit, tiktok, youtube, facebook);
        return {
            ...baseAnalysis,
            demographic_insights: {
                age_group_trends: this.analyzeDemographicTrends(filter, 'age'),
                cultural_preferences: this.analyzeDemographicTrends(filter, 'culture'),
                income_patterns: this.analyzeDemographicTrends(filter, 'income'),
                family_dining_trends: this.analyzeDemographicTrends(filter, 'family'),
            }
        };
    }
    analyzeDemographicTrends(filter, category) {
        const trends = [];
        switch (category) {
            case 'age':
                if (filter.ageGroups?.includes('18-24')) {
                    trends.push('Social media worthy presentation', 'Late night dining', 'Trendy fusion');
                }
                if (filter.ageGroups?.includes('25-34')) {
                    trends.push('Craft cocktails', 'Brunch culture', 'Instagrammable food');
                }
                break;
            case 'culture':
                if (filter.culturalBackgrounds?.includes('asian')) {
                    trends.push('Authentic regional cuisines', 'Tea culture', 'Family style dining');
                }
                break;
            case 'income':
                if (filter.incomeBrackets?.includes('high')) {
                    trends.push('Premium ingredients', 'Chef collaborations', 'Exclusive experiences');
                }
                break;
        }
        return trends;
    }
    generateDemographicAIInsights(instagram, twitter, reddit, tiktok, youtube, facebook, filter) {
        const baseInsights = this.generateAIInsights({
            instagram, twitter, reddit, tiktok, youtube, facebook
        });
        return {
            ...baseInsights,
            demographic_appeal: this.calculateDemographicAppeal(filter),
            cultural_authenticity: this.assessCulturalAuthenticity(filter),
            age_appropriate_venues: this.identifyAgeAppropriateVenues(filter),
            income_aligned_options: this.findIncomeAlignedOptions(filter),
        };
    }
    calculateDemographicAppeal(filter) {
        const appeal = [];
        if (filter.ageGroups?.includes('18-24')) {
            appeal.push('High social media presence', 'Trendy atmosphere', 'Late hours');
        }
        if (filter.culturalBackgrounds?.includes('asian')) {
            appeal.push('Authentic flavors', 'Traditional preparation', 'Cultural significance');
        }
        return appeal;
    }
    assessCulturalAuthenticity(filter) {
        if (filter.minAuthenticityPreference) {
            return filter.minAuthenticityPreference / 10;
        }
        return 0.7;
    }
    identifyAgeAppropriateVenues(filter) {
        const venues = [];
        if (filter.ageGroups?.includes('18-24')) {
            venues.push('Trendy cafes', 'Food trucks', 'Late night spots');
        }
        if (filter.ageGroups?.includes('35-44')) {
            venues.push('Family restaurants', 'Wine bars', 'Quiet atmospheres');
        }
        return venues;
    }
    findIncomeAlignedOptions(filter) {
        const options = [];
        if (filter.incomeBrackets?.includes('low')) {
            options.push('Value meals', 'Happy hours', 'Lunch specials');
        }
        if (filter.incomeBrackets?.includes('high')) {
            options.push('Tasting menus', 'Premium ingredients', 'Wine pairings');
        }
        return options;
    }
    async calculateDemographicFilteringCosts(filter) {
        try {
            const baseCosts = await this.calculateCostTracking();
            const demographicMultiplier = filter ? 1.2 : 1.0;
            return {
                ...baseCosts,
                apify_units_consumed: baseCosts.apify_units_consumed * demographicMultiplier,
                estimated_monthly_cost: baseCosts.estimated_monthly_cost * demographicMultiplier,
                demographic_filtering_overhead: filter ? 0.2 : 0,
                optimization_suggestions: [
                    ...baseCosts.optimization_suggestions,
                    ...(filter ? ['Cache demographic filters for repeated queries', 'Optimize hashtag/keyword combinations'] : [])
                ]
            };
        }
        catch (error) {
            this.logger.warn('Failed to calculate demographic filtering costs:', error instanceof Error ? error.message : 'Unknown error');
            return await this.calculateCostTracking();
        }
    }
    getFallbackInstagramData() {
        return {
            posts_analyzed: 0,
            trending_hashtags: [],
            viral_restaurants: [],
            user_sentiment: 0,
            engagement_metrics: { avg_likes: 0, avg_comments: 0, top_influencers: [] },
        };
    }
    getFallbackTwitterData() {
        return {
            tweets_analyzed: 0,
            trending_topics: [],
            mention_sentiment: 0,
            retweet_velocity: 0,
            influence_metrics: { verified_mentions: 0, follower_reach: 0 },
        };
    }
    getFallbackRedditData() {
        return {
            discussions_analyzed: 0,
            hot_topics: [],
            community_recommendations: [],
            upvote_sentiment: 0.5,
            subreddit_activity: {},
        };
    }
    getFallbackTikTokData() {
        return {
            videos_analyzed: 0,
            viral_food_trends: [],
            hashtag_performance: {},
            creator_influence: { top_creators: [], trend_adoption_rate: 0 },
        };
    }
    getFallbackYouTubeData() {
        return {
            videos_analyzed: 0,
            review_sentiment: 0,
            channel_recommendations: [],
            trending_food_content: [],
            subscriber_influence: 0,
        };
    }
    getFallbackFacebookData() {
        return {
            posts_analyzed: 0,
            page_engagement: 0,
            event_mentions: [],
            community_sentiment: 0,
        };
    }
    getFallbackSocialIntelligence() {
        return {
            platform_data: {
                instagram: this.getFallbackInstagramData(),
                twitter: this.getFallbackTwitterData(),
                reddit: this.getFallbackRedditData(),
                tiktok: this.getFallbackTikTokData(),
                youtube: this.getFallbackYouTubeData(),
                facebook: this.getFallbackFacebookData(),
            },
            cross_platform_analysis: {
                unified_sentiment: 0,
                viral_convergence: [],
                platform_influence_ranking: [],
                trend_lifecycle: { emerging: [], peak: [], declining: [] },
            },
            ai_social_insights: {
                authenticity_score: 0,
                trend_sustainability: 0,
                local_vs_global: 'mixed',
                demographic_appeal: [],
                optimal_recommendation_timing: 'unknown',
            },
            cost_tracking: {
                apify_units_consumed: 0,
                estimated_monthly_cost: 0,
                cost_per_intelligence_query: 0,
                optimization_suggestions: [],
            },
        };
    }
};
exports.ApifySocialIntelligenceService = ApifySocialIntelligenceService;
exports.ApifySocialIntelligenceService = ApifySocialIntelligenceService = ApifySocialIntelligenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [instagram_scraper_service_1.InstagramScraperService,
        twitter_scraper_service_1.TwitterScraperService,
        reddit_scraper_service_1.RedditScraperService,
        tiktok_scraper_service_1.TikTokScraperService,
        youtube_scraper_service_1.YouTubeScraperService,
        facebook_scraper_service_1.FacebookScraperService,
        apify_client_service_1.ApifyClientService])
], ApifySocialIntelligenceService);
//# sourceMappingURL=apify-social-intelligence.service.js.map