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
var InstagramScraperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramScraperService = void 0;
const common_1 = require("@nestjs/common");
const apify_client_service_1 = require("./apify-client.service");
let InstagramScraperService = InstagramScraperService_1 = class InstagramScraperService {
    apifyClient;
    logger = new common_1.Logger(InstagramScraperService_1.name);
    ACTOR_ID = 'apify/instagram-scraper';
    constructor(apifyClient) {
        this.apifyClient = apifyClient;
    }
    async scrapeInstagramFoodTrends(location, categories = []) {
        try {
            const hashtags = this.apifyClient.generateLocationHashtags(location, categories);
            const input = {
                hashtags: hashtags.slice(0, 10),
                location_tags: [location, `${location} food`, `${location} restaurant`],
                results_limit: 200,
                include_stories: false,
            };
            const costEstimate = await this.apifyClient.estimateCost(this.ACTOR_ID, input.results_limit);
            if (!costEstimate.fits_daily_budget) {
                this.logger.warn(`Instagram scraping exceeds daily budget: $${costEstimate.estimated_cost_usd}`);
                return this.getFallbackData(location);
            }
            this.logger.log(`Starting Instagram scraping for ${location} (estimated cost: $${costEstimate.estimated_cost_usd})`);
            const run = await this.apifyClient.runActor(this.ACTOR_ID, {
                hashtags: input.hashtags,
                resultsLimit: input.results_limit,
                addParentData: false,
                onlyPosts: true,
                extendOutputFunction: `($) => {
          return {
            foodMentions: ($.caption?.match(/(restaurant|food|delicious|yummy|tasty|eat|dining|cuisine|meal)/gi) || []).length,
            locationRelevant: $.caption?.toLowerCase().includes('${location.toLowerCase()}') ||
                             $.locationName?.toLowerCase().includes('${location.toLowerCase()}') || false,
            engagementRate: ($.likesCount + $.commentsCount) / Math.max($.ownerFollowersCount, 1000),
            hashtags: $.hashtags || [],
            mentions: $.mentions || []
          }
        }`,
            });
            const posts = await this.apifyClient.getDatasetItems(run.defaultDatasetId, {
                limit: input.results_limit,
                clean: true,
            });
            return this.analyzeInstagramData(posts, location);
        }
        catch (error) {
            this.logger.error(`Instagram scraping failed for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
            return this.getFallbackData(location);
        }
    }
    analyzeInstagramData(posts, location) {
        const validPosts = posts.filter(post => post && post.caption && post.foodMentions > 0);
        const hashtagCounts = new Map();
        validPosts.forEach(post => {
            post.hashtags?.forEach(tag => {
                const cleanTag = tag.replace('#', '').toLowerCase();
                if (this.isFoodRelatedHashtag(cleanTag)) {
                    hashtagCounts.set(cleanTag, (hashtagCounts.get(cleanTag) || 0) + 1);
                }
            });
        });
        const trendingHashtags = Array.from(hashtagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(entry => `#${entry[0]}`);
        const restaurantMentions = new Map();
        validPosts.forEach(post => {
            post.mentions?.forEach(mention => {
                const username = mention.replace('@', '');
                if (this.isRestaurantAccount(username)) {
                    restaurantMentions.set(username, (restaurantMentions.get(username) || 0) + 1);
                }
            });
        });
        const viralRestaurants = Array.from(restaurantMentions.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => `@${entry[0]}`);
        const sentimentSum = validPosts.reduce((sum, post) => {
            return sum + this.analyzeSentiment(post.caption);
        }, 0);
        const userSentiment = validPosts.length > 0 ? sentimentSum / validPosts.length : 0;
        const totalLikes = validPosts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
        const totalComments = validPosts.reduce((sum, post) => sum + (post.commentsCount || 0), 0);
        const avgLikes = validPosts.length > 0 ? totalLikes / validPosts.length : 0;
        const avgComments = validPosts.length > 0 ? totalComments / validPosts.length : 0;
        const topInfluencers = validPosts
            .filter(post => post.engagementRate > 0.05)
            .sort((a, b) => b.engagementRate - a.engagementRate)
            .slice(0, 5)
            .map(post => `@${post.ownerUsername}`);
        const locationTags = validPosts
            .filter(post => post.locationName)
            .map(post => post.locationName)
            .filter(loc => loc.toLowerCase().includes(location.toLowerCase()));
        const uniqueLocations = Array.from(new Set(locationTags));
        const foodHotspots = uniqueLocations.slice(0, 10);
        const dishKeywords = this.extractDishKeywords(validPosts.map(p => p.caption).join(' '));
        const trendingDishes = dishKeywords.slice(0, 10);
        return {
            posts_analyzed: validPosts.length,
            trending_hashtags: trendingHashtags,
            viral_restaurants: viralRestaurants,
            user_sentiment: userSentiment,
            engagement_metrics: {
                avg_likes: Math.round(avgLikes),
                avg_comments: Math.round(avgComments),
                top_influencers: Array.from(new Set(topInfluencers)),
            },
            location_insights: {
                tagged_locations: uniqueLocations.slice(0, 20),
                food_hotspots: foodHotspots,
                trending_dishes: trendingDishes,
            },
            temporal_patterns: {
                peak_posting_hours: this.calculatePeakHours(validPosts),
                weekly_trends: this.calculateWeeklyTrends(validPosts),
            },
        };
    }
    isFoodRelatedHashtag(tag) {
        const foodKeywords = [
            'food', 'foodie', 'restaurant', 'dining', 'delicious', 'yummy',
            'tasty', 'eat', 'cooking', 'chef', 'cuisine', 'meal', 'dish',
            'pizza', 'burger', 'sushi', 'pasta', 'coffee', 'dessert',
            'breakfast', 'lunch', 'dinner', 'brunch', 'foodstagram'
        ];
        return foodKeywords.some(keyword => tag.includes(keyword));
    }
    isRestaurantAccount(username) {
        const restaurantKeywords = [
            'restaurant', 'cafe', 'bar', 'bistro', 'kitchen', 'grill',
            'pizza', 'sushi', 'burger', 'coffee', 'bakery', 'deli'
        ];
        const lowerUsername = username.toLowerCase();
        return restaurantKeywords.some(keyword => lowerUsername.includes(keyword));
    }
    analyzeSentiment(text) {
        if (!text)
            return 0;
        const positiveWords = [
            'amazing', 'excellent', 'delicious', 'fantastic', 'wonderful', 'great',
            'best', 'perfect', 'love', 'incredible', 'outstanding', 'superb',
            'brilliant', 'awesome', 'exceptional', 'remarkable', 'divine',
            'heavenly', 'scrumptious', 'yummy', 'tasty', 'flavorful'
        ];
        const negativeWords = [
            'terrible', 'awful', 'bad', 'horrible', 'disgusting', 'worst',
            'hate', 'disappointing', 'poor', 'bland', 'tasteless', 'overpriced',
            'rude', 'slow', 'cold', 'burnt', 'soggy', 'stale', 'nasty'
        ];
        const lowerText = text.toLowerCase();
        let sentiment = 0;
        positiveWords.forEach(word => {
            if (lowerText.includes(word))
                sentiment += 0.1;
        });
        negativeWords.forEach(word => {
            if (lowerText.includes(word))
                sentiment -= 0.1;
        });
        return Math.max(-1, Math.min(1, sentiment));
    }
    extractDishKeywords(text) {
        const dishKeywords = [
            'pizza', 'burger', 'sushi', 'pasta', 'salad', 'steak', 'chicken',
            'fish', 'sandwich', 'soup', 'ramen', 'tacos', 'burrito', 'wings',
            'fries', 'dessert', 'cake', 'ice cream', 'coffee', 'cocktail',
            'wine', 'beer', 'smoothie', 'juice', 'pancakes', 'waffle',
            'omelet', 'bagel', 'donut', 'croissant', 'avocado toast'
        ];
        const lowerText = text.toLowerCase();
        const foundDishes = new Map();
        dishKeywords.forEach(dish => {
            const regex = new RegExp(`\\b${dish}\\b`, 'g');
            const matches = lowerText.match(regex);
            if (matches) {
                foundDishes.set(dish, matches.length);
            }
        });
        return Array.from(foundDishes.entries())
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
    }
    calculatePeakHours(posts) {
        const hourCounts = new Array(24).fill(0);
        posts.forEach(post => {
            if (post.timestamp) {
                const hour = new Date(post.timestamp).getHours();
                hourCounts[hour]++;
            }
        });
        return hourCounts
            .map((count, hour) => ({ hour, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map(item => item.hour);
    }
    calculateWeeklyTrends(posts) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayCounts = new Array(7).fill(0);
        posts.forEach(post => {
            if (post.timestamp) {
                const day = new Date(post.timestamp).getDay();
                dayCounts[day]++;
            }
        });
        return dayCounts
            .map((count, day) => ({ day: dayNames[day], count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map(item => item.day);
    }
    getFallbackData(location) {
        return {
            posts_analyzed: 0,
            trending_hashtags: [],
            viral_restaurants: [],
            user_sentiment: 0,
            engagement_metrics: {
                avg_likes: 0,
                avg_comments: 0,
                top_influencers: [],
            },
            location_insights: {
                tagged_locations: [],
                food_hotspots: [],
                trending_dishes: [],
            },
            temporal_patterns: {
                peak_posting_hours: [],
                weekly_trends: [],
            },
        };
    }
};
exports.InstagramScraperService = InstagramScraperService;
exports.InstagramScraperService = InstagramScraperService = InstagramScraperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [apify_client_service_1.ApifyClientService])
], InstagramScraperService);
//# sourceMappingURL=instagram-scraper.service.js.map