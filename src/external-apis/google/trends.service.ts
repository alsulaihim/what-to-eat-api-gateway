import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { DatabaseService } from '../../common/database/database.service';

export interface TrendsRequest {
  keywords: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // km
  };
  timeRange?: 'now 1-d' | 'now 7-d' | 'today 1-m' | 'today 3-m' | 'today 12-m';
  category?: string; // Food & Drink = 71
}

export interface TrendingFood {
  keyword: string;
  interest: number; // 0-100 scale
  relatedQueries?: string[];
  risingPercentage?: number;
}

@Injectable()
export class TrendsService {
  private readonly logger = new Logger(TrendsService.name);
  private readonly httpClient: AxiosInstance;
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_TRENDS_API_KEY') || '';
    
    if (!this.apiKey) {
      this.logger.warn('Google Trends API key not configured - using mock data');
    }

    this.httpClient = axios.create({
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Food-Recommendation-Engine/1.0',
      },
    });
  }

  async getTrendingFood(request: TrendsRequest): Promise<TrendingFood[]> {
    try {
      const startTime = Date.now();

      // Since Google Trends doesn't have a simple REST API, we'll simulate trending data
      // In a real implementation, you'd use a service like:
      // - Google Trends API (unofficial)
      // - pytrends wrapper
      // - Alternative trend data providers
      
      const trendingFoods = await this.getMockTrendingData(request);
      
      const responseTime = Date.now() - startTime;
      await this.trackApiUsage('google_trends', 'trending-food', 0.001, responseTime, true);
      
      this.logger.debug(`Retrieved ${trendingFoods.length} trending food items`);
      return trendingFoods;
    } catch (error) {
      this.logger.error('Failed to get trending food data:', error);
      await this.trackApiUsage('google_trends', 'trending-food', 0.001, 0, false);
      throw new HttpException(
        'Failed to fetch trending food data',
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async getLocalFoodTrends(
    location: { latitude: number; longitude: number; radius: number }
  ): Promise<TrendingFood[]> {
    try {
      const startTime = Date.now();

      // Mock local trending data - would integrate with real trends API
      const localTrends = await this.getMockLocalTrends(location);
      
      const responseTime = Date.now() - startTime;
      await this.trackApiUsage('google_trends', 'local-trends', 0.002, responseTime, true);
      
      this.logger.debug(`Retrieved ${localTrends.length} local trending items`);
      return localTrends;
    } catch (error) {
      this.logger.error('Failed to get local food trends:', error);
      await this.trackApiUsage('google_trends', 'local-trends', 0.002, 0, false);
      return []; // Return empty array instead of throwing to not break recommendations
    }
  }

  async getKeywordInterest(keywords: string[]): Promise<Map<string, number>> {
    try {
      const startTime = Date.now();
      const interestMap = new Map<string, number>();

      // Mock interest data - in real implementation would query trends API
      for (const keyword of keywords) {
        interestMap.set(keyword, this.calculateMockInterest(keyword));
      }

      const responseTime = Date.now() - startTime;
      await this.trackApiUsage('google_trends', 'keyword-interest', 0.001, responseTime, true);
      
      this.logger.debug(`Retrieved interest data for ${keywords.length} keywords`);
      return interestMap;
    } catch (error) {
      this.logger.error('Failed to get keyword interest:', error);
      await this.trackApiUsage('google_trends', 'keyword-interest', 0.001, 0, false);
      return new Map(); // Return empty map to not break functionality
    }
  }

  private async getMockTrendingData(request: TrendsRequest): Promise<TrendingFood[]> {
    // Simulate trending food data based on current factors
    const currentHour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const season = this.getCurrentSeason();

    const baseTrends: TrendingFood[] = [
      { keyword: 'pizza', interest: 85, risingPercentage: 15 },
      { keyword: 'sushi', interest: 72, risingPercentage: 8 },
      { keyword: 'burger', interest: 78, risingPercentage: 12 },
      { keyword: 'tacos', interest: 68, risingPercentage: 22 },
      { keyword: 'ramen', interest: 65, risingPercentage: 18 },
      { keyword: 'salad', interest: 45, risingPercentage: 5 },
      { keyword: 'sandwich', interest: 55, risingPercentage: -2 },
      { keyword: 'pasta', interest: 62, risingPercentage: 7 },
    ];

    // Adjust trends based on time and context
    return baseTrends.map(trend => ({
      ...trend,
      interest: this.adjustInterestByTime(trend.interest, currentHour, dayOfWeek, season),
    })).sort((a, b) => b.interest - a.interest);
  }

  private async getMockLocalTrends(
    location: { latitude: number; longitude: number; radius: number }
  ): Promise<TrendingFood[]> {
    // Mock local trends based on geographic factors
    const localTrends: TrendingFood[] = [
      { keyword: 'local_specialty', interest: 90, risingPercentage: 25 },
      { keyword: 'food_truck', interest: 65, risingPercentage: 15 },
      { keyword: 'brunch', interest: 58, risingPercentage: 10 },
      { keyword: 'happy_hour', interest: 45, risingPercentage: 8 },
    ];

    return localTrends;
  }

  private calculateMockInterest(keyword: string): number {
    // Simple hash-based mock interest calculation
    let hash = 0;
    for (let i = 0; i < keyword.length; i++) {
      const char = keyword.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Normalize to 0-100 range with some randomness based on current time
    const timeVariation = (Date.now() % 1000) / 10;
    return Math.abs(hash % 70) + 20 + Math.round(timeVariation % 10);
  }

  private adjustInterestByTime(
    baseInterest: number,
    hour: number,
    dayOfWeek: number,
    season: string
  ): number {
    let adjusted = baseInterest;

    // Time of day adjustments
    if (hour >= 11 && hour <= 14) {
      adjusted += 10; // Lunch boost
    } else if (hour >= 17 && hour <= 20) {
      adjusted += 15; // Dinner boost
    }

    // Day of week adjustments
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      adjusted += 8; // Weekend boost
    }

    // Seasonal adjustments
    if (season === 'summer') {
      if (['salad', 'ice_cream', 'bbq'].some(food => baseInterest > 60)) {
        adjusted += 5;
      }
    }

    return Math.min(100, Math.max(0, adjusted));
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private async trackApiUsage(
    apiName: string,
    endpoint: string,
    costEstimate: number,
    responseTime: number,
    success: boolean,
    userId?: string
  ): Promise<void> {
    try {
      await this.databaseService.apiUsageTracking.create({
        data: {
          userId,
          apiName,
          endpoint,
          costEstimate,
          responseTime,
          success,
        },
      });
    } catch (error) {
      this.logger.error('Failed to track API usage:', error);
    }
  }
}