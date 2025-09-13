import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { NewsData } from '../../common/types/intelligence.types';

@Injectable()
export class NewsApiService {
  private readonly logger = new Logger(NewsApiService.name);
  private readonly baseUrl = 'https://newsapi.org/v2';
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('NEWS_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.error('NEWS_API_KEY not configured');
    }
  }

  async getFoodRelatedNews(location: string): Promise<NewsData> {
    try {
      if (!this.apiKey) {
        throw new Error('News API key not configured');
      }

      const [generalFoodNews, localNews, trendingTopics] = await Promise.all([
        this.searchFoodNews(),
        this.searchLocalFoodNews(location),
        this.getTrendingTopics(),
      ]);

      const allArticles = [...generalFoodNews, ...localNews];
      const processedArticles = await this.processArticles(allArticles);

      return {
        articles: processedArticles,
        trending_topics: trendingTopics,
        local_sentiment: this.calculateLocalSentiment(localNews),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch food news for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Food news data unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async searchFoodNews(): Promise<any[]> {
    const foodKeywords = [
      'restaurant trends',
      'food industry',
      'culinary trends',
      'dining habits',
      'food delivery',
      'restaurant technology',
      'food safety',
      'celebrity chef',
    ];

    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/everything`, {
        params: {
          q: foodKeywords.join(' OR '),
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 20,
          apiKey: this.apiKey,
        },
        headers: {
          'User-Agent': 'WhatToEat-Intelligence/1.0',
        },
      }),
    );

    return response.data.articles || [];
  }

  private async searchLocalFoodNews(location: string): Promise<any[]> {
    try {
      const locationKeywords = `${location} restaurant OR ${location} dining OR ${location} food`;

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/everything`, {
          params: {
            q: locationKeywords,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 10,
            apiKey: this.apiKey,
          },
          headers: {
            'User-Agent': 'WhatToEat-Intelligence/1.0',
          },
        }),
      );

      return response.data.articles || [];
    } catch (error) {
      this.logger.warn(`Failed to fetch local news for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  private async getTrendingTopics(): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/top-headlines`, {
          params: {
            category: 'general',
            language: 'en',
            pageSize: 20,
            apiKey: this.apiKey,
          },
          headers: {
            'User-Agent': 'WhatToEat-Intelligence/1.0',
          },
        }),
      );

      const articles = response.data.articles || [];
      const foodRelatedArticles = articles.filter((article: any) =>
        this.isFoodRelated(article.title + ' ' + article.description)
      );

      return this.extractTrendingKeywords(foodRelatedArticles);
    } catch (error) {
      this.logger.warn('Failed to fetch trending topics:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  private async processArticles(articles: any[]): Promise<any[]> {
    return articles
      .filter(article => article && article.title && article.publishedAt)
      .slice(0, 30) // Limit to prevent excessive processing
      .map(article => ({
        title: article.title,
        url: article.url,
        published_at: article.publishedAt,
        sentiment_score: this.analyzeSentiment(article.title + ' ' + (article.description || '')),
        relevance_score: this.calculateRelevanceScore(article),
      }))
      .sort((a, b) => b.relevance_score - a.relevance_score);
  }

  private isFoodRelated(text: string): boolean {
    const foodKeywords = [
      'restaurant', 'food', 'dining', 'cuisine', 'chef', 'recipe', 'cooking',
      'meal', 'eat', 'taste', 'flavor', 'delivery', 'takeout', 'menu',
      'kitchen', 'culinary', 'gastronomy', 'dish', 'beverage', 'drink',
    ];

    const lowerText = text.toLowerCase();
    return foodKeywords.some(keyword => lowerText.includes(keyword));
  }

  private analyzeSentiment(text: string): number {
    if (!text) return 0;

    const positiveWords = [
      'amazing', 'excellent', 'delicious', 'fantastic', 'wonderful', 'great',
      'best', 'perfect', 'love', 'incredible', 'outstanding', 'superb',
      'brilliant', 'awesome', 'exceptional', 'remarkable',
    ];

    const negativeWords = [
      'terrible', 'awful', 'bad', 'horrible', 'disgusting', 'worst',
      'hate', 'disappointing', 'poor', 'failed', 'closed', 'bankruptcy',
      'contaminated', 'poisoning', 'outbreak', 'recall',
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

  private calculateRelevanceScore(article: any): number {
    let score = 0.5; // Base score

    // Recency boost
    const publishedDate = new Date(article.publishedAt);
    const hoursSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);

    if (hoursSincePublished < 24) score += 0.3;
    else if (hoursSincePublished < 72) score += 0.2;
    else if (hoursSincePublished < 168) score += 0.1;

    // Content quality indicators
    if (article.title && article.title.length > 20) score += 0.1;
    if (article.description && article.description.length > 50) score += 0.1;
    if (article.urlToImage) score += 0.05;

    // Food relevance boost
    const combinedText = (article.title + ' ' + (article.description || '')).toLowerCase();
    const foodRelevanceWords = ['restaurant', 'food', 'dining', 'chef', 'cuisine'];
    foodRelevanceWords.forEach(word => {
      if (combinedText.includes(word)) score += 0.05;
    });

    return Math.min(1, score);
  }

  private extractTrendingKeywords(articles: any[]): string[] {
    const keywords = new Map<string, number>();

    articles.forEach(article => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();
      const words = text.split(/\s+/).filter(word => word.length > 4);

      words.forEach(word => {
        if (this.isRelevantKeyword(word)) {
          keywords.set(word, (keywords.get(word) || 0) + 1);
        }
      });
    });

    return Array.from(keywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
  }

  private isRelevantKeyword(word: string): boolean {
    const irrelevantWords = new Set([
      'said', 'says', 'will', 'also', 'been', 'have', 'this', 'that',
      'with', 'from', 'they', 'were', 'their', 'would', 'there',
      'could', 'should', 'which', 'about', 'after', 'first',
    ]);

    return !irrelevantWords.has(word) && word.length > 4 && !/^\d+$/.test(word);
  }

  private calculateLocalSentiment(localArticles: any[]): number {
    if (localArticles.length === 0) return 0;

    const totalSentiment = localArticles.reduce((sum, article) => {
      return sum + this.analyzeSentiment(article.title + ' ' + (article.description || ''));
    }, 0);

    return totalSentiment / localArticles.length;
  }
}