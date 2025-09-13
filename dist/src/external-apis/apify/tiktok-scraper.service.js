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
var TikTokScraperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikTokScraperService = void 0;
const common_1 = require("@nestjs/common");
const apify_client_service_1 = require("./apify-client.service");
let TikTokScraperService = TikTokScraperService_1 = class TikTokScraperService {
    apifyClient;
    logger = new common_1.Logger(TikTokScraperService_1.name);
    ACTOR_ID = 'apify/tiktok-scraper';
    constructor(apifyClient) {
        this.apifyClient = apifyClient;
    }
    async scrapeTikTokFoodTrends(location, categories = []) {
        try {
            const hashtags = this.generateFoodHashtags(location, categories);
            const keywords = this.generateFoodKeywords(location);
            const input = {
                hashtags: hashtags.slice(0, 8),
                keywords: keywords.slice(0, 5),
                video_limit: 150,
            };
            const costEstimate = await this.apifyClient.estimateCost(this.ACTOR_ID, input.video_limit);
            if (!costEstimate.fits_daily_budget) {
                this.logger.warn(`TikTok scraping exceeds daily budget: $${costEstimate.estimated_cost_usd}`);
                return this.getFallbackData();
            }
            this.logger.log(`Starting TikTok scraping for ${location} (estimated cost: $${costEstimate.estimated_cost_usd})`);
            const run = await this.apifyClient.runActor(this.ACTOR_ID, {
                hashtags: input.hashtags,
                resultsPerPage: input.video_limit,
                shouldDownloadCovers: false,
                shouldDownloadVideos: false,
                extendOutputFunction: `($) => {
          const text = ($.text || '').toLowerCase();
          return {
            foodContent: /(food|eat|delicious|yummy|recipe|cooking|restaurant|chef|meal|taste|hungry|craving)/gi.test(text),
            locationMentioned: text.includes('${location.toLowerCase()}'),
            viralScore: ($.stats?.diggCount || 0) + ($.stats?.shareCount || 0) * 3 + ($.stats?.playCount || 0) * 0.1,
            hashtags: $.challenges?.map(c => c.title) || [],
            mentions: $.mentions || []
          }
        }`,
            });
            const videos = await this.apifyClient.getDatasetItems(run.defaultDatasetId, {
                limit: input.video_limit,
                clean: true,
            });
            return this.analyzeTikTokData(videos, location);
        }
        catch (error) {
            this.logger.error(`TikTok scraping failed for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
            return this.getFallbackData();
        }
    }
    generateFoodHashtags(location, categories) {
        const cityHashtag = location.split(',')[0].toLowerCase().replace(/\s+/g, '');
        const baseHashtags = [
            '#foodtok',
            '#food',
            '#foodie',
            '#recipe',
            '#cooking',
            '#eat',
            '#yummy',
            '#delicious',
            '#restaurant',
            '#mukbang'
        ];
        const locationHashtags = [
            `#${cityHashtag}food`,
            `#${cityHashtag}eats`,
            `#eat${cityHashtag}`,
        ];
        const categoryHashtags = categories.map(cat => `#${cat.toLowerCase()}`);
        return [...baseHashtags, ...locationHashtags, ...categoryHashtags];
    }
    generateFoodKeywords(location) {
        return [
            `${location} food`,
            `${location} restaurant`,
            `${location} eats`,
            'food review',
            'restaurant review'
        ];
    }
    analyzeTikTokData(videos, location) {
        const validVideos = videos.filter(video => video && video.text && video.foodContent);
        const viralFoodTrends = this.extractViralTrends(validVideos);
        const hashtagPerformance = this.analyzeHashtagPerformance(validVideos);
        const creatorInfluence = this.analyzeCreatorInfluence(validVideos);
        const contentInsights = this.analyzeContentInsights(validVideos);
        const audienceBehavior = this.analyzeAudienceBehavior(validVideos);
        return {
            videos_analyzed: validVideos.length,
            viral_food_trends: viralFoodTrends,
            hashtag_performance: hashtagPerformance,
            creator_influence: creatorInfluence,
            content_insights: contentInsights,
            audience_behavior: audienceBehavior,
        };
    }
    extractViralTrends(videos) {
        const trendCounts = new Map();
        const foodTrends = [
            'baked feta pasta', 'dalgona coffee', 'cloud bread', 'whipped coffee',
            'pasta chips', 'nature cereal', 'feta eggs', 'corn ribs', 'birria tacos',
            'smash burgers', 'butter board', 'gigi hadid pasta', 'chicago mix',
            'protein ice cream', 'overnight oats', 'air fryer', 'sheet pan',
            'meal prep', 'healthy recipe', 'quick recipe', 'easy recipe',
            'food hack', 'cooking hack', 'kitchen hack', 'recipe hack'
        ];
        videos.forEach(video => {
            const text = video.text.toLowerCase();
            foodTrends.forEach(trend => {
                if (text.includes(trend)) {
                    if (!trendCounts.has(trend)) {
                        trendCounts.set(trend, { count: 0, totalViralScore: 0 });
                    }
                    const current = trendCounts.get(trend);
                    current.count++;
                    current.totalViralScore += video.viralScore || 0;
                    trendCounts.set(trend, current);
                }
            });
        });
        return Array.from(trendCounts.entries())
            .map(([trend, data]) => ({
            trend,
            popularity: data.count,
            avgViralScore: data.totalViralScore / data.count,
            totalScore: data.count * (data.totalViralScore / data.count),
        }))
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 12)
            .map(item => item.trend);
    }
    analyzeHashtagPerformance(videos) {
        const hashtagStats = {};
        videos.forEach(video => {
            video.hashtags?.forEach(hashtag => {
                const tag = hashtag.toLowerCase();
                if (this.isFoodRelatedHashtag(tag)) {
                    if (!hashtagStats[tag]) {
                        hashtagStats[tag] = {
                            video_count: 0,
                            total_views: 0,
                            total_engagement: 0,
                        };
                    }
                    hashtagStats[tag].video_count++;
                    hashtagStats[tag].total_views += video.stats?.playCount || 0;
                    hashtagStats[tag].total_engagement +=
                        (video.stats?.diggCount || 0) +
                            (video.stats?.shareCount || 0) +
                            (video.stats?.commentCount || 0);
                }
            });
        });
        const performance = {};
        Object.entries(hashtagStats).forEach(([hashtag, stats]) => {
            performance[hashtag] = {
                video_count: stats.video_count,
                total_views: stats.total_views,
                engagement_rate: stats.total_views > 0 ? stats.total_engagement / stats.total_views : 0,
            };
        });
        return performance;
    }
    isFoodRelatedHashtag(tag) {
        const foodKeywords = [
            'food', 'foodtok', 'recipe', 'cooking', 'eat', 'yummy', 'delicious',
            'restaurant', 'chef', 'meal', 'kitchen', 'baking', 'dessert',
            'healthy', 'vegan', 'vegetarian', 'mukbang', 'foodie', 'taste'
        ];
        return foodKeywords.some(keyword => tag.includes(keyword));
    }
    analyzeCreatorInfluence(videos) {
        const creatorStats = new Map();
        videos.forEach(video => {
            const creator = video.authorInfo?.uniqueId;
            if (!creator)
                return;
            if (!creatorStats.has(creator)) {
                creatorStats.set(creator, {
                    videos: 0,
                    totalViews: 0,
                    avgEngagement: 0,
                    verified: video.authorInfo.verified || false,
                    followers: video.authorInfo.followerCount || 0,
                });
            }
            const stats = creatorStats.get(creator);
            stats.videos++;
            stats.totalViews += video.stats?.playCount || 0;
            const engagement = (video.stats?.diggCount || 0) + (video.stats?.shareCount || 0) + (video.stats?.commentCount || 0);
            stats.avgEngagement = (stats.avgEngagement * (stats.videos - 1) + engagement) / stats.videos;
        });
        const topCreators = Array.from(creatorStats.entries())
            .sort((a, b) => {
            const scoreA = a[1].totalViews + (a[1].verified ? 100000 : 0) + a[1].followers * 0.1;
            const scoreB = b[1].totalViews + (b[1].verified ? 100000 : 0) + b[1].followers * 0.1;
            return scoreB - scoreA;
        })
            .slice(0, 10)
            .map(([creator]) => `@${creator}`);
        const creatorsWithMultipleVideos = Array.from(creatorStats.values()).filter(stats => stats.videos > 1).length;
        const trendAdoptionRate = creatorStats.size > 0 ? creatorsWithMultipleVideos / creatorStats.size : 0;
        return {
            top_creators: topCreators,
            trend_adoption_rate: trendAdoptionRate,
        };
    }
    analyzeContentInsights(videos) {
        const soundCounts = new Map();
        videos.forEach(video => {
            const sound = video.musicInfo?.title;
            if (sound) {
                if (!soundCounts.has(sound)) {
                    soundCounts.set(sound, { count: 0, totalViralScore: 0 });
                }
                const current = soundCounts.get(sound);
                current.count++;
                current.totalViralScore += video.viralScore || 0;
            }
        });
        const trendingSounds = Array.from(soundCounts.entries())
            .filter(([_, data]) => data.count >= 2)
            .sort((a, b) => b[1].totalViralScore - a[1].totalViralScore)
            .slice(0, 8)
            .map(([title, data]) => ({
            title: title.length > 40 ? title.substring(0, 37) + '...' : title,
            usage_count: data.count,
            viral_potential: data.totalViralScore / data.count,
        }));
        const formatKeywords = [
            'recipe', 'tutorial', 'review', 'try', 'taste test', 'cooking',
            'baking', 'making', 'eating', 'mukbang', 'food hack', 'quick',
            'easy', 'healthy', 'viral', 'trending'
        ];
        const formatCounts = new Map();
        videos.forEach(video => {
            const text = video.text.toLowerCase();
            formatKeywords.forEach(format => {
                if (text.includes(format)) {
                    formatCounts.set(format, (formatCounts.get(format) || 0) + 1);
                }
            });
        });
        const popularFormats = Array.from(formatCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([format]) => format);
        const viralTriggers = [
            'try this', 'you need to try', 'viral', 'trending', 'everyone is making',
            'obsessed with', 'game changer', 'life changing', 'mind blown',
            'can\'t stop eating', 'addicted to', 'best ever'
        ];
        const triggerCounts = new Map();
        videos.forEach(video => {
            const text = video.text.toLowerCase();
            viralTriggers.forEach(trigger => {
                if (text.includes(trigger)) {
                    const weight = video.viralScore || 1;
                    triggerCounts.set(trigger, (triggerCounts.get(trigger) || 0) + weight);
                }
            });
        });
        const topViralTriggers = Array.from(triggerCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([trigger]) => trigger);
        return {
            trending_sounds: trendingSounds,
            popular_formats: popularFormats,
            viral_triggers: topViralTriggers,
        };
    }
    analyzeAudienceBehavior(videos) {
        const hourCounts = new Array(24).fill(0);
        const hourEngagement = new Array(24).fill(0);
        videos.forEach(video => {
            if (video.createTime) {
                const hour = new Date(parseInt(video.createTime) * 1000).getHours();
                const engagement = (video.stats?.diggCount || 0) + (video.stats?.shareCount || 0) + (video.stats?.commentCount || 0);
                hourCounts[hour]++;
                hourEngagement[hour] += engagement;
            }
        });
        const peakHours = hourEngagement
            .map((total, hour) => ({ hour, avgEngagement: hourCounts[hour] > 0 ? total / hourCounts[hour] : 0 }))
            .sort((a, b) => b.avgEngagement - a.avgEngagement)
            .slice(0, 4)
            .map(item => item.hour);
        const contentTypes = [
            'quick recipe', 'cooking tutorial', 'food review', 'taste test',
            'healthy food', 'dessert', 'breakfast', 'lunch', 'dinner',
            'snack', 'drink', 'coffee', 'cocktail', 'vegan', 'vegetarian'
        ];
        const preferenceScores = new Map();
        videos.forEach(video => {
            const text = video.text.toLowerCase();
            contentTypes.forEach(type => {
                if (text.includes(type)) {
                    const score = video.viralScore || 1;
                    preferenceScores.set(type, (preferenceScores.get(type) || 0) + score);
                }
            });
        });
        const contentPreferences = Array.from(preferenceScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([type]) => type);
        const totalViews = videos.reduce((sum, video) => sum + (video.stats?.playCount || 0), 0);
        const totalLikes = videos.reduce((sum, video) => sum + (video.stats?.diggCount || 0), 0);
        const totalShares = videos.reduce((sum, video) => sum + (video.stats?.shareCount || 0), 0);
        const totalComments = videos.reduce((sum, video) => sum + (video.stats?.commentCount || 0), 0);
        const interactionPatterns = {
            like_to_view_ratio: totalViews > 0 ? totalLikes / totalViews : 0,
            share_rate: totalViews > 0 ? totalShares / totalViews : 0,
            comment_engagement: totalViews > 0 ? totalComments / totalViews : 0,
        };
        return {
            peak_engagement_times: peakHours,
            content_preferences: contentPreferences,
            interaction_patterns: interactionPatterns,
        };
    }
    getFallbackData() {
        return {
            videos_analyzed: 0,
            viral_food_trends: [],
            hashtag_performance: {},
            creator_influence: {
                top_creators: [],
                trend_adoption_rate: 0,
            },
            content_insights: {
                trending_sounds: [],
                popular_formats: [],
                viral_triggers: [],
            },
            audience_behavior: {
                peak_engagement_times: [],
                content_preferences: [],
                interaction_patterns: {
                    like_to_view_ratio: 0,
                    share_rate: 0,
                    comment_engagement: 0,
                },
            },
        };
    }
};
exports.TikTokScraperService = TikTokScraperService;
exports.TikTokScraperService = TikTokScraperService = TikTokScraperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [apify_client_service_1.ApifyClientService])
], TikTokScraperService);
//# sourceMappingURL=tiktok-scraper.service.js.map