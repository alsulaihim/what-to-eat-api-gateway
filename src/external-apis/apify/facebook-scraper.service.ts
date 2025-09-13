import { Injectable, Logger } from '@nestjs/common';
import { ApifyClientService } from './apify-client.service';

export interface FacebookScrapingInput {
  page_urls: string[];
  keywords: string[];
  post_limit: number;
}

export interface FacebookPost {
  id: string;
  text: string;
  url: string;
  publishedAt: string;
  author: {
    name: string;
    profileUrl: string;
    verified?: boolean;
  };
  page: {
    name: string;
    url: string;
    likes?: number;
    followers?: number;
    category?: string;
  };
  stats: {
    likes: number;
    shares: number;
    comments: number;
    reactions: {
      like: number;
      love: number;
      haha: number;
      wow: number;
      sad: number;
      angry: number;
    };
  };
  mediaType: 'photo' | 'video' | 'text' | 'link';
  hashtags: string[];
  mentions: string[];
  foodRelevant: boolean;
  locationMentioned: boolean;
  eventPost: boolean;
  engagementScore: number;
}

export interface FacebookIntelligenceData {
  posts_analyzed: number;
  page_engagement: number;
  event_mentions: string[];
  community_sentiment: number;
  page_insights: {
    most_active_pages: Array<{
      name: string;
      category: string;
      engagement_rate: number;
      follower_count: number;
    }>;
    content_performance: {
      top_performing_posts: Array<{
        text: string;
        page: string;
        engagement: number;
        reactions_breakdown: any;
      }>;
      optimal_posting_times: number[];
      viral_content_patterns: string[];
    };
  };
  community_insights: {
    local_food_events: Array<{
      event_name: string;
      date: string;
      page: string;
      engagement: number;
    }>;
    restaurant_promotions: Array<{
      restaurant: string;
      promotion_type: string;
      engagement: number;
    }>;
    community_discussions: Array<{
      topic: string;
      sentiment: number;
      participation_level: number;
    }>;
  };
  trend_analysis: {
    emerging_restaurants: string[];
    popular_cuisines: Array<{
      cuisine: string;
      mention_count: number;
      sentiment: number;
    }>;
    seasonal_trends: string[];
  };
}

@Injectable()
export class FacebookScraperService {
  private readonly logger = new Logger(FacebookScraperService.name);
  private readonly ACTOR_ID = 'apify/facebook-pages-scraper';

  constructor(private readonly apifyClient: ApifyClientService) {}

  async scrapeFacebookFoodPages(location: string, categories: string[] = []): Promise<FacebookIntelligenceData> {
    try {
      const pageUrls = this.generateFoodPageUrls(location);
      const keywords = this.generateFoodKeywords(location, categories);

      const input: FacebookScrapingInput = {
        page_urls: pageUrls.slice(0, 15), // Limit pages for cost control
        keywords: keywords.slice(0, 8),
        post_limit: 250, // Balance between data quality and cost
      };

      // Estimate cost before running
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
        commentsMode: 'DISABLED', // Focus on posts, not comments for cost efficiency
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
      }) as FacebookPost[];

      return this.analyzeFacebookData(posts, location);
    } catch (error) {
      this.logger.error(`Facebook scraping failed for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
      return this.getFallbackData();
    }
  }

  private generateFoodPageUrls(location: string): string[] {
    const cityName = location.split(',')[0].toLowerCase().replace(/\s+/g, '');

    // These would be actual Facebook page URLs for local food pages
    const pageUrls = [
      // Generic food-related pages that might exist in any city
      `https://www.facebook.com/${cityName}foodie`,
      `https://www.facebook.com/${cityName}eats`,
      `https://www.facebook.com/${cityName}restaurants`,
      `https://www.facebook.com/eat${cityName}`,
      `https://www.facebook.com/${cityName}dining`,
      `https://www.facebook.com/${cityName}food.scene`,

      // General food community pages
      'https://www.facebook.com/foodnetwork',
      'https://www.facebook.com/tastyfood',
      'https://www.facebook.com/buzzfeedtasty',
      'https://www.facebook.com/foodandwine',
    ];

    return pageUrls;
  }

  private generateFoodKeywords(location: string, categories: string[]): string[] {
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

  private analyzeFacebookData(posts: FacebookPost[], location: string): FacebookIntelligenceData {
    const validPosts = posts.filter(post =>
      post && post.text && post.foodRelevant
    );

    // Calculate overall page engagement
    const pageEngagement = this.calculatePageEngagement(validPosts);

    // Extract event mentions
    const eventMentions = this.extractEventMentions(validPosts);

    // Calculate community sentiment
    const communitySentiment = this.calculateCommunitySentiment(validPosts);

    // Analyze page insights
    const pageInsights = this.analyzePageInsights(validPosts);

    // Analyze community insights
    const communityInsights = this.analyzeCommunityInsights(validPosts);

    // Perform trend analysis
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

  private calculatePageEngagement(posts: FacebookPost[]): number {
    if (posts.length === 0) return 0;

    const totalEngagement = posts.reduce((sum, post) => {
      return sum + (post.stats?.likes || 0) + (post.stats?.shares || 0) + (post.stats?.comments || 0);
    }, 0);

    const totalReach = posts.reduce((sum, post) => {
      return sum + ((post.page?.followers || 1000) * 0.1); // Estimate 10% reach
    }, 0);

    return totalReach > 0 ? totalEngagement / totalReach : 0;
  }

  private extractEventMentions(posts: FacebookPost[]): string[] {
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

    const eventMentions = new Map<string, number>();

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

  private calculateCommunitySentiment(posts: FacebookPost[]): number {
    const sentimentSum = posts.reduce((sum, post) => {
      return sum + this.analyzeSentiment(post.text, post.stats.reactions);
    }, 0);

    return posts.length > 0 ? sentimentSum / posts.length : 0;
  }

  private analyzeSentiment(text: string, reactions?: any): number {
    let sentiment = 0;

    // Text-based sentiment
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
      if (lowerText.includes(word)) sentiment += 0.1;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) sentiment -= 0.1;
    });

    // Reaction-based sentiment
    if (reactions) {
      const totalReactions = Object.values(reactions).reduce((sum: number, count: any) => sum + (count || 0), 0) as number;
      if (totalReactions > 0) {
        const positiveReactions = (reactions.like || 0) + (reactions.love || 0) + (reactions.wow || 0);
        const negativeReactions = (reactions.sad || 0) + (reactions.angry || 0);
        const reactionSentiment = (positiveReactions - negativeReactions) / (totalReactions as number);
        sentiment = (sentiment + reactionSentiment) / 2; // Average text and reaction sentiment
      }
    }

    return Math.max(-1, Math.min(1, sentiment));
  }

  private analyzePageInsights(posts: FacebookPost[]): {
    most_active_pages: Array<{
      name: string;
      category: string;
      engagement_rate: number;
      follower_count: number;
    }>;
    content_performance: {
      top_performing_posts: Array<{
        text: string;
        page: string;
        engagement: number;
        reactions_breakdown: any;
      }>;
      optimal_posting_times: number[];
      viral_content_patterns: string[];
    };
  } {
    // Analyze most active pages
    const pageStats = new Map<string, {
      posts: number;
      totalEngagement: number;
      followers: number;
      category: string;
    }>();

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

      const stats = pageStats.get(pageName)!;
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

    // Analyze content performance
    const topPosts = posts
      .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
      .slice(0, 8)
      .map(post => ({
        text: post.text.length > 100 ? post.text.substring(0, 97) + '...' : post.text,
        page: post.page?.name || 'Unknown',
        engagement: post.engagementScore || 0,
        reactions_breakdown: post.stats?.reactions || {},
      }));

    // Calculate optimal posting times
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

    // Identify viral content patterns
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

  private identifyViralPatterns(posts: FacebookPost[]): string[] {
    const highEngagementPosts = posts.filter(post => (post.engagementScore || 0) > 50);
    const patterns: string[] = [];

    // Common elements in high-engagement posts
    const commonElements = [
      { pattern: 'photos included', test: (post: FacebookPost) => post.mediaType === 'photo' },
      { pattern: 'question format', test: (post: FacebookPost) => post.text.includes('?') },
      { pattern: 'call to action', test: (post: FacebookPost) => /try|visit|check out|come|join/gi.test(post.text) },
      { pattern: 'emotional language', test: (post: FacebookPost) => /love|amazing|excited|thrilled/gi.test(post.text) },
      { pattern: 'behind the scenes', test: (post: FacebookPost) => /behind|kitchen|making|preparing/gi.test(post.text) },
      { pattern: 'limited time offers', test: (post: FacebookPost) => /limited|today only|special|deal/gi.test(post.text) },
    ];

    commonElements.forEach(element => {
      const matchingPosts = highEngagementPosts.filter(element.test).length;
      if (matchingPosts >= 3) {
        patterns.push(element.pattern);
      }
    });

    return patterns.slice(0, 6);
  }

  private analyzeCommunityInsights(posts: FacebookPost[]): {
    local_food_events: Array<{
      event_name: string;
      date: string;
      page: string;
      engagement: number;
    }>;
    restaurant_promotions: Array<{
      restaurant: string;
      promotion_type: string;
      engagement: number;
    }>;
    community_discussions: Array<{
      topic: string;
      sentiment: number;
      participation_level: number;
    }>;
  } {
    // Extract local food events
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

    // Extract restaurant promotions
    const promotionPosts = posts.filter(post =>
      /deal|discount|special|promotion|offer|happy hour|percent off|\$/gi.test(post.text)
    );

    const promotions = promotionPosts
      .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
      .slice(0, 8)
      .map(post => ({
        restaurant: post.page?.name || 'Unknown',
        promotion_type: this.classifyPromotion(post.text),
        engagement: post.engagementScore || 0,
      }));

    // Analyze community discussions
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

  private extractEventInfo(text: string): { name: string; date: string } {
    // Simplified event extraction
    const eventKeywords = ['event', 'special', 'night', 'festival', 'tasting', 'class'];

    let eventName = 'Special Event';
    eventKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        eventName = `${keyword.charAt(0).toUpperCase()}${keyword.slice(1)} Event`;
      }
    });

    // Simple date extraction (would be more sophisticated in production)
    const dateMatch = text.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\w+\s+\d{1,2}\b/);
    const date = dateMatch ? dateMatch[0] : 'Date TBD';

    return { name: eventName, date };
  }

  private classifyPromotion(text: string): string {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('happy hour')) return 'happy hour';
    if (lowerText.includes('discount') || lowerText.includes('% off')) return 'discount';
    if (lowerText.includes('special') && lowerText.includes('menu')) return 'menu special';
    if (lowerText.includes('deal')) return 'special deal';
    if (lowerText.includes('free')) return 'free offer';
    if (lowerText.includes('combo') || lowerText.includes('bundle')) return 'combo deal';

    return 'general promotion';
  }

  private findPostsAboutTopic(posts: FacebookPost[], topic: string): FacebookPost[] {
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

  private analyzeTrends(posts: FacebookPost[]): {
    emerging_restaurants: string[];
    popular_cuisines: Array<{
      cuisine: string;
      mention_count: number;
      sentiment: number;
    }>;
    seasonal_trends: string[];
  } {
    // Extract emerging restaurants (frequently mentioned new places)
    const restaurantMentions = new Map<string, { count: number; totalEngagement: number; isNew: boolean }>();

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

        const data = restaurantMentions.get(restaurant)!;
        data.count++;
        data.totalEngagement += post.engagementScore || 0;
        if (isNewRestaurant) data.isNew = true;
      });
    });

    const emergingRestaurants = Array.from(restaurantMentions.entries())
      .filter(([_, data]) => data.isNew && data.count >= 2)
      .sort((a, b) => b[1].totalEngagement - a[1].totalEngagement)
      .slice(0, 8)
      .map(([restaurant]) => restaurant);

    // Analyze popular cuisines
    const cuisines = [
      'italian', 'mexican', 'chinese', 'japanese', 'thai', 'indian', 'korean',
      'french', 'mediterranean', 'greek', 'vietnamese', 'american', 'pizza',
      'burger', 'sushi', 'bbq', 'seafood', 'vegetarian', 'vegan'
    ];

    const cuisineStats = new Map<string, { count: number; totalSentiment: number }>();

    posts.forEach(post => {
      const text = post.text.toLowerCase();
      const sentiment = this.analyzeSentiment(post.text, post.stats.reactions);

      cuisines.forEach(cuisine => {
        if (text.includes(cuisine)) {
          if (!cuisineStats.has(cuisine)) {
            cuisineStats.set(cuisine, { count: 0, totalSentiment: 0 });
          }
          const stats = cuisineStats.get(cuisine)!;
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

    // Identify seasonal trends
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

  private extractRestaurantNames(text: string): string[] {
    // Simplified restaurant name extraction
    const restaurantPatterns = [
      /\b([A-Z][a-zA-Z\s&'-]+(?:Restaurant|Cafe|Bar|Bistro|Kitchen|Grill|Pizza|Sushi|Diner|Eatery))\b/g,
      /\b(McDonald's|Starbucks|KFC|Burger King|Subway|Pizza Hut|Taco Bell|Chipotle|Panera|Wendy's)\b/g,
    ];

    const matches: string[] = [];
    restaurantPatterns.forEach(pattern => {
      const found = text.match(pattern);
      if (found) {
        matches.push(...found);
      }
    });

    return Array.from(new Set(matches)); // Remove duplicates
  }

  private getFallbackData(): FacebookIntelligenceData {
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
}