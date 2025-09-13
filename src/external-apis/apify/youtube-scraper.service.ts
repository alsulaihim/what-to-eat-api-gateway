import { Injectable, Logger } from '@nestjs/common';
import { ApifyClientService } from './apify-client.service';

export interface YouTubeScrapingInput {
  search_queries: string[];
  channel_ids: string[];
  video_limit: number;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  channel: {
    id: string;
    title: string;
    subscriberCount?: number;
    verified: boolean;
  };
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
  tags: string[];
  category: string;
  isLiveContent: boolean;
  foodRelevant: boolean;
  locationMentioned: boolean;
  engagementScore: number;
}

export interface YouTubeIntelligenceData {
  videos_analyzed: number;
  review_sentiment: number;
  channel_recommendations: string[];
  trending_food_content: string[];
  subscriber_influence: number;
  content_analysis: {
    top_reviewed_restaurants: Array<{
      name: string;
      review_count: number;
      avg_sentiment: number;
      recent_reviews: string[];
    }>;
    popular_food_categories: Array<{
      category: string;
      video_count: number;
      total_views: number;
    }>;
    trending_cooking_channels: Array<{
      channel: string;
      subscriber_count: number;
      content_focus: string;
      engagement_rate: number;
    }>;
  };
  video_insights: {
    optimal_video_length: string;
    peak_publishing_days: string[];
    viral_video_patterns: string[];
    audience_retention_factors: string[];
  };
}

@Injectable()
export class YouTubeScraperService {
  private readonly logger = new Logger(YouTubeScraperService.name);
  private readonly ACTOR_ID = 'apify/youtube-scraper';

  constructor(private readonly apifyClient: ApifyClientService) {}

  async scrapeYouTubeFoodReviews(location: string, categories: string[] = []): Promise<YouTubeIntelligenceData> {
    try {
      const searchQueries = this.generateSearchQueries(location, categories);
      const channelIds = this.getFoodChannelIds();

      const input: YouTubeScrapingInput = {
        search_queries: searchQueries.slice(0, 6), // Limit queries for cost control
        channel_ids: channelIds.slice(0, 8),
        video_limit: 200, // Balance between data quality and cost
      };

      // Estimate cost before running
      const costEstimate = await this.apifyClient.estimateCost(this.ACTOR_ID, input.video_limit);
      if (!costEstimate.fits_daily_budget) {
        this.logger.warn(`YouTube scraping exceeds daily budget: $${costEstimate.estimated_cost_usd}`);
        return this.getFallbackData();
      }

      this.logger.log(`Starting YouTube scraping for ${location} (estimated cost: $${costEstimate.estimated_cost_usd})`);

      const run = await this.apifyClient.runActor(this.ACTOR_ID, {
        searchKeywords: input.search_queries,
        maxVideos: input.video_limit,
        uploadDate: 'thisMonth', // Focus on recent content
        videoDuration: 'medium', // 4-20 minutes typically best for food content
        extendOutputFunction: `($) => {
          const text = ($.title + ' ' + ($.description || '')).toLowerCase();
          return {
            foodRelevant: /(food|restaurant|recipe|cooking|eat|meal|review|taste|delicious|chef|kitchen|dining)/gi.test(text),
            locationMentioned: text.includes('${location.toLowerCase()}'),
            engagementScore: ($.viewCount || 0) * 0.1 + ($.likeCount || 0) + ($.commentCount || 0) * 2,
            tags: $.tags || [],
            category: $.category || 'Unknown'
          }
        }`,
      });

      const videos = await this.apifyClient.getDatasetItems(run.defaultDatasetId, {
        limit: input.video_limit,
        clean: true,
      }) as YouTubeVideo[];

      return this.analyzeYouTubeData(videos, location);
    } catch (error) {
      this.logger.error(`YouTube scraping failed for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
      return this.getFallbackData();
    }
  }

  private generateSearchQueries(location: string, categories: string[]): string[] {
    const baseQueries = [
      `best restaurants ${location}`,
      `${location} food review`,
      `${location} food guide`,
      `eating in ${location}`,
      `${location} must try food`,
      `${location} local food`,
    ];

    const categoryQueries = categories.map(cat => `best ${cat} ${location}`);

    return [...baseQueries, ...categoryQueries];
  }

  private getFoodChannelIds(): string[] {
    // These would be actual YouTube channel IDs for popular food channels
    return [
      // Major food review channels
      'UCpko_-a4wgz2u_DgDgd9fqA', // Food Insider
      'UCbpMy0Fg74eXXkvxJrtEn3w', // Tasty
      'UChBEbMKI1eCcejTtmI32UEw', // Bon Appétit
      'UCRzPUBhXUZHclB7B5bURFXw', // Joshua Weissman
      'UCekQr9znsk2vWxBo3YiLq2w', // Gordon Ramsay
      'UC4s9q5SBIXkFWo3-z_KSAOQ', // Binging with Babish
      // Add location-specific food channels if available
    ];
  }

  private analyzeYouTubeData(videos: YouTubeVideo[], location: string): YouTubeIntelligenceData {
    const validVideos = videos.filter(video =>
      video && video.title && video.foodRelevant
    );

    // Calculate review sentiment
    const reviewSentiment = this.calculateReviewSentiment(validVideos);

    // Extract channel recommendations
    const channelRecommendations = this.extractChannelRecommendations(validVideos);

    // Identify trending food content
    const trendingFoodContent = this.extractTrendingContent(validVideos);

    // Calculate subscriber influence
    const subscriberInfluence = this.calculateSubscriberInfluence(validVideos);

    // Content analysis
    const contentAnalysis = this.analyzeContent(validVideos, location);

    // Video insights
    const videoInsights = this.analyzeVideoInsights(validVideos);

    return {
      videos_analyzed: validVideos.length,
      review_sentiment: reviewSentiment,
      channel_recommendations: channelRecommendations,
      trending_food_content: trendingFoodContent,
      subscriber_influence: subscriberInfluence,
      content_analysis: contentAnalysis,
      video_insights: videoInsights,
    };
  }

  private calculateReviewSentiment(videos: YouTubeVideo[]): number {
    const reviewVideos = videos.filter(video =>
      video.title.toLowerCase().includes('review') ||
      video.description.toLowerCase().includes('review')
    );

    if (reviewVideos.length === 0) return 0;

    const sentimentSum = reviewVideos.reduce((sum, video) => {
      return sum + this.analyzeSentiment(video.title + ' ' + video.description);
    }, 0);

    return sentimentSum / reviewVideos.length;
  }

  private analyzeSentiment(text: string): number {
    if (!text) return 0;

    const positiveWords = [
      'amazing', 'excellent', 'incredible', 'fantastic', 'wonderful', 'great',
      'best', 'perfect', 'love', 'outstanding', 'superb', 'brilliant',
      'awesome', 'exceptional', 'remarkable', 'divine', 'heavenly',
      'scrumptious', 'delicious', 'yummy', 'tasty', 'flavorful', 'must try',
      'highly recommend', 'worth it', 'impressed', 'satisfied'
    ];

    const negativeWords = [
      'terrible', 'awful', 'bad', 'horrible', 'disgusting', 'worst',
      'hate', 'disappointing', 'poor', 'bland', 'tasteless', 'overpriced',
      'rude', 'slow', 'cold', 'burnt', 'soggy', 'stale', 'nasty',
      'avoid', 'waste of money', 'not worth it', 'disappointed'
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

  private extractChannelRecommendations(videos: YouTubeVideo[]): string[] {
    const channelScores = new Map<string, {
      videos: number;
      totalViews: number;
      totalEngagement: number;
      verified: boolean;
      subscribers: number;
    }>();

    videos.forEach(video => {
      const channelName = video.channel.title;
      if (!channelScores.has(channelName)) {
        channelScores.set(channelName, {
          videos: 0,
          totalViews: 0,
          totalEngagement: 0,
          verified: video.channel.verified || false,
          subscribers: video.channel.subscriberCount || 0,
        });
      }

      const stats = channelScores.get(channelName)!;
      stats.videos++;
      stats.totalViews += video.viewCount || 0;
      stats.totalEngagement += video.engagementScore || 0;
    });

    return Array.from(channelScores.entries())
      .sort((a, b) => {
        const scoreA = a[1].totalViews + (a[1].verified ? 500000 : 0) + a[1].subscribers * 0.01;
        const scoreB = b[1].totalViews + (b[1].verified ? 500000 : 0) + b[1].subscribers * 0.01;
        return scoreB - scoreA;
      })
      .slice(0, 8)
      .map(([channelName]) => channelName);
  }

  private extractTrendingContent(videos: YouTubeVideo[]): string[] {
    const contentCounts = new Map<string, { count: number; totalViews: number }>();

    const trendingTopics = [
      'viral food', 'trending recipe', 'food hack', 'cooking tip', 'must try',
      'popular restaurant', 'new opening', 'chef special', 'signature dish',
      'food challenge', 'eating challenge', 'taste test', 'food review',
      'cooking tutorial', 'recipe tutorial', 'how to cook', 'homemade',
      'street food', 'local food', 'hidden gem', 'food truck'
    ];

    videos.forEach(video => {
      const text = (video.title + ' ' + video.description).toLowerCase();
      trendingTopics.forEach(topic => {
        if (text.includes(topic)) {
          if (!contentCounts.has(topic)) {
            contentCounts.set(topic, { count: 0, totalViews: 0 });
          }
          const current = contentCounts.get(topic)!;
          current.count++;
          current.totalViews += video.viewCount || 0;
        }
      });
    });

    return Array.from(contentCounts.entries())
      .sort((a, b) => (b[1].totalViews + b[1].count * 10000) - (a[1].totalViews + a[1].count * 10000))
      .slice(0, 10)
      .map(([topic]) => topic);
  }

  private calculateSubscriberInfluence(videos: YouTubeVideo[]): number {
    const totalSubscribers = videos.reduce((sum, video) => {
      return sum + (video.channel.subscriberCount || 0);
    }, 0);

    // Average subscribers across all channels, normalized
    const avgSubscribers = videos.length > 0 ? totalSubscribers / videos.length : 0;
    return Math.min(1, avgSubscribers / 1000000); // Normalize to millions
  }

  private analyzeContent(videos: YouTubeVideo[], location: string): {
    top_reviewed_restaurants: Array<{
      name: string;
      review_count: number;
      avg_sentiment: number;
      recent_reviews: string[];
    }>;
    popular_food_categories: Array<{
      category: string;
      video_count: number;
      total_views: number;
    }>;
    trending_cooking_channels: Array<{
      channel: string;
      subscriber_count: number;
      content_focus: string;
      engagement_rate: number;
    }>;
  } {
    // Extract restaurant reviews
    const restaurantMentions = this.extractRestaurantMentions(videos, location);

    // Analyze food categories
    const categoryStats = new Map<string, { count: number; views: number }>();
    videos.forEach(video => {
      const category = this.categorizeFoodVideo(video);
      if (!categoryStats.has(category)) {
        categoryStats.set(category, { count: 0, views: 0 });
      }
      const stats = categoryStats.get(category)!;
      stats.count++;
      stats.views += video.viewCount || 0;
    });

    const popularCategories = Array.from(categoryStats.entries())
      .sort((a, b) => b[1].views - a[1].views)
      .slice(0, 8)
      .map(([category, stats]) => ({
        category,
        video_count: stats.count,
        total_views: stats.views,
      }));

    // Analyze cooking channels
    const cookingChannels = this.analyzeCookingChannels(videos);

    return {
      top_reviewed_restaurants: restaurantMentions,
      popular_food_categories: popularCategories,
      trending_cooking_channels: cookingChannels,
    };
  }

  private extractRestaurantMentions(videos: YouTubeVideo[], location: string): Array<{
    name: string;
    review_count: number;
    avg_sentiment: number;
    recent_reviews: string[];
  }> {
    const restaurantData = new Map<string, {
      count: number;
      sentiments: number[];
      videos: string[];
    }>();

    videos.forEach(video => {
      const restaurants = this.findRestaurantNames(video.title + ' ' + video.description);
      restaurants.forEach(restaurant => {
        if (!restaurantData.has(restaurant)) {
          restaurantData.set(restaurant, {
            count: 0,
            sentiments: [],
            videos: [],
          });
        }

        const data = restaurantData.get(restaurant)!;
        data.count++;
        data.sentiments.push(this.analyzeSentiment(video.title + ' ' + video.description));
        data.videos.push(video.title);
      });
    });

    return Array.from(restaurantData.entries())
      .filter(([_, data]) => data.count >= 2) // Only restaurants mentioned multiple times
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([name, data]) => ({
        name,
        review_count: data.count,
        avg_sentiment: data.sentiments.reduce((sum, s) => sum + s, 0) / data.sentiments.length,
        recent_reviews: data.videos.slice(0, 3),
      }));
  }

  private findRestaurantNames(text: string): string[] {
    // Simplified restaurant name extraction
    const restaurantPatterns = [
      /\b([A-Z][a-zA-Z\s&'-]+(?:Restaurant|Cafe|Bar|Bistro|Kitchen|Grill|Pizza|Sushi|Diner|Eatery))\b/g,
      /\b(McDonald's|Starbucks|KFC|Burger King|Subway|Pizza Hut|Taco Bell|Chipotle|Panera|Wendy's|In-N-Out|Five Guys|Shake Shack)\b/g,
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

  private categorizeFoodVideo(video: YouTubeVideo): string {
    const title = video.title.toLowerCase();
    const description = video.description.toLowerCase();
    const text = title + ' ' + description;

    const categories = [
      { name: 'restaurant review', keywords: ['review', 'restaurant', 'dining', 'eat at'] },
      { name: 'recipe tutorial', keywords: ['recipe', 'how to make', 'tutorial', 'cooking'] },
      { name: 'food challenge', keywords: ['challenge', 'eating challenge', 'food challenge'] },
      { name: 'taste test', keywords: ['taste test', 'trying', 'tasting', 'first time'] },
      { name: 'street food', keywords: ['street food', 'food truck', 'vendor'] },
      { name: 'fine dining', keywords: ['fine dining', 'michelin', 'upscale', 'expensive'] },
      { name: 'dessert', keywords: ['dessert', 'sweet', 'cake', 'ice cream', 'pastry'] },
      { name: 'healthy food', keywords: ['healthy', 'diet', 'nutrition', 'fitness', 'weight loss'] },
    ];

    for (const category of categories) {
      if (category.keywords.some(keyword => text.includes(keyword))) {
        return category.name;
      }
    }

    return 'general food';
  }

  private analyzeCookingChannels(videos: YouTubeVideo[]): Array<{
    channel: string;
    subscriber_count: number;
    content_focus: string;
    engagement_rate: number;
  }> {
    const cookingVideos = videos.filter(video =>
      this.isCookingChannel(video.title + ' ' + video.description)
    );

    const channelStats = new Map<string, {
      videos: number;
      subscribers: number;
      totalViews: number;
      totalEngagement: number;
      contentTypes: string[];
    }>();

    cookingVideos.forEach(video => {
      const channel = video.channel.title;
      if (!channelStats.has(channel)) {
        channelStats.set(channel, {
          videos: 0,
          subscribers: video.channel.subscriberCount || 0,
          totalViews: 0,
          totalEngagement: 0,
          contentTypes: [],
        });
      }

      const stats = channelStats.get(channel)!;
      stats.videos++;
      stats.totalViews += video.viewCount || 0;
      stats.totalEngagement += video.engagementScore || 0;
      stats.contentTypes.push(this.categorizeFoodVideo(video));
    });

    return Array.from(channelStats.entries())
      .sort((a, b) => b[1].totalEngagement - a[1].totalEngagement)
      .slice(0, 6)
      .map(([channel, stats]) => ({
        channel,
        subscriber_count: stats.subscribers,
        content_focus: this.getMostCommonContentType(stats.contentTypes),
        engagement_rate: stats.totalViews > 0 ? stats.totalEngagement / stats.totalViews : 0,
      }));
  }

  private isCookingChannel(text: string): boolean {
    const cookingKeywords = [
      'recipe', 'cooking', 'tutorial', 'how to make', 'chef', 'kitchen',
      'baking', 'homemade', 'easy recipe', 'quick recipe'
    ];

    const lowerText = text.toLowerCase();
    return cookingKeywords.some(keyword => lowerText.includes(keyword));
  }

  private getMostCommonContentType(contentTypes: string[]): string {
    const counts = new Map<string, number>();
    contentTypes.forEach(type => {
      counts.set(type, (counts.get(type) || 0) + 1);
    });

    let mostCommon = 'general cooking';
    let maxCount = 0;

    counts.forEach((count, type) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = type;
      }
    });

    return mostCommon;
  }

  private analyzeVideoInsights(videos: YouTubeVideo[]): {
    optimal_video_length: string;
    peak_publishing_days: string[];
    viral_video_patterns: string[];
    audience_retention_factors: string[];
  } {
    // Analyze video duration patterns
    const durationCounts = new Map<string, { count: number; totalViews: number }>();
    videos.forEach(video => {
      const duration = this.categorizeDuration(video.duration);
      if (!durationCounts.has(duration)) {
        durationCounts.set(duration, { count: 0, totalViews: 0 });
      }
      const stats = durationCounts.get(duration)!;
      stats.count++;
      stats.totalViews += video.viewCount || 0;
    });

    const optimalLength = Array.from(durationCounts.entries())
      .sort((a, b) => (b[1].totalViews / b[1].count) - (a[1].totalViews / a[1].count))
      .slice(0, 1)
      .map(([duration]) => duration)[0] || 'medium (4-20 minutes)';

    // Analyze publishing patterns
    const dayStats = new Map<string, number>();
    videos.forEach(video => {
      const day = new Date(video.publishedAt).toLocaleDateString('en-US', { weekday: 'long' });
      dayStats.set(day, (dayStats.get(day) || 0) + (video.viewCount || 0));
    });

    const peakDays = Array.from(dayStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    // Identify viral patterns
    const topVideos = videos
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 10);

    const viralPatterns = this.extractViralPatterns(topVideos);

    // Retention factors
    const retentionFactors = [
      'engaging thumbnail',
      'compelling title',
      'early hook',
      'clear structure',
      'practical tips',
      'personality-driven',
    ];

    return {
      optimal_video_length: optimalLength,
      peak_publishing_days: peakDays,
      viral_video_patterns: viralPatterns,
      audience_retention_factors: retentionFactors,
    };
  }

  private categorizeDuration(duration: string): string {
    // Parse duration (simplified - assumes format like "PT10M30S")
    if (!duration) return 'unknown';

    const minutes = duration.match(/(\d+)M/);
    const mins = minutes ? parseInt(minutes[1]) : 0;

    if (mins < 2) return 'short (< 2 minutes)';
    if (mins < 4) return 'brief (2-4 minutes)';
    if (mins < 10) return 'medium (4-10 minutes)';
    if (mins < 20) return 'standard (10-20 minutes)';
    return 'long (20+ minutes)';
  }

  private extractViralPatterns(topVideos: YouTubeVideo[]): string[] {
    const patterns: string[] = [];

    const titles = topVideos.map(v => v.title.toLowerCase());
    const commonWords = ['best', 'try', 'amazing', 'viral', 'secret', 'ultimate', 'perfect', 'easy'];

    commonWords.forEach(word => {
      const count = titles.filter(title => title.includes(word)).length;
      if (count >= 3) {
        patterns.push(`titles containing "${word}"`);
      }
    });

    // Add other patterns
    if (topVideos.some(v => v.title.includes('$') || v.title.includes('cheap'))) {
      patterns.push('price-focused content');
    }

    if (topVideos.some(v => v.title.toLowerCase().includes('vs'))) {
      patterns.push('comparison content');
    }

    return patterns.slice(0, 6);
  }

  private getFallbackData(): YouTubeIntelligenceData {
    return {
      videos_analyzed: 0,
      review_sentiment: 0,
      channel_recommendations: [],
      trending_food_content: [],
      subscriber_influence: 0,
      content_analysis: {
        top_reviewed_restaurants: [],
        popular_food_categories: [],
        trending_cooking_channels: [],
      },
      video_insights: {
        optimal_video_length: 'unknown',
        peak_publishing_days: [],
        viral_video_patterns: [],
        audience_retention_factors: [],
      },
    };
  }
}