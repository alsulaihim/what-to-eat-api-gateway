import { Injectable, Logger } from '@nestjs/common';
import { ApifySocialIntelligence } from '../common/types/intelligence.types';
import { InstagramScraperService } from '../external-apis/apify/instagram-scraper.service';
import { TwitterScraperService } from '../external-apis/apify/twitter-scraper.service';
import { RedditScraperService } from '../external-apis/apify/reddit-scraper.service';
import { TikTokScraperService } from '../external-apis/apify/tiktok-scraper.service';
import { YouTubeScraperService } from '../external-apis/apify/youtube-scraper.service';
import { FacebookScraperService } from '../external-apis/apify/facebook-scraper.service';
import { ApifyClientService } from '../external-apis/apify/apify-client.service';
import { SocialMediaDemographicFilter, DemographicData } from '../common/types/demographic.types';

@Injectable()
export class ApifySocialIntelligenceService {
  private readonly logger = new Logger(ApifySocialIntelligenceService.name);

  constructor(
    private readonly instagramScraper: InstagramScraperService,
    private readonly twitterScraper: TwitterScraperService,
    private readonly redditScraper: RedditScraperService,
    private readonly tiktokScraper: TikTokScraperService,
    private readonly youtubeScraper: YouTubeScraperService,
    private readonly facebookScraper: FacebookScraperService,
    private readonly apifyClient: ApifyClientService,
  ) {}

  async orchestrateSocialIntelligence(location: string, categories: string[] = []): Promise<ApifySocialIntelligence> {
    try {
      this.logger.log(`Starting comprehensive social media intelligence for ${location}`);

      // Parallel execution of all platform scrapers with error handling
      const scrapingResults = await Promise.allSettled([
        this.instagramScraper.scrapeInstagramFoodTrends(location, categories),
        this.twitterScraper.scrapeTwitterFoodMentions(location, categories),
        this.redditScraper.scrapeRedditFoodDiscussions(location, categories),
        this.tiktokScraper.scrapeTikTokFoodTrends(location, categories),
        this.youtubeScraper.scrapeYouTubeFoodReviews(location, categories),
        this.facebookScraper.scrapeFacebookFoodPages(location, categories),
      ]);

      // Process results and handle failures gracefully
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

      // Log any failures for monitoring
      scrapingResults.forEach((result, index) => {
        const platforms = ['Instagram', 'Twitter', 'Reddit', 'TikTok', 'YouTube', 'Facebook'];
        if (result.status === 'rejected') {
          this.logger.warn(`${platforms[index]} scraping failed: ${result.reason?.message || 'Unknown error'}`);
        }
      });

      // Perform cross-platform analysis
      const crossPlatformAnalysis = this.analyzeCrossPlatformData(
        instagramData,
        twitterData,
        redditData,
        tiktokData,
        youtubeData,
        facebookData
      );

      // Generate AI insights
      const aiInsights = await this.generateAIInsights(crossPlatformAnalysis);

      // Calculate cost tracking
      const costTracking = await this.calculateCostTracking();

      const socialIntelligence: ApifySocialIntelligence = {
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

    } catch (error) {
      this.logger.error(`Social media intelligence failed for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
      return this.getFallbackSocialIntelligence();
    }
  }

  private analyzeCrossPlatformData(
    instagram: any,
    twitter: any,
    reddit: any,
    tiktok: any,
    youtube: any,
    facebook: any
  ): {
    unified_sentiment: number;
    viral_convergence: string[];
    platform_influence_ranking: string[];
    trend_lifecycle: {
      emerging: string[];
      peak: string[];
      declining: string[];
    };
  } {
    // Calculate unified sentiment across all platforms
    const sentiments = [
      { platform: 'instagram', sentiment: instagram.user_sentiment, weight: 0.2 },
      { platform: 'twitter', sentiment: twitter.mention_sentiment, weight: 0.25 },
      { platform: 'reddit', sentiment: reddit.upvote_sentiment, weight: 0.15 },
      { platform: 'tiktok', sentiment: 0.5, weight: 0.15 }, // TikTok doesn't have direct sentiment
      { platform: 'youtube', sentiment: youtube.review_sentiment, weight: 0.15 },
      { platform: 'facebook', sentiment: facebook.community_sentiment, weight: 0.1 },
    ];

    const unifiedSentiment = sentiments.reduce((sum, item) => {
      return sum + (item.sentiment * item.weight);
    }, 0);

    // Find viral convergence (trends appearing across multiple platforms)
    const allTrends = [
      ...instagram.trending_hashtags.map(h => h.replace('#', '')),
      ...twitter.trending_topics.map(t => t.replace('#', '')),
      ...reddit.hot_topics,
      ...tiktok.viral_food_trends,
      ...youtube.trending_food_content,
      ...facebook.event_mentions,
    ];

    const trendCounts = new Map<string, number>();
    allTrends.forEach(trend => {
      const normalizedTrend = trend.toLowerCase();
      trendCounts.set(normalizedTrend, (trendCounts.get(normalizedTrend) || 0) + 1);
    });

    const viralConvergence = Array.from(trendCounts.entries())
      .filter(([_, count]) => count >= 3) // Appears on 3+ platforms
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([trend]) => trend);

    // Rank platform influence based on engagement and reach
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

    // Analyze trend lifecycle (simplified)
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

  private async generateAIInsights(crossPlatformData: any): Promise<{
    authenticity_score: number;
    trend_sustainability: number;
    local_vs_global: 'local' | 'global' | 'mixed';
    demographic_appeal: string[];
    optimal_recommendation_timing: string;
  }> {
    // Calculate authenticity score based on cross-platform consistency
    const authenticityScore = crossPlatformData.viral_convergence.length > 0 ? 0.8 : 0.4;

    // Estimate trend sustainability based on platform diversity
    const platformCount = crossPlatformData.platform_influence_ranking.length;
    const trendSustainability = Math.min(1, platformCount / 6);

    // Determine local vs global scope
    let localVsGlobal: 'local' | 'global' | 'mixed' = 'mixed';
    if (crossPlatformData.viral_convergence.length > 5) {
      localVsGlobal = 'global';
    } else if (crossPlatformData.viral_convergence.length < 2) {
      localVsGlobal = 'local';
    }

    // Generate demographic appeal
    const demographicAppeal = ['millennials', 'gen z', 'food enthusiasts'];

    // Determine optimal recommendation timing
    const optimalTiming = 'peak posting hours: 11am-2pm, 6pm-9pm';

    return {
      authenticity_score: authenticityScore,
      trend_sustainability: trendSustainability,
      local_vs_global: localVsGlobal,
      demographic_appeal: demographicAppeal,
      optimal_recommendation_timing: optimalTiming,
    };
  }

  private async calculateCostTracking(): Promise<{
    apify_units_consumed: number;
    estimated_monthly_cost: number;
    cost_per_intelligence_query: number;
    optimization_suggestions: string[];
  }> {
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
    } catch (error) {
      this.logger.warn('Failed to calculate cost tracking:', error instanceof Error ? error.message : 'Unknown error');
      return {
        apify_units_consumed: 0,
        estimated_monthly_cost: 0,
        cost_per_intelligence_query: 0,
        optimization_suggestions: [],
      };
    }
  }

  async orchestrateDemographicFilteredIntelligence(
    location: string,
    categories: string[] = [],
    demographicFilter?: SocialMediaDemographicFilter
  ): Promise<ApifySocialIntelligence> {
    try {
      this.logger.log(`Starting demographic-filtered social media intelligence for ${location}`);

      if (!demographicFilter) {
        // If no demographic filter provided, use standard intelligence
        return this.orchestrateSocialIntelligence(location, categories);
      }

      // Generate demographic-specific hashtags and keywords
      const demographicHashtags = this.generateDemographicHashtags(demographicFilter);
      const demographicKeywords = this.generateDemographicKeywords(demographicFilter);

      // Enhanced categories with demographic preferences
      const enhancedCategories = this.enhanceCategoriesWithDemographics(categories, demographicFilter);

      // Parallel execution with demographic filtering (using regular calls for now)
      const scrapingResults = await Promise.allSettled([
        this.instagramScraper.scrapeInstagramFoodTrends(location, enhancedCategories),
        this.twitterScraper.scrapeTwitterFoodMentions(location, enhancedCategories),
        this.redditScraper.scrapeRedditFoodDiscussions(location, enhancedCategories),
        this.tiktokScraper.scrapeTikTokFoodTrends(location, enhancedCategories),
        this.youtubeScraper.scrapeYouTubeFoodReviews(location, enhancedCategories),
        this.facebookScraper.scrapeFacebookFoodPages(location, enhancedCategories),
      ]);

      // Process results and handle failures gracefully
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

      // Analyze cross-platform data with demographic context
      const crossPlatformAnalysis = this.analyzeDemographicCrossPlatformData(
        instagramData, twitterData, redditData, tiktokData, youtubeData, facebookData, demographicFilter
      );

      // Generate demographic-specific AI insights
      const aiInsights = this.generateDemographicAIInsights(
        instagramData, twitterData, redditData, tiktokData, youtubeData, facebookData, demographicFilter
      );

      // Track demographic filtering costs
      const costTracking = await this.calculateDemographicFilteringCosts(demographicFilter);

      const socialIntelligence: ApifySocialIntelligence = {
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

    } catch (error) {
      this.logger.error(`Demographic-filtered social media intelligence failed for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
      return this.getFallbackSocialIntelligence();
    }
  }

  private generateDemographicHashtags(filter: SocialMediaDemographicFilter): string[] {
    const hashtags: string[] = [];

    // Age-based hashtags
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

    // Cultural background hashtags
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

  private generateDemographicKeywords(filter: SocialMediaDemographicFilter): string[] {
    const keywords: string[] = ['food', 'restaurant', 'dining'];

    // Income-based keywords
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

    // Family structure keywords
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

  private enhanceCategoriesWithDemographics(categories: string[], filter: SocialMediaDemographicFilter): string[] {
    const enhanced = [...categories];

    // Add cultural cuisine preferences
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

    return [...new Set(enhanced)]; // Remove duplicates
  }

  private applyDemographicFilter(platformData: any, filter: SocialMediaDemographicFilter, platform: string): any {
    // Apply demographic filtering to platform data
    // This is a simplified implementation - in production, this would do more sophisticated filtering
    const filtered = { ...platformData };

    // Filter content based on spice tolerance
    if (filter.minSpiceTolerance || filter.maxSpiceTolerance) {
      // Filter spicy content based on tolerance levels
      if (platform === 'instagram' && filtered.trending_hashtags) {
        filtered.trending_hashtags = filtered.trending_hashtags.filter((hashtag: string) => {
          const isSpicy = hashtag.toLowerCase().includes('spicy') || hashtag.toLowerCase().includes('hot');
          return !isSpicy || (filter.minSpiceTolerance && filter.minSpiceTolerance >= 6);
        });
      }
    }

    // Filter content based on authenticity preference
    if (filter.minAuthenticityPreference) {
      // Boost authentic/traditional content for users with high authenticity preference
      if (platform === 'reddit' && filtered.community_recommendations) {
        filtered.community_recommendations = filtered.community_recommendations.map((rec: any) => ({
          ...rec,
          authenticity_boost: filter.minAuthenticityPreference >= 7 ? 1.3 : 1.0
        }));
      }
    }

    return filtered;
  }

  private analyzeDemographicCrossPlatformData(
    instagram: any, twitter: any, reddit: any, tiktok: any, youtube: any, facebook: any,
    filter: SocialMediaDemographicFilter
  ): any {
    const baseAnalysis = this.analyzeCrossPlatformData(instagram, twitter, reddit, tiktok, youtube, facebook);

    // Add demographic-specific analysis
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

  private analyzeDemographicTrends(filter: SocialMediaDemographicFilter, category: string): string[] {
    // Simplified demographic trend analysis
    const trends: string[] = [];

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

  private generateDemographicAIInsights(
    instagram: any, twitter: any, reddit: any, tiktok: any, youtube: any, facebook: any,
    filter: SocialMediaDemographicFilter
  ): any {
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

  private calculateDemographicAppeal(filter: SocialMediaDemographicFilter): string[] {
    const appeal: string[] = [];

    if (filter.ageGroups?.includes('18-24')) {
      appeal.push('High social media presence', 'Trendy atmosphere', 'Late hours');
    }
    if (filter.culturalBackgrounds?.includes('asian')) {
      appeal.push('Authentic flavors', 'Traditional preparation', 'Cultural significance');
    }

    return appeal;
  }

  private assessCulturalAuthenticity(filter: SocialMediaDemographicFilter): number {
    // Return authenticity score based on cultural background preferences
    if (filter.minAuthenticityPreference) {
      return filter.minAuthenticityPreference / 10;
    }
    return 0.7; // Default moderate authenticity preference
  }

  private identifyAgeAppropriateVenues(filter: SocialMediaDemographicFilter): string[] {
    const venues: string[] = [];

    if (filter.ageGroups?.includes('18-24')) {
      venues.push('Trendy cafes', 'Food trucks', 'Late night spots');
    }
    if (filter.ageGroups?.includes('35-44')) {
      venues.push('Family restaurants', 'Wine bars', 'Quiet atmospheres');
    }

    return venues;
  }

  private findIncomeAlignedOptions(filter: SocialMediaDemographicFilter): string[] {
    const options: string[] = [];

    if (filter.incomeBrackets?.includes('low')) {
      options.push('Value meals', 'Happy hours', 'Lunch specials');
    }
    if (filter.incomeBrackets?.includes('high')) {
      options.push('Tasting menus', 'Premium ingredients', 'Wine pairings');
    }

    return options;
  }

  private async calculateDemographicFilteringCosts(filter?: SocialMediaDemographicFilter): Promise<any> {
    try {
      const baseCosts = await this.calculateCostTracking();

      // Demographic filtering may increase costs due to more targeted queries
      const demographicMultiplier = filter ? 1.2 : 1.0; // 20% increase for demographic filtering

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
    } catch (error) {
      this.logger.warn('Failed to calculate demographic filtering costs:', error instanceof Error ? error.message : 'Unknown error');
      return await this.calculateCostTracking();
    }
  }

  // Fallback data methods
  private getFallbackInstagramData() {
    return {
      posts_analyzed: 0,
      trending_hashtags: [],
      viral_restaurants: [],
      user_sentiment: 0,
      engagement_metrics: { avg_likes: 0, avg_comments: 0, top_influencers: [] },
    };
  }

  private getFallbackTwitterData() {
    return {
      tweets_analyzed: 0,
      trending_topics: [],
      mention_sentiment: 0,
      retweet_velocity: 0,
      influence_metrics: { verified_mentions: 0, follower_reach: 0 },
    };
  }

  private getFallbackRedditData() {
    return {
      discussions_analyzed: 0,
      hot_topics: [],
      community_recommendations: [],
      upvote_sentiment: 0.5,
      subreddit_activity: {},
    };
  }

  private getFallbackTikTokData() {
    return {
      videos_analyzed: 0,
      viral_food_trends: [],
      hashtag_performance: {},
      creator_influence: { top_creators: [], trend_adoption_rate: 0 },
    };
  }

  private getFallbackYouTubeData() {
    return {
      videos_analyzed: 0,
      review_sentiment: 0,
      channel_recommendations: [],
      trending_food_content: [],
      subscriber_influence: 0,
    };
  }

  private getFallbackFacebookData() {
    return {
      posts_analyzed: 0,
      page_engagement: 0,
      event_mentions: [],
      community_sentiment: 0,
    };
  }

  private getFallbackSocialIntelligence(): ApifySocialIntelligence {
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
}