import { Injectable, Logger } from '@nestjs/common';
import { ApifyClientService } from './apify-client.service';

export interface InstagramScrapingInput {
  hashtags: string[];
  location_tags: string[];
  results_limit: number;
  include_stories: boolean;
}

export interface InstagramPost {
  id: string;
  shortCode: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  url: string;
  commentsCount: number;
  likesCount: number;
  timestamp: string;
  locationName?: string;
  ownerUsername: string;
  ownerFullName?: string;
  isVideo: boolean;
  videoViewCount?: number;
  foodMentions: number;
  locationRelevant: boolean;
  engagementRate: number;
}

export interface InstagramIntelligenceData {
  posts_analyzed: number;
  trending_hashtags: string[];
  viral_restaurants: string[];
  user_sentiment: number;
  engagement_metrics: {
    avg_likes: number;
    avg_comments: number;
    top_influencers: string[];
  };
  location_insights: {
    tagged_locations: string[];
    food_hotspots: string[];
    trending_dishes: string[];
  };
  temporal_patterns: {
    peak_posting_hours: number[];
    weekly_trends: string[];
  };
}

@Injectable()
export class InstagramScraperService {
  private readonly logger = new Logger(InstagramScraperService.name);
  private readonly ACTOR_ID = 'apify/instagram-scraper';

  constructor(private readonly apifyClient: ApifyClientService) {}

  async scrapeInstagramFoodTrends(location: string, categories: string[] = []): Promise<InstagramIntelligenceData> {
    try {
      const hashtags = this.apifyClient.generateLocationHashtags(location, categories);

      const input: InstagramScrapingInput = {
        hashtags: hashtags.slice(0, 10), // Limit to prevent excessive costs
        location_tags: [location, `${location} food`, `${location} restaurant`],
        results_limit: 200,
        include_stories: false, // Stories require more resources
      };

      // Estimate cost before running
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
      }) as InstagramPost[];

      return this.analyzeInstagramData(posts, location);
    } catch (error) {
      this.logger.error(`Instagram scraping failed for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
      return this.getFallbackData(location);
    }
  }

  private analyzeInstagramData(posts: InstagramPost[], location: string): InstagramIntelligenceData {
    const validPosts = posts.filter(post =>
      post && post.caption && post.foodMentions > 0
    );

    // Extract trending hashtags
    const hashtagCounts = new Map<string, number>();
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

    // Find viral restaurants mentioned
    const restaurantMentions = new Map<string, number>();
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

    // Calculate sentiment
    const sentimentSum = validPosts.reduce((sum, post) => {
      return sum + this.analyzeSentiment(post.caption);
    }, 0);
    const userSentiment = validPosts.length > 0 ? sentimentSum / validPosts.length : 0;

    // Engagement metrics
    const totalLikes = validPosts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
    const totalComments = validPosts.reduce((sum, post) => sum + (post.commentsCount || 0), 0);
    const avgLikes = validPosts.length > 0 ? totalLikes / validPosts.length : 0;
    const avgComments = validPosts.length > 0 ? totalComments / validPosts.length : 0;

    // Top influencers (high engagement users)
    const topInfluencers = validPosts
      .filter(post => post.engagementRate > 0.05) // 5% engagement rate threshold
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, 5)
      .map(post => `@${post.ownerUsername}`);

    // Location insights
    const locationTags = validPosts
      .filter(post => post.locationName)
      .map(post => post.locationName!)
      .filter(loc => loc.toLowerCase().includes(location.toLowerCase()));

    const uniqueLocations = Array.from(new Set(locationTags));
    const foodHotspots = uniqueLocations.slice(0, 10);

    // Extract trending dishes from captions
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

  private isFoodRelatedHashtag(tag: string): boolean {
    const foodKeywords = [
      'food', 'foodie', 'restaurant', 'dining', 'delicious', 'yummy',
      'tasty', 'eat', 'cooking', 'chef', 'cuisine', 'meal', 'dish',
      'pizza', 'burger', 'sushi', 'pasta', 'coffee', 'dessert',
      'breakfast', 'lunch', 'dinner', 'brunch', 'foodstagram'
    ];

    return foodKeywords.some(keyword => tag.includes(keyword));
  }

  private isRestaurantAccount(username: string): boolean {
    const restaurantKeywords = [
      'restaurant', 'cafe', 'bar', 'bistro', 'kitchen', 'grill',
      'pizza', 'sushi', 'burger', 'coffee', 'bakery', 'deli'
    ];

    const lowerUsername = username.toLowerCase();
    return restaurantKeywords.some(keyword => lowerUsername.includes(keyword));
  }

  private analyzeSentiment(text: string): number {
    if (!text) return 0;

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
      if (lowerText.includes(word)) sentiment += 0.1;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) sentiment -= 0.1;
    });

    return Math.max(-1, Math.min(1, sentiment));
  }

  private extractDishKeywords(text: string): string[] {
    const dishKeywords = [
      'pizza', 'burger', 'sushi', 'pasta', 'salad', 'steak', 'chicken',
      'fish', 'sandwich', 'soup', 'ramen', 'tacos', 'burrito', 'wings',
      'fries', 'dessert', 'cake', 'ice cream', 'coffee', 'cocktail',
      'wine', 'beer', 'smoothie', 'juice', 'pancakes', 'waffle',
      'omelet', 'bagel', 'donut', 'croissant', 'avocado toast'
    ];

    const lowerText = text.toLowerCase();
    const foundDishes = new Map<string, number>();

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

  private calculatePeakHours(posts: InstagramPost[]): number[] {
    const hourCounts = new Array(24).fill(0);

    posts.forEach(post => {
      if (post.timestamp) {
        const hour = new Date(post.timestamp).getHours();
        hourCounts[hour]++;
      }
    });

    // Return top 3 peak hours
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);
  }

  private calculateWeeklyTrends(posts: InstagramPost[]): string[] {
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

  private getFallbackData(location: string): InstagramIntelligenceData {
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
}