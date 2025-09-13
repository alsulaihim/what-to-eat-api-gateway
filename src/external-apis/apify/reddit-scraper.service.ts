import { Injectable, Logger } from '@nestjs/common';
import { ApifyClientService } from './apify-client.service';

export interface RedditScrapingInput {
  subreddits: string[];
  search_terms: string[];
  post_types: ('posts' | 'comments')[];
  time_filter: '24h' | '7d' | '30d';
}

export interface RedditPost {
  id: string;
  title: string;
  selfText: string;
  url: string;
  subreddit: string;
  author: string;
  score: number;
  upvoteRatio: number;
  numberOfComments: number;
  createdAt: string;
  flair?: string;
  isStickied: boolean;
  isLocked: boolean;
  awards: number;
  comments?: RedditComment[];
  foodRelevant?: boolean;
  locationMentioned?: boolean;
  engagementScore?: number;
  recommendationPost?: boolean;
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  createdAt: string;
  isSubmitter: boolean;
  replies: RedditComment[];
}

export interface RedditIntelligenceData {
  discussions_analyzed: number;
  hot_topics: string[];
  community_recommendations: string[];
  upvote_sentiment: number;
  subreddit_activity: {
    [subreddit: string]: {
      post_count: number;
      engagement_score: number;
    };
  };
  popular_discussions: Array<{
    title: string;
    subreddit: string;
    score: number;
    url: string;
    engagement: number;
  }>;
  community_insights: {
    recommendation_threads: Array<{
      title: string;
      top_recommendation: string;
      consensus_score: number;
    }>;
    debate_topics: string[];
    expert_opinions: Array<{
      author: string;
      opinion: string;
      credibility_score: number;
    }>;
  };
}

@Injectable()
export class RedditScraperService {
  private readonly logger = new Logger(RedditScraperService.name);
  private readonly ACTOR_ID = 'apify/reddit-scraper';

  constructor(private readonly apifyClient: ApifyClientService) {}

  async scrapeRedditFoodDiscussions(location: string, categories: string[] = []): Promise<RedditIntelligenceData> {
    try {
      const subreddits = this.generateRelevantSubreddits(location);
      const searchTerms = this.generateSearchTerms(location, categories);

      const input: RedditScrapingInput = {
        subreddits: subreddits.slice(0, 10), // Limit subreddits to control costs
        search_terms: searchTerms.slice(0, 8),
        post_types: ['posts', 'comments'],
        time_filter: '7d', // Last 7 days for relevant discussions
      };

      // Estimate cost before running
      const totalItems = input.subreddits.length * 50; // Estimated items per subreddit
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
      }) as RedditPost[];

      return this.analyzeRedditData(posts, location);
    } catch (error) {
      this.logger.error(`Reddit scraping failed for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
      return this.getFallbackData();
    }
  }

  private generateRelevantSubreddits(location: string): string[] {
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

  private generateSearchTerms(location: string, categories: string[]): string[] {
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

  private analyzeRedditData(posts: RedditPost[], location: string): RedditIntelligenceData {
    const validPosts = posts.filter(post =>
      post && post.title && (post.foodRelevant || post.locationMentioned)
    );

    // Extract hot topics from titles and content
    const hotTopics = this.extractHotTopics(validPosts);

    // Extract community recommendations
    const communityRecommendations = this.extractRecommendations(validPosts);

    // Calculate upvote sentiment (based on upvote ratio)
    const totalUpvoteRatio = validPosts.reduce((sum, post) => sum + (post.upvoteRatio || 0.5), 0);
    const upvoteSentiment = validPosts.length > 0 ? totalUpvoteRatio / validPosts.length : 0.5;

    // Analyze subreddit activity
    const subredditActivity = this.analyzeSubredditActivity(validPosts);

    // Find popular discussions
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

    // Community insights
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

  private extractHotTopics(posts: RedditPost[]): string[] {
    const topicCounts = new Map<string, number>();
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

  private extractRecommendations(posts: RedditPost[]): string[] {
    const recommendations = new Map<string, number>();

    // Look for recommendation patterns in titles and comments
    const recommendationPosts = posts.filter(post =>
      post.recommendationPost && post.title.toLowerCase().includes('recommend')
    );

    recommendationPosts.forEach(post => {
      const text = post.title + ' ' + (post.selfText || '');

      // Extract restaurant names and food items mentioned positively
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

  private extractMentions(text: string, weight: number): Array<{ item: string; weight: number }> {
    const mentions: Array<{ item: string; weight: number }> = [];

    // Restaurant patterns
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

  private analyzeSubredditActivity(posts: RedditPost[]): { [subreddit: string]: { post_count: number; engagement_score: number } } {
    const activity: { [subreddit: string]: { post_count: number; engagement_score: number } } = {};

    posts.forEach(post => {
      const subreddit = post.subreddit;
      if (!activity[subreddit]) {
        activity[subreddit] = { post_count: 0, engagement_score: 0 };
      }

      activity[subreddit].post_count++;
      activity[subreddit].engagement_score += (post.score || 0) + (post.numberOfComments || 0);
    });

    // Normalize engagement scores
    Object.keys(activity).forEach(subreddit => {
      if (activity[subreddit].post_count > 0) {
        activity[subreddit].engagement_score = Math.round(
          activity[subreddit].engagement_score / activity[subreddit].post_count
        );
      }
    });

    return activity;
  }

  private findRecommendationThreads(posts: RedditPost[]): Array<{
    title: string;
    top_recommendation: string;
    consensus_score: number;
  }> {
    const recommendationThreads = posts.filter(post =>
      post.recommendationPost && post.numberOfComments > 5
    );

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

  private extractTopRecommendationFromComments(post: RedditPost): string {
    // Simplified extraction - would need full comment analysis in production
    const title = post.title.toLowerCase();

    if (title.includes('pizza')) return 'Local pizza recommendations';
    if (title.includes('burger')) return 'Burger joint suggestions';
    if (title.includes('sushi')) return 'Sushi restaurant picks';
    if (title.includes('coffee')) return 'Coffee shop favorites';
    if (title.includes('breakfast')) return 'Breakfast spot recommendations';

    return 'Community food recommendations';
  }

  private identifyDebateTopics(posts: RedditPost[]): string[] {
    // Look for controversial posts or topics with mixed reactions
    const controversialPosts = posts.filter(post => {
      const upvoteRatio = post.upvoteRatio || 0.5;
      return upvoteRatio > 0.4 && upvoteRatio < 0.6 && post.numberOfComments > 10;
    });

    const debateTopics: string[] = [];
    controversialPosts.forEach(post => {
      const title = post.title.toLowerCase();
      if (title.includes('vs') || title.includes('better') || title.includes('overrated') || title.includes('unpopular')) {
        debateTopics.push(post.title.length > 50 ? post.title.substring(0, 47) + '...' : post.title);
      }
    });

    return debateTopics.slice(0, 8);
  }

  private extractExpertOpinions(posts: RedditPost[]): Array<{
    author: string;
    opinion: string;
    credibility_score: number;
  }> {
    // Look for posts from users with high scores and detailed content
    const expertPosts = posts.filter(post =>
      (post.score || 0) > 50 &&
      post.selfText &&
      post.selfText.length > 200 &&
      post.author !== '[deleted]'
    );

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

  private getFallbackData(): RedditIntelligenceData {
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
}