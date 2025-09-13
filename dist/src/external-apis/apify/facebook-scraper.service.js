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
var FacebookScraperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookScraperService = void 0;
const common_1 = require("@nestjs/common");
const apify_client_service_1 = require("./apify-client.service");
let FacebookScraperService = FacebookScraperService_1 = class FacebookScraperService {
    apifyClient;
    logger = new common_1.Logger(FacebookScraperService_1.name);
    ACTOR_ID = 'apify/facebook-pages-scraper';
    constructor(apifyClient) {
        this.apifyClient = apifyClient;
    }
    async scrapeFacebookFoodPages(location, categories = []) {
        try {
            const pageUrls = this.generateFoodPageUrls(location);
            const keywords = this.generateFoodKeywords(location, categories);
            const input = {
                page_urls: pageUrls.slice(0, 15),
                keywords: keywords.slice(0, 8),
                post_limit: 250,
            };
            const costEstimate = await this.apifyClient.estimateCost(this.ACTOR_ID, input.post_limit);
            if (!costEstimate.fits_daily_budget) {
                this.logger.warn(`Facebook scraping exceeds daily budget: $${costEstimate.estimated_cost_usd}`);
                return this.getFallbackData();
            }
            this.logger.log(`Starting Facebook scraping for ${location} (estimated cost: $${costEstimate.estimated_cost_usd})`);
            const run = await this.apifyClient.runActor(this.ACTOR_ID, {
                startUrls: input.page_urls.map(url => ({ url })),
                resultsLimit: input.post_limit,
                onlyPosts: true,
                commentsMode: 'DISABLED',
                extendOutputFunction: `($) => {
          const text = ($.text || '').toLowerCase();
          return {
            foodRelevant: /(food|restaurant|eat|meal|delicious|menu|special|dining|chef|cuisine|taste|hungry)/gi.test(text),
            locationMentioned: text.includes('${location.toLowerCase()}'),
            eventPost: /(event|special|promotion|deal|discount|happy hour|grand opening)/gi.test(text),
            engagementScore: ($.likes || 0) + ($.shares || 0) * 2 + ($.comments || 0) * 1.5,
            hashtags: (text.match(/#\\w+/g) || []),
            mentions: (text.match(/@\\w+/g) || [])
          }
        }`,
            });
            const posts = await this.apifyClient.getDatasetItems(run.defaultDatasetId, {
                limit: input.post_limit,
                clean: true,
            });
            return this.analyzeFacebookData(posts, location);
        }
        catch (error) {
            this.logger.error(`Facebook scraping failed for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
            return this.getFallbackData();
        }
    }
    generateFoodPageUrls(location) {
        const cityName = location.split(',')[0].toLowerCase().replace(/\s+/g, '');
        const pageUrls = [
            `https://www.facebook.com/${cityName}foodie`,
            `https://www.facebook.com/${cityName}eats`,
            `https://www.facebook.com/${cityName}restaurants`,
            `https://www.facebook.com/eat${cityName}`,
            `https://www.facebook.com/${cityName}dining`,
            `https://www.facebook.com/${cityName}food.scene`,
            'https://www.facebook.com/foodnetwork',
            'https://www.facebook.com/tastyfood',
            'https://www.facebook.com/buzzfeedtasty',
            'https://www.facebook.com/foodandwine',
        ];
        return pageUrls;
    }
    generateFoodKeywords(location, categories) {
        const baseKeywords = [
            `${location} restaurant`,
            `${location} food`,
            `${location} dining`,
            `eat in ${location}`,
            'new restaurant',
            'grand opening',
            'food special',
            'menu update',
        ];
        const categoryKeywords = categories.map(cat => `${cat} ${location}`);
        return [...baseKeywords, ...categoryKeywords];
    }
    analyzeFacebookData(posts, location) {
        const validPosts = posts.filter(post => post && post.text && post.foodRelevant);
        const pageEngagement = this.calculatePageEngagement(validPosts);
        const eventMentions = this.extractEventMentions(validPosts);
        const communitySentiment = this.calculateCommunitySentiment(validPosts);
        const pageInsights = this.analyzePageInsights(validPosts);
        const communityInsights = this.analyzeCommunityInsights(validPosts);
        const trendAnalysis = this.analyzeTrends(validPosts);
        return {
            posts_analyzed: validPosts.length,
            page_engagement: pageEngagement,
            event_mentions: eventMentions,
            community_sentiment: communitySentiment,
            page_insights: pageInsights,
            community_insights: communityInsights,
            trend_analysis: trendAnalysis,
        };
    }
    calculatePageEngagement(posts) {
        if (posts.length === 0)
            return 0;
        const totalEngagement = posts.reduce((sum, post) => {
            return sum + (post.stats?.likes || 0) + (post.stats?.shares || 0) + (post.stats?.comments || 0);
        }, 0);
        const totalReach = posts.reduce((sum, post) => {
            return sum + ((post.page?.followers || 1000) * 0.1);
        }, 0);
        return totalReach > 0 ? totalEngagement / totalReach : 0;
    }
    extractEventMentions(posts) {
        const eventTypes = [
            'grand opening',
            'happy hour',
            'special event',
            'live music',
            'wine tasting',
            'cooking class',
            'food festival',
            'restaurant week',
            'chef special',
            'new menu',
            'holiday special',
            'anniversary',
        ];
        const eventMentions = new Map();
        posts.filter(post => post.eventPost).forEach(post => {
            const text = post.text.toLowerCase();
            eventTypes.forEach(eventType => {
                if (text.includes(eventType)) {
                    const weight = post.engagementScore || 1;
                    eventMentions.set(eventType, (eventMentions.get(eventType) || 0) + weight);
                }
            });
        });
        return Array.from(eventMentions.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([event]) => event);
    }
    calculateCommunitySentiment(posts) {
        const sentimentSum = posts.reduce((sum, post) => {
            return sum + this.analyzeSentiment(post.text, post.stats.reactions);
        }, 0);
        return posts.length > 0 ? sentimentSum / posts.length : 0;
    }
    analyzeSentiment(text, reactions) {
        let sentiment = 0;
        const positiveWords = [
            'amazing', 'excellent', 'delicious', 'fantastic', 'wonderful', 'great',
            'best', 'perfect', 'love', 'incredible', 'outstanding', 'superb',
            'brilliant', 'awesome', 'exceptional', 'remarkable', 'recommend',
            'must try', 'favorite', 'impressed', 'satisfied'
        ];
        const negativeWords = [
            'terrible', 'awful', 'bad', 'horrible', 'disgusting', 'worst',
            'hate', 'disappointing', 'poor', 'bland', 'overpriced', 'rude',
            'slow', 'cold', 'avoid', 'waste of money', 'not recommended'
        ];
        const lowerText = text.toLowerCase();
        positiveWords.forEach(word => {
            if (lowerText.includes(word))
                sentiment += 0.1;
        });
        negativeWords.forEach(word => {
            if (lowerText.includes(word))
                sentiment -= 0.1;
        });
        if (reactions) {
            const totalReactions = Object.values(reactions).reduce((sum, count) => sum + (count || 0), 0);
            if (totalReactions > 0) {
                const positiveReactions = (reactions.like || 0) + (reactions.love || 0) + (reactions.wow || 0);
                const negativeReactions = (reactions.sad || 0) + (reactions.angry || 0);
                const reactionSentiment = (positiveReactions - negativeReactions) / totalReactions;
                sentiment = (sentiment + reactionSentiment) / 2;
            }
        }
        return Math.max(-1, Math.min(1, sentiment));
    }
    analyzePageInsights(posts) {
        const pageStats = new Map();
        posts.forEach(post => {
            const pageName = post.page?.name || 'Unknown';
            if (!pageStats.has(pageName)) {
                pageStats.set(pageName, {
                    posts: 0,
                    totalEngagement: 0,
                    followers: post.page?.followers || 0,
                    category: post.page?.category || 'Food & Dining',
                });
            }
            const stats = pageStats.get(pageName);
            stats.posts++;
            stats.totalEngagement += post.engagementScore || 0;
        });
        const mostActivePages = Array.from(pageStats.entries())
            .sort((a, b) => (b[1].totalEngagement / Math.max(b[1].posts, 1)) - (a[1].totalEngagement / Math.max(a[1].posts, 1)))
            .slice(0, 8)
            .map(([name, stats]) => ({
            name,
            category: stats.category,
            engagement_rate: stats.totalEngagement / Math.max(stats.posts, 1),
            follower_count: stats.followers,
        }));
        const topPosts = posts
            .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
            .slice(0, 8)
            .map(post => ({
            text: post.text.length > 100 ? post.text.substring(0, 97) + '...' : post.text,
            page: post.page?.name || 'Unknown',
            engagement: post.engagementScore || 0,
            reactions_breakdown: post.stats?.reactions || {},
        }));
        const hourEngagement = new Array(24).fill(0);
        const hourCounts = new Array(24).fill(0);
        posts.forEach(post => {
            if (post.publishedAt) {
                const hour = new Date(post.publishedAt).getHours();
                hourEngagement[hour] += post.engagementScore || 0;
                hourCounts[hour]++;
            }
        });
        const optimalTimes = hourEngagement
            .map((engagement, hour) => ({
            hour,
            avgEngagement: hourCounts[hour] > 0 ? engagement / hourCounts[hour] : 0,
        }))
            .sort((a, b) => b.avgEngagement - a.avgEngagement)
            .slice(0, 4)
            .map(item => item.hour);
        const viralPatterns = this.identifyViralPatterns(posts);
        return {
            most_active_pages: mostActivePages,
            content_performance: {
                top_performing_posts: topPosts,
                optimal_posting_times: optimalTimes,
                viral_content_patterns: viralPatterns,
            },
        };
    }
    identifyViralPatterns(posts) {
        const highEngagementPosts = posts.filter(post => (post.engagementScore || 0) > 50);
        const patterns = [];
        const commonElements = [
            { pattern: 'photos included', test: (post) => post.mediaType === 'photo' },
            { pattern: 'question format', test: (post) => post.text.includes('?') },
            { pattern: 'call to action', test: (post) => /try|visit|check out|come|join/gi.test(post.text) },
            { pattern: 'emotional language', test: (post) => /love|amazing|excited|thrilled/gi.test(post.text) },
            { pattern: 'behind the scenes', test: (post) => /behind|kitchen|making|preparing/gi.test(post.text) },
            { pattern: 'limited time offers', test: (post) => /limited|today only|special|deal/gi.test(post.text) },
        ];
        commonElements.forEach(element => {
            const matchingPosts = highEngagementPosts.filter(element.test).length;
            if (matchingPosts >= 3) {
                patterns.push(element.pattern);
            }
        });
        return patterns.slice(0, 6);
    }
    analyzeCommunityInsights(posts) {
        const eventPosts = posts.filter(post => post.eventPost);
        const localEvents = eventPosts
            .filter(post => this.extractEventInfo(post.text))
            .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
            .slice(0, 6)
            .map(post => {
            const eventInfo = this.extractEventInfo(post.text);
            return {
                event_name: eventInfo.name,
                date: eventInfo.date,
                page: post.page?.name || 'Unknown',
                engagement: post.engagementScore || 0,
            };
        });
        const promotionPosts = posts.filter(post => /deal|discount|special|promotion|offer|happy hour|percent off|\$/gi.test(post.text));
        const promotions = promotionPosts
            .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
            .slice(0, 8)
            .map(post => ({
            restaurant: post.page?.name || 'Unknown',
            promotion_type: this.classifyPromotion(post.text),
            engagement: post.engagementScore || 0,
        }));
        const discussionTopics = [
            'new restaurant openings',
            'food delivery experiences',
            'restaurant recommendations',
            'food quality concerns',
            'price changes',
            'service experiences',
            'menu changes',
            'health and safety',
        ];
        const discussions = discussionTopics.map(topic => {
            const relatedPosts = this.findPostsAboutTopic(posts, topic);
            const avgSentiment = relatedPosts.length > 0
                ? relatedPosts.reduce((sum, post) => sum + this.analyzeSentiment(post.text, post.stats.reactions), 0) / relatedPosts.length
                : 0;
            return {
                topic,
                sentiment: avgSentiment,
                participation_level: relatedPosts.length,
            };
        }).filter(discussion => discussion.participation_level > 0);
        return {
            local_food_events: localEvents,
            restaurant_promotions: promotions,
            community_discussions: discussions,
        };
    }
    extractEventInfo(text) {
        const eventKeywords = ['event', 'special', 'night', 'festival', 'tasting', 'class'];
        let eventName = 'Special Event';
        eventKeywords.forEach(keyword => {
            if (text.toLowerCase().includes(keyword)) {
                eventName = `${keyword.charAt(0).toUpperCase()}${keyword.slice(1)} Event`;
            }
        });
        const dateMatch = text.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\w+\s+\d{1,2}\b/);
        const date = dateMatch ? dateMatch[0] : 'Date TBD';
        return { name: eventName, date };
    }
    classifyPromotion(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('happy hour'))
            return 'happy hour';
        if (lowerText.includes('discount') || lowerText.includes('% off'))
            return 'discount';
        if (lowerText.includes('special') && lowerText.includes('menu'))
            return 'menu special';
        if (lowerText.includes('deal'))
            return 'special deal';
        if (lowerText.includes('free'))
            return 'free offer';
        if (lowerText.includes('combo') || lowerText.includes('bundle'))
            return 'combo deal';
        return 'general promotion';
    }
    findPostsAboutTopic(posts, topic) {
        const topicKeywords = {
            'new restaurant openings': ['new', 'opening', 'grand opening', 'just opened'],
            'food delivery experiences': ['delivery', 'doordash', 'uber eats', 'grubhub'],
            'restaurant recommendations': ['recommend', 'suggestion', 'best', 'favorite'],
            'food quality concerns': ['quality', 'fresh', 'cold', 'burnt', 'soggy'],
            'price changes': ['price', 'expensive', 'cheap', 'cost', 'affordable'],
            'service experiences': ['service', 'staff', 'waiter', 'server', 'friendly'],
            'menu changes': ['menu', 'new item', 'removed', 'added'],
            'health and safety': ['clean', 'sanitary', 'covid', 'safe', 'health'],
        };
        const keywords = topicKeywords[topic] || [];
        return posts.filter(post => {
            const text = post.text.toLowerCase();
            return keywords.some(keyword => text.includes(keyword));
        });
    }
    analyzeTrends(posts) {
        const restaurantMentions = new Map();
        posts.forEach(post => {
            const restaurants = this.extractRestaurantNames(post.text);
            const isNewRestaurant = /new|opening|just opened|grand opening/gi.test(post.text);
            restaurants.forEach(restaurant => {
                if (!restaurantMentions.has(restaurant)) {
                    restaurantMentions.set(restaurant, {
                        count: 0,
                        totalEngagement: 0,
                        isNew: false,
                    });
                }
                const data = restaurantMentions.get(restaurant);
                data.count++;
                data.totalEngagement += post.engagementScore || 0;
                if (isNewRestaurant)
                    data.isNew = true;
            });
        });
        const emergingRestaurants = Array.from(restaurantMentions.entries())
            .filter(([_, data]) => data.isNew && data.count >= 2)
            .sort((a, b) => b[1].totalEngagement - a[1].totalEngagement)
            .slice(0, 8)
            .map(([restaurant]) => restaurant);
        const cuisines = [
            'italian', 'mexican', 'chinese', 'japanese', 'thai', 'indian', 'korean',
            'french', 'mediterranean', 'greek', 'vietnamese', 'american', 'pizza',
            'burger', 'sushi', 'bbq', 'seafood', 'vegetarian', 'vegan'
        ];
        const cuisineStats = new Map();
        posts.forEach(post => {
            const text = post.text.toLowerCase();
            const sentiment = this.analyzeSentiment(post.text, post.stats.reactions);
            cuisines.forEach(cuisine => {
                if (text.includes(cuisine)) {
                    if (!cuisineStats.has(cuisine)) {
                        cuisineStats.set(cuisine, { count: 0, totalSentiment: 0 });
                    }
                    const stats = cuisineStats.get(cuisine);
                    stats.count++;
                    stats.totalSentiment += sentiment;
                }
            });
        });
        const popularCuisines = Array.from(cuisineStats.entries())
            .filter(([_, stats]) => stats.count >= 3)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10)
            .map(([cuisine, stats]) => ({
            cuisine,
            mention_count: stats.count,
            sentiment: stats.totalSentiment / stats.count,
        }));
        const seasonalKeywords = [
            'pumpkin spice', 'halloween', 'thanksgiving', 'christmas', 'valentine',
            'spring menu', 'summer special', 'fall flavors', 'winter comfort',
            'holiday special', 'seasonal', 'limited time'
        ];
        const seasonalTrends = seasonalKeywords
            .filter(keyword => {
            return posts.some(post => post.text.toLowerCase().includes(keyword));
        })
            .slice(0, 6);
        return {
            emerging_restaurants: emergingRestaurants,
            popular_cuisines: popularCuisines,
            seasonal_trends: seasonalTrends,
        };
    }
    extractRestaurantNames(text) {
        const restaurantPatterns = [
            /\b([A-Z][a-zA-Z\s&'-]+(?:Restaurant|Cafe|Bar|Bistro|Kitchen|Grill|Pizza|Sushi|Diner|Eatery))\b/g,
            /\b(McDonald's|Starbucks|KFC|Burger King|Subway|Pizza Hut|Taco Bell|Chipotle|Panera|Wendy's)\b/g,
        ];
        const matches = [];
        restaurantPatterns.forEach(pattern => {
            const found = text.match(pattern);
            if (found) {
                matches.push(...found);
            }
        });
        return Array.from(new Set(matches));
    }
    getFallbackData() {
        return {
            posts_analyzed: 0,
            page_engagement: 0,
            event_mentions: [],
            community_sentiment: 0,
            page_insights: {
                most_active_pages: [],
                content_performance: {
                    top_performing_posts: [],
                    optimal_posting_times: [],
                    viral_content_patterns: [],
                },
            },
            community_insights: {
                local_food_events: [],
                restaurant_promotions: [],
                community_discussions: [],
            },
            trend_analysis: {
                emerging_restaurants: [],
                popular_cuisines: [],
                seasonal_trends: [],
            },
        };
    }
};
exports.FacebookScraperService = FacebookScraperService;
exports.FacebookScraperService = FacebookScraperService = FacebookScraperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [apify_client_service_1.ApifyClientService])
], FacebookScraperService);
//# sourceMappingURL=facebook-scraper.service.js.map