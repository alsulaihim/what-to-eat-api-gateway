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
var RedditScraperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedditScraperService = void 0;
const common_1 = require("@nestjs/common");
const apify_client_service_1 = require("./apify-client.service");
let RedditScraperService = RedditScraperService_1 = class RedditScraperService {
    apifyClient;
    logger = new common_1.Logger(RedditScraperService_1.name);
    ACTOR_ID = 'apify/reddit-scraper';
    constructor(apifyClient) {
        this.apifyClient = apifyClient;
    }
    async scrapeRedditFoodDiscussions(location, categories = []) {
        try {
            const subreddits = this.generateRelevantSubreddits(location);
            const searchTerms = this.generateSearchTerms(location, categories);
            const input = {
                subreddits: subreddits.slice(0, 10),
                search_terms: searchTerms.slice(0, 8),
                post_types: ['posts', 'comments'],
                time_filter: '7d',
            };
            const totalItems = input.subreddits.length * 50;
            const costEstimate = await this.apifyClient.estimateCost(this.ACTOR_ID, totalItems);
            if (!costEstimate.fits_daily_budget) {
                this.logger.warn(`Reddit scraping exceeds daily budget: $${costEstimate.estimated_cost_usd}`);
                return this.getFallbackData();
            }
            this.logger.log(`Starting Reddit scraping for ${location} (estimated cost: $${costEstimate.estimated_cost_usd})`);
            const run = await this.apifyClient.runActor(this.ACTOR_ID, {
                subreddits: input.subreddits,
                searches: input.search_terms,
                type: 'posts',
                sort: 'hot',
                time: input.time_filter,
                maxItems: 300,
                extendOutputFunction: `($) => {
          const text = ($.title + ' ' + ($.selfText || '')).toLowerCase();
          return {
            foodRelevant: /(restaurant|food|dining|eat|meal|delicious|cuisine)/gi.test(text),
            locationMentioned: text.includes('${location.toLowerCase()}'),
            recommendationPost: /recommend|suggestion|best|favorite|try/gi.test(text),
            engagementScore: $.score + $.numberOfComments * 2 + ($.awards || 0) * 5
          }
        }`,
            });
            const posts = await this.apifyClient.getDatasetItems(run.defaultDatasetId, {
                limit: 300,
                clean: true,
            });
            return this.analyzeRedditData(posts, location);
        }
        catch (error) {
            this.logger.error(`Reddit scraping failed for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
            return this.getFallbackData();
        }
    }
    generateRelevantSubreddits(location) {
        const cityName = location.split(',')[0].toLowerCase().replace(/\s+/g, '');
        const generalSubs = [
            'food',
            'FoodPorn',
            'recipes',
            'Cooking',
            'AskCulinary',
            'foodhacks',
            'MealPrepSunday',
            'budgetfood',
            'HealthyFood',
            'vegetarian',
            'vegan',
        ];
        const locationSubs = [
            cityName,
            `${cityName}food`,
            `${cityName}eats`,
            `eat${cityName}`,
        ];
        return [...generalSubs, ...locationSubs];
    }
    generateSearchTerms(location, categories) {
        const baseTerms = [
            `restaurant ${location}`,
            `food ${location}`,
            `dining ${location}`,
            `best eats ${location}`,
            `food recommendation ${location}`,
            `where to eat ${location}`,
        ];
        const categoryTerms = categories.map(cat => `${cat} restaurant ${location}`);
        return [...baseTerms, ...categoryTerms];
    }
    analyzeRedditData(posts, location) {
        const validPosts = posts.filter(post => post && post.title && (post.foodRelevant || post.locationMentioned));
        const hotTopics = this.extractHotTopics(validPosts);
        const communityRecommendations = this.extractRecommendations(validPosts);
        const totalUpvoteRatio = validPosts.reduce((sum, post) => sum + (post.upvoteRatio || 0.5), 0);
        const upvoteSentiment = validPosts.length > 0 ? totalUpvoteRatio / validPosts.length : 0.5;
        const subredditActivity = this.analyzeSubredditActivity(validPosts);
        const popularDiscussions = validPosts
            .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
            .slice(0, 10)
            .map(post => ({
            title: post.title.length > 80 ? post.title.substring(0, 77) + '...' : post.title,
            subreddit: `r/${post.subreddit}`,
            score: post.score || 0,
            url: post.url || '',
            engagement: post.numberOfComments + (post.awards || 0) * 5,
        }));
        const recommendationThreads = this.findRecommendationThreads(validPosts);
        const debateTopics = this.identifyDebateTopics(validPosts);
        const expertOpinions = this.extractExpertOpinions(validPosts);
        return {
            discussions_analyzed: validPosts.length,
            hot_topics: hotTopics,
            community_recommendations: communityRecommendations,
            upvote_sentiment: upvoteSentiment,
            subreddit_activity: subredditActivity,
            popular_discussions: popularDiscussions,
            community_insights: {
                recommendation_threads: recommendationThreads,
                debate_topics: debateTopics,
                expert_opinions: expertOpinions,
            },
        };
    }
    extractHotTopics(posts) {
        const topicCounts = new Map();
        const foodTopics = [
            'pizza', 'burger', 'sushi', 'tacos', 'ramen', 'bbq', 'italian', 'mexican',
            'chinese', 'indian', 'thai', 'japanese', 'korean', 'vietnamese',
            'breakfast', 'brunch', 'lunch', 'dinner', 'dessert', 'coffee', 'cocktails',
            'delivery', 'takeout', 'dine-in', 'food truck', 'fine dining', 'casual dining',
            'vegetarian', 'vegan', 'gluten-free', 'healthy', 'comfort food', 'street food'
        ];
        posts.forEach(post => {
            const text = (post.title + ' ' + (post.selfText || '')).toLowerCase();
            foodTopics.forEach(topic => {
                if (text.includes(topic)) {
                    const weight = (post.score || 0) + (post.numberOfComments || 0);
                    topicCounts.set(topic, (topicCounts.get(topic) || 0) + weight + 1);
                }
            });
        });
        return Array.from(topicCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(entry => entry[0]);
    }
    extractRecommendations(posts) {
        const recommendations = new Map();
        const recommendationPosts = posts.filter(post => post.recommendationPost && post.title.toLowerCase().includes('recommend'));
        recommendationPosts.forEach(post => {
            const text = post.title + ' ' + (post.selfText || '');
            const mentions = this.extractMentions(text, post.score || 0);
            mentions.forEach(mention => {
                recommendations.set(mention.item, (recommendations.get(mention.item) || 0) + mention.weight);
            });
        });
        return Array.from(recommendations.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(entry => entry[0]);
    }
    extractMentions(text, weight) {
        const mentions = [];
        const restaurantPatterns = [
            /\b([A-Z][a-zA-Z\s&'-]+(?:Restaurant|Cafe|Bar|Bistro|Kitchen|Grill|Pizza|Sushi|Diner|Eatery))\b/g,
            /\b(McDonald's|Starbucks|KFC|Burger King|Subway|Pizza Hut|Taco Bell|Chipotle|Panera|Wendy's|In-N-Out|Five Guys|Shake Shack)\b/g,
        ];
        restaurantPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    mentions.push({ item: match.trim(), weight: weight + 1 });
                });
            }
        });
        return mentions;
    }
    analyzeSubredditActivity(posts) {
        const activity = {};
        posts.forEach(post => {
            const subreddit = post.subreddit;
            if (!activity[subreddit]) {
                activity[subreddit] = { post_count: 0, engagement_score: 0 };
            }
            activity[subreddit].post_count++;
            activity[subreddit].engagement_score += (post.score || 0) + (post.numberOfComments || 0);
        });
        Object.keys(activity).forEach(subreddit => {
            if (activity[subreddit].post_count > 0) {
                activity[subreddit].engagement_score = Math.round(activity[subreddit].engagement_score / activity[subreddit].post_count);
            }
        });
        return activity;
    }
    findRecommendationThreads(posts) {
        const recommendationThreads = posts.filter(post => post.recommendationPost && post.numberOfComments > 5);
        return recommendationThreads
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 5)
            .map(post => {
            const topRecommendation = this.extractTopRecommendationFromComments(post);
            return {
                title: post.title.length > 60 ? post.title.substring(0, 57) + '...' : post.title,
                top_recommendation: topRecommendation,
                consensus_score: (post.upvoteRatio || 0.5) * (post.score || 0),
            };
        });
    }
    extractTopRecommendationFromComments(post) {
        const title = post.title.toLowerCase();
        if (title.includes('pizza'))
            return 'Local pizza recommendations';
        if (title.includes('burger'))
            return 'Burger joint suggestions';
        if (title.includes('sushi'))
            return 'Sushi restaurant picks';
        if (title.includes('coffee'))
            return 'Coffee shop favorites';
        if (title.includes('breakfast'))
            return 'Breakfast spot recommendations';
        return 'Community food recommendations';
    }
    identifyDebateTopics(posts) {
        const controversialPosts = posts.filter(post => {
            const upvoteRatio = post.upvoteRatio || 0.5;
            return upvoteRatio > 0.4 && upvoteRatio < 0.6 && post.numberOfComments > 10;
        });
        const debateTopics = [];
        controversialPosts.forEach(post => {
            const title = post.title.toLowerCase();
            if (title.includes('vs') || title.includes('better') || title.includes('overrated') || title.includes('unpopular')) {
                debateTopics.push(post.title.length > 50 ? post.title.substring(0, 47) + '...' : post.title);
            }
        });
        return debateTopics.slice(0, 8);
    }
    extractExpertOpinions(posts) {
        const expertPosts = posts.filter(post => (post.score || 0) > 50 &&
            post.selfText &&
            post.selfText.length > 200 &&
            post.author !== '[deleted]');
        return expertPosts
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 5)
            .map(post => ({
            author: `u/${post.author}`,
            opinion: post.selfText && post.selfText.length > 200
                ? post.selfText.substring(0, 197) + '...'
                : post.title,
            credibility_score: (post.score || 0) + (post.awards || 0) * 10,
        }));
    }
    getFallbackData() {
        return {
            discussions_analyzed: 0,
            hot_topics: [],
            community_recommendations: [],
            upvote_sentiment: 0.5,
            subreddit_activity: {},
            popular_discussions: [],
            community_insights: {
                recommendation_threads: [],
                debate_topics: [],
                expert_opinions: [],
            },
        };
    }
};
exports.RedditScraperService = RedditScraperService;
exports.RedditScraperService = RedditScraperService = RedditScraperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [apify_client_service_1.ApifyClientService])
], RedditScraperService);
//# sourceMappingURL=reddit-scraper.service.js.map