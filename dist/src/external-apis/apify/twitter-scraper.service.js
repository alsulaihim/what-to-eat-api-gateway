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
var TwitterScraperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterScraperService = void 0;
const common_1 = require("@nestjs/common");
const apify_client_service_1 = require("./apify-client.service");
let TwitterScraperService = TwitterScraperService_1 = class TwitterScraperService {
    apifyClient;
    logger = new common_1.Logger(TwitterScraperService_1.name);
    ACTOR_ID = 'apify/twitter-scraper';
    constructor(apifyClient) {
        this.apifyClient = apifyClient;
    }
    async scrapeTwitterFoodMentions(location, categories = []) {
        try {
            const keywords = this.generateFoodKeywords(location, categories);
            const input = {
                keywords: keywords.slice(0, 10),
                location: location,
                max_tweets: 500,
                include_retweets: true,
            };
            const costEstimate = await this.apifyClient.estimateCost(this.ACTOR_ID, input.max_tweets);
            if (!costEstimate.fits_daily_budget) {
                this.logger.warn(`Twitter scraping exceeds daily budget: $${costEstimate.estimated_cost_usd}`);
                return this.getFallbackData();
            }
            this.logger.log(`Starting Twitter scraping for ${location} (estimated cost: $${costEstimate.estimated_cost_usd})`);
            const run = await this.apifyClient.runActor(this.ACTOR_ID, {
                searchTerms: keywords,
                maxTweets: input.max_tweets,
                includeSearchTerms: true,
                onlyImage: false,
                onlyQuote: false,
                onlyTwitterBlue: false,
                extendOutputFunction: `($) => {
          return {
            foodMentions: ($.text?.match(/(restaurant|food|delicious|yummy|tasty|eat|dining|cuisine|meal|hungry|craving)/gi) || []).length,
            locationRelevant: $.text?.toLowerCase().includes('${location.toLowerCase()}') || false,
            engagementRate: ($.retweetCount + $.likeCount + $.replyCount) / Math.max($.author?.followersCount || 1000, 1000),
            hashtags: $.hashtags || [],
            mentions: $.mentions || []
          }
        }`,
            });
            const tweets = await this.apifyClient.getDatasetItems(run.defaultDatasetId, {
                limit: input.max_tweets,
                clean: true,
            });
            return this.analyzeTwitterData(tweets, location);
        }
        catch (error) {
            this.logger.error(`Twitter scraping failed for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
            return this.getFallbackData();
        }
    }
    generateFoodKeywords(location, categories) {
        const baseKeywords = [
            `${location} restaurant`,
            `${location} food`,
            `${location} dining`,
            `${location} eats`,
            `eating in ${location}`,
            `best food ${location}`,
        ];
        const categoryKeywords = categories.map(cat => `${cat} ${location}`);
        const generalFoodKeywords = ['foodie', 'restaurant review', 'food recommendation', 'delicious'];
        return [...baseKeywords, ...categoryKeywords, ...generalFoodKeywords];
    }
    analyzeTwitterData(tweets, location) {
        const validTweets = tweets.filter(tweet => tweet && tweet.text && tweet.foodMentions > 0);
        const topicCounts = new Map();
        validTweets.forEach(tweet => {
            tweet.hashtags?.forEach(tag => {
                const cleanTag = tag.replace('#', '').toLowerCase();
                if (this.isFoodRelatedTopic(cleanTag)) {
                    topicCounts.set(cleanTag, (topicCounts.get(cleanTag) || 0) + 1);
                }
            });
        });
        const trendingTopics = Array.from(topicCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(entry => `#${entry[0]}`);
        const sentimentSum = validTweets.reduce((sum, tweet) => {
            return sum + this.analyzeSentiment(tweet.text);
        }, 0);
        const mentionSentiment = validTweets.length > 0 ? sentimentSum / validTweets.length : 0;
        const totalRetweets = validTweets.reduce((sum, tweet) => sum + (tweet.retweetCount || 0), 0);
        const avgRetweetsPerHour = this.calculateRetweetVelocity(validTweets);
        const retweetVelocity = avgRetweetsPerHour;
        const verifiedTweets = validTweets.filter(tweet => tweet.author?.verified);
        const verifiedMentions = verifiedTweets.length;
        const followerReach = validTweets.reduce((sum, tweet) => sum + (tweet.author?.followersCount || 0), 0);
        const topTweets = validTweets
            .sort((a, b) => {
            const engagementA = (a.retweetCount || 0) + (a.likeCount || 0) + (a.replyCount || 0);
            const engagementB = (b.retweetCount || 0) + (b.likeCount || 0) + (b.replyCount || 0);
            return engagementB - engagementA;
        })
            .slice(0, 5)
            .map(tweet => ({
            text: tweet.text.length > 100 ? tweet.text.substring(0, 97) + '...' : tweet.text,
            author: `@${tweet.author?.username || 'unknown'}`,
            engagement: (tweet.retweetCount || 0) + (tweet.likeCount || 0) + (tweet.replyCount || 0),
            url: tweet.url || '',
        }));
        const restaurantMentions = this.extractRestaurantMentions(validTweets);
        const trendingRestaurants = Array.from(restaurantMentions.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);
        const viralDishes = this.extractViralDishes(validTweets);
        const discussionTopics = this.extractDiscussionTopics(validTweets);
        const sentimentByTopic = this.calculateTopicSentiment(validTweets, discussionTopics);
        const influencerOpinions = this.extractInfluencerOpinions(verifiedTweets.slice(0, 10));
        return {
            tweets_analyzed: validTweets.length,
            trending_topics: trendingTopics,
            mention_sentiment: mentionSentiment,
            retweet_velocity: retweetVelocity,
            influence_metrics: {
                verified_mentions: verifiedMentions,
                follower_reach: followerReach,
            },
            viral_content: {
                top_tweets: topTweets,
                trending_restaurants: trendingRestaurants,
                viral_dishes: viralDishes,
            },
            conversation_insights: {
                discussion_topics: discussionTopics,
                sentiment_by_topic: sentimentByTopic,
                influencer_opinions: influencerOpinions,
            },
        };
    }
    isFoodRelatedTopic(topic) {
        const foodKeywords = [
            'food', 'foodie', 'restaurant', 'dining', 'delicious', 'yummy',
            'tasty', 'eat', 'cooking', 'chef', 'cuisine', 'meal', 'dish',
            'pizza', 'burger', 'sushi', 'pasta', 'coffee', 'dessert',
            'breakfast', 'lunch', 'dinner', 'brunch', 'hungry', 'craving'
        ];
        return foodKeywords.some(keyword => topic.includes(keyword));
    }
    analyzeSentiment(text) {
        if (!text)
            return 0;
        const positiveWords = [
            'amazing', 'excellent', 'delicious', 'fantastic', 'wonderful', 'great',
            'best', 'perfect', 'love', 'incredible', 'outstanding', 'superb',
            'brilliant', 'awesome', 'exceptional', 'remarkable', 'divine',
            'heavenly', 'scrumptious', 'yummy', 'tasty', 'flavorful', 'recommend'
        ];
        const negativeWords = [
            'terrible', 'awful', 'bad', 'horrible', 'disgusting', 'worst',
            'hate', 'disappointing', 'poor', 'bland', 'tasteless', 'overpriced',
            'rude', 'slow', 'cold', 'burnt', 'soggy', 'stale', 'nasty', 'avoid'
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
    calculateRetweetVelocity(tweets) {
        if (tweets.length === 0)
            return 0;
        const now = new Date();
        const recentTweets = tweets.filter(tweet => {
            const tweetDate = new Date(tweet.createdAt);
            const hoursAgo = (now.getTime() - tweetDate.getTime()) / (1000 * 60 * 60);
            return hoursAgo <= 24;
        });
        if (recentTweets.length === 0)
            return 0;
        const totalRetweets = recentTweets.reduce((sum, tweet) => sum + (tweet.retweetCount || 0), 0);
        return totalRetweets / 24;
    }
    extractRestaurantMentions(tweets) {
        const mentions = new Map();
        tweets.forEach(tweet => {
            tweet.mentions?.forEach(mention => {
                const username = mention.replace('@', '');
                if (this.isRestaurantAccount(username)) {
                    mentions.set(`@${username}`, (mentions.get(`@${username}`) || 0) + 1);
                }
            });
            const restaurantNames = this.extractRestaurantNames(tweet.text);
            restaurantNames.forEach(name => {
                mentions.set(name, (mentions.get(name) || 0) + 1);
            });
        });
        return mentions;
    }
    isRestaurantAccount(username) {
        const restaurantKeywords = [
            'restaurant', 'cafe', 'bar', 'bistro', 'kitchen', 'grill',
            'pizza', 'sushi', 'burger', 'coffee', 'bakery', 'deli',
            'eatery', 'diner', 'tavern', 'pub', 'steakhouse'
        ];
        const lowerUsername = username.toLowerCase();
        return restaurantKeywords.some(keyword => lowerUsername.includes(keyword));
    }
    extractRestaurantNames(text) {
        const restaurantPatterns = [
            /(\b[A-Z][a-zA-Z\s&'-]+(?:Restaurant|Cafe|Bar|Bistro|Kitchen|Grill|Pizza|Sushi|Burger|Coffee|Bakery|Deli|Eatery|Diner|Tavern|Pub|Steakhouse)\b)/g,
            /(\b(?:McDonald's|Starbucks|KFC|Burger King|Subway|Pizza Hut|Taco Bell|Chipotle|Panera|Wendy's)\b)/g,
        ];
        const matches = [];
        restaurantPatterns.forEach(pattern => {
            const found = text.match(pattern);
            if (found) {
                matches.push(...found);
            }
        });
        return matches;
    }
    extractViralDishes(tweets) {
        const dishCounts = new Map();
        const dishKeywords = [
            'pizza', 'burger', 'sushi', 'pasta', 'salad', 'steak', 'chicken',
            'fish', 'sandwich', 'soup', 'ramen', 'tacos', 'burrito', 'wings',
            'fries', 'dessert', 'cake', 'ice cream', 'coffee', 'cocktail',
            'smoothie', 'pancakes', 'waffle', 'omelet', 'bagel', 'donut'
        ];
        tweets.forEach(tweet => {
            const lowerText = tweet.text.toLowerCase();
            dishKeywords.forEach(dish => {
                const regex = new RegExp(`\\b${dish}\\b`, 'g');
                const matches = lowerText.match(regex);
                if (matches) {
                    const weight = (tweet.retweetCount || 0) + (tweet.likeCount || 0) + 1;
                    dishCounts.set(dish, (dishCounts.get(dish) || 0) + weight);
                }
            });
        });
        return Array.from(dishCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(entry => entry[0]);
    }
    extractDiscussionTopics(tweets) {
        const topicCounts = new Map();
        const foodTopics = [
            'delivery', 'takeout', 'dine-in', 'brunch', 'happy hour', 'date night',
            'family dinner', 'lunch meeting', 'food truck', 'fine dining',
            'casual dining', 'fast food', 'healthy eating', 'comfort food'
        ];
        tweets.forEach(tweet => {
            const lowerText = tweet.text.toLowerCase();
            foodTopics.forEach(topic => {
                if (lowerText.includes(topic)) {
                    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
                }
            });
        });
        return Array.from(topicCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(entry => entry[0]);
    }
    calculateTopicSentiment(tweets, topics) {
        const topicSentiment = {};
        topics.forEach(topic => {
            const relatedTweets = tweets.filter(tweet => tweet.text.toLowerCase().includes(topic));
            if (relatedTweets.length > 0) {
                const totalSentiment = relatedTweets.reduce((sum, tweet) => {
                    return sum + this.analyzeSentiment(tweet.text);
                }, 0);
                topicSentiment[topic] = totalSentiment / relatedTweets.length;
            }
        });
        return topicSentiment;
    }
    extractInfluencerOpinions(verifiedTweets) {
        return verifiedTweets
            .filter(tweet => tweet.text.length > 50)
            .map(tweet => ({
            username: `@${tweet.author?.username || 'unknown'}`,
            opinion: tweet.text.length > 150 ? tweet.text.substring(0, 147) + '...' : tweet.text,
            influence_score: (tweet.author?.followersCount || 0) / 1000,
        }))
            .sort((a, b) => b.influence_score - a.influence_score)
            .slice(0, 5);
    }
    getFallbackData() {
        return {
            tweets_analyzed: 0,
            trending_topics: [],
            mention_sentiment: 0,
            retweet_velocity: 0,
            influence_metrics: {
                verified_mentions: 0,
                follower_reach: 0,
            },
            viral_content: {
                top_tweets: [],
                trending_restaurants: [],
                viral_dishes: [],
            },
            conversation_insights: {
                discussion_topics: [],
                sentiment_by_topic: {},
                influencer_opinions: [],
            },
        };
    }
};
exports.TwitterScraperService = TwitterScraperService;
exports.TwitterScraperService = TwitterScraperService = TwitterScraperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [apify_client_service_1.ApifyClientService])
], TwitterScraperService);
//# sourceMappingURL=twitter-scraper.service.js.map