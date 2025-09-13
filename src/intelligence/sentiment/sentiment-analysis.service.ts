import { Injectable, Logger } from '@nestjs/common';
import { NewsApiService } from '../../external-apis/news/newsapi.service';
import { SentimentIntelligence, NewsData } from '../../common/types/intelligence.types';

@Injectable()
export class SentimentAnalysisService {
  private readonly logger = new Logger(SentimentAnalysisService.name);

  constructor(private readonly newsService: NewsApiService) {}

  async analyzeFoodSentiment(location: string): Promise<SentimentIntelligence> {
    try {
      const newsData = await this.newsService.getFoodRelatedNews(location);
      return this.processNewsDataForSentiment(newsData);
    } catch (error) {
      this.logger.error(`Failed to analyze sentiment for ${location}:`, error.message);
      throw new Error(`Sentiment intelligence unavailable: ${error.message}`);
    }
  }

  private processNewsDataForSentiment(newsData: NewsData): SentimentIntelligence {
    const cuisineSentiment = this.analyzeCuisineSentiment(newsData);
    const localFoodBuzz = this.analyzeLocalFoodBuzz(newsData);

    return {
      cuisine_sentiment: cuisineSentiment,
      local_food_buzz: localFoodBuzz,
    };
  }

  private analyzeCuisineSentiment(newsData: NewsData): { [cuisine: string]: any } {
    const cuisines = [
      'Italian', 'Chinese', 'Mexican', 'Indian', 'Thai', 'Japanese', 'French',
      'American', 'Mediterranean', 'Korean', 'Vietnamese', 'Greek', 'Spanish',
      'Middle Eastern', 'BBQ', 'Seafood', 'Steakhouse', 'Pizza', 'Sushi',
      'Fast Food', 'Fine Dining', 'Vegetarian', 'Vegan', 'Fusion',
    ];

    const sentimentResults: { [cuisine: string]: any } = {};

    cuisines.forEach(cuisine => {
      const relevantArticles = this.findCuisineRelevantArticles(newsData.articles, cuisine);
      const sentiment = this.calculateCuisineSentiment(relevantArticles, cuisine);

      if (sentiment.mention_volume > 0) { // Only include cuisines with mentions
        sentimentResults[cuisine] = sentiment;
      }
    });

    // Add trending topics analysis
    newsData.trending_topics.forEach(topic => {
      if (this.isFoodRelatedTopic(topic)) {
        const topicSentiment = this.analyzeTopicSentiment(newsData.articles, topic);
        if (topicSentiment.mention_volume > 0) {
          sentimentResults[topic] = topicSentiment;
        }
      }
    });

    return sentimentResults;
  }

  private findCuisineRelevantArticles(articles: any[], cuisine: string): any[] {
    const cuisineKeywords = this.getCuisineKeywords(cuisine);

    return articles.filter(article => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();
      return cuisineKeywords.some(keyword => text.includes(keyword.toLowerCase()));
    });
  }

  private getCuisineKeywords(cuisine: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      'Italian': ['italian', 'pizza', 'pasta', 'gelato', 'risotto', 'lasagna'],
      'Chinese': ['chinese', 'dim sum', 'kung pao', 'chow mein', 'fried rice', 'wonton'],
      'Mexican': ['mexican', 'taco', 'burrito', 'quesadilla', 'guacamole', 'salsa'],
      'Indian': ['indian', 'curry', 'naan', 'tandoori', 'biryani', 'masala'],
      'Thai': ['thai', 'pad thai', 'tom yum', 'green curry', 'som tam'],
      'Japanese': ['japanese', 'ramen', 'yakitori', 'tempura', 'udon', 'miso'],
      'Korean': ['korean', 'kimchi', 'bulgogi', 'bibimbap', 'korean bbq'],
      'Vietnamese': ['vietnamese', 'pho', 'banh mi', 'spring roll'],
      'French': ['french', 'croissant', 'baguette', 'coq au vin', 'escargot'],
      'Mediterranean': ['mediterranean', 'hummus', 'falafel', 'tzatziki', 'olive'],
      'BBQ': ['bbq', 'barbecue', 'ribs', 'brisket', 'pulled pork', 'smoked'],
      'Sushi': ['sushi', 'sashimi', 'roll', 'nigiri', 'wasabi'],
      'Pizza': ['pizza', 'pizzeria', 'margherita', 'pepperoni', 'calzone'],
      'Seafood': ['seafood', 'fish', 'shrimp', 'crab', 'lobster', 'oyster'],
      'Vegetarian': ['vegetarian', 'veggie', 'plant-based', 'meat-free'],
      'Vegan': ['vegan', 'plant-based', 'dairy-free', 'animal-free'],
    };

    return keywordMap[cuisine] || [cuisine.toLowerCase()];
  }

  private calculateCuisineSentiment(articles: any[], cuisine: string): any {
    if (articles.length === 0) {
      return {
        sentiment_score: 0,
        mention_volume: 0,
        trending_keywords: [],
        trend_direction: 'stable' as const,
      };
    }

    // Calculate average sentiment
    const totalSentiment = articles.reduce((sum, article) => sum + article.sentiment_score, 0);
    const averageSentiment = totalSentiment / articles.length;

    // Extract trending keywords
    const trendingKeywords = this.extractTrendingKeywords(articles, cuisine);

    // Determine trend direction based on recent vs older articles
    const trendDirection = this.determineTrendDirection(articles);

    return {
      sentiment_score: Math.round(averageSentiment * 100) / 100, // Round to 2 decimal places
      mention_volume: articles.length,
      trending_keywords: trendingKeywords,
      trend_direction: trendDirection,
    };
  }

  private extractTrendingKeywords(articles: any[], cuisine: string): string[] {
    const keywordCount = new Map<string, number>();
    const cuisineKeywords = this.getCuisineKeywords(cuisine);

    articles.forEach(article => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();
      const words = text.split(/\s+/);

      words.forEach(word => {
        // Clean and filter word
        const cleanWord = word.replace(/[^a-zA-Z]/g, '');
        if (cleanWord.length > 3 &&
            !cuisineKeywords.includes(cleanWord) &&
            this.isRelevantFoodKeyword(cleanWord)) {
          keywordCount.set(cleanWord, (keywordCount.get(cleanWord) || 0) + 1);
        }
      });
    });

    return Array.from(keywordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
  }

  private isRelevantFoodKeyword(word: string): boolean {
    const foodRelatedWords = [
      'trending', 'popular', 'new', 'opening', 'fresh', 'authentic', 'fusion',
      'spicy', 'sweet', 'savory', 'crispy', 'creamy', 'healthy', 'organic',
      'local', 'seasonal', 'award', 'chef', 'recipe', 'flavor', 'taste',
      'restaurant', 'dining', 'menu', 'special', 'signature', 'famous',
    ];

    const irrelevantWords = [
      'said', 'says', 'will', 'have', 'been', 'were', 'their', 'this',
      'that', 'with', 'from', 'they', 'would', 'could', 'should', 'about',
    ];

    return foodRelatedWords.includes(word) ||
           (!irrelevantWords.includes(word) && word.length > 4);
  }

  private determineTrendDirection(articles: any[]): 'rising' | 'falling' | 'stable' {
    if (articles.length < 4) return 'stable';

    // Sort articles by date (most recent first)
    const sortedArticles = articles.sort((a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    const recentArticles = sortedArticles.slice(0, Math.floor(articles.length / 2));
    const olderArticles = sortedArticles.slice(Math.floor(articles.length / 2));

    const recentSentiment = recentArticles.reduce((sum, a) => sum + a.sentiment_score, 0) / recentArticles.length;
    const olderSentiment = olderArticles.reduce((sum, a) => sum + a.sentiment_score, 0) / olderArticles.length;

    const sentimentChange = recentSentiment - olderSentiment;
    const volumeChange = recentArticles.length - olderArticles.length;

    if (sentimentChange > 0.1 || volumeChange > 2) return 'rising';
    if (sentimentChange < -0.1 || volumeChange < -2) return 'falling';
    return 'stable';
  }

  private analyzeLocalFoodBuzz(newsData: NewsData): any {
    const viralDishes = this.identifyViralDishes(newsData.articles);
    const controversyAlerts = this.identifyControversies(newsData.articles);
    const positiveTrends = this.identifyPositiveTrends(newsData.articles);

    return {
      viral_dishes: viralDishes,
      controversy_alerts: controversyAlerts,
      positive_trends: positiveTrends,
    };
  }

  private identifyViralDishes(articles: any[]): string[] {
    const viralIndicators = ['viral', 'trending', 'popular', 'famous', 'must-try', 'instagram'];
    const dishIndicators = ['dish', 'recipe', 'food', 'meal', 'creation', 'special'];

    const viralDishes = new Set<string>();

    articles.forEach(article => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();

      if (viralIndicators.some(indicator => text.includes(indicator))) {
        // Extract potential dish names (words/phrases near viral indicators)
        const words = text.split(/\s+/);

        words.forEach((word, index) => {
          if (viralIndicators.includes(word)) {
            // Look for dish names in surrounding words
            for (let i = Math.max(0, index - 3); i <= Math.min(words.length - 1, index + 3); i++) {
              if (dishIndicators.some(dish => words[i].includes(dish)) ||
                  this.isPotentialDishName(words[i])) {
                viralDishes.add(this.cleanDishName(words[i]));
              }
            }
          }
        });
      }
    });

    return Array.from(viralDishes).slice(0, 5);
  }

  private identifyControversies(articles: any[]): string[] {
    const controversyKeywords = [
      'scandal', 'controversy', 'outbreak', 'recall', 'contaminated', 'poisoning',
      'lawsuit', 'investigation', 'warning', 'banned', 'dangerous', 'unhealthy',
      'closed', 'shutdown', 'violation', 'fine', 'penalty',
    ];

    const controversies = new Set<string>();

    articles.forEach(article => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();

      if (controversyKeywords.some(keyword => text.includes(keyword))) {
        // Extract the main subject of the controversy
        const title = article.title.substring(0, 60); // First 60 chars of title
        controversies.add(title);
      }
    });

    return Array.from(controversies).slice(0, 3);
  }

  private identifyPositiveTrends(articles: any[]): string[] {
    const positiveKeywords = [
      'award', 'winner', 'best', 'top', 'excellent', 'outstanding',
      'new opening', 'expansion', 'success', 'popular', 'thriving',
      'innovative', 'breakthrough', 'revolutionary', 'game-changing',
    ];

    const trends = new Set<string>();

    articles.forEach(article => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();

      if (positiveKeywords.some(keyword => text.includes(keyword)) &&
          article.sentiment_score > 0.2) {
        // Extract the positive trend
        const title = article.title.substring(0, 50);
        trends.add(title);
      }
    });

    return Array.from(trends).slice(0, 5);
  }

  private isPotentialDishName(word: string): boolean {
    const dishTypes = [
      'burger', 'sandwich', 'salad', 'soup', 'pasta', 'noodle', 'rice',
      'chicken', 'beef', 'pork', 'fish', 'shrimp', 'cake', 'pie',
      'taco', 'burrito', 'pizza', 'roll', 'bowl', 'plate',
    ];

    return dishTypes.some(type => word.includes(type));
  }

  private cleanDishName(dishName: string): string {
    return dishName.replace(/[^a-zA-Z\s]/g, '').trim();
  }

  private isFoodRelatedTopic(topic: string): boolean {
    const foodKeywords = [
      'food', 'restaurant', 'dining', 'cuisine', 'chef', 'recipe',
      'cooking', 'culinary', 'menu', 'dish', 'meal', 'eat',
    ];

    return foodKeywords.some(keyword => topic.toLowerCase().includes(keyword));
  }

  private analyzeTopicSentiment(articles: any[], topic: string): any {
    const topicArticles = articles.filter(article =>
      (article.title + ' ' + (article.description || '')).toLowerCase().includes(topic.toLowerCase())
    );

    return this.calculateCuisineSentiment(topicArticles, topic);
  }
}