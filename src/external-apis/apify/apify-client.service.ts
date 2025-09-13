import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApifyClient } from 'apify-client';

export interface ApifyRunResult {
  status: 'READY' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'TIMED-OUT' | 'ABORTED';
  id: string;
  defaultDatasetId: string;
  startedAt?: Date;
  finishedAt?: Date;
  stats?: {
    inputBodyLen: number;
    restartCount: number;
    durationMillis?: number;
  };
}

export interface ApifyScrapingConfig {
  rate_limiting: {
    max_concurrent_actors: number;
    delay_between_requests: number;
    respect_robot_txt: boolean;
  };
  error_handling: {
    max_retries: number;
    timeout_per_actor: number;
    fallback_to_cache: boolean;
  };
  data_efficiency: {
    minimal_fields: boolean;
    compress_results: boolean;
    incremental_updates: boolean;
  };
  monitoring: {
    cost_alerts: {
      daily_budget_limit: number;
      usage_threshold: number;
    };
    performance_tracking: {
      success_rate_threshold: number;
      average_response_time_limit: number;
    };
  };
}

@Injectable()
export class ApifyClientService {
  private readonly logger = new Logger(ApifyClientService.name);
  private readonly apifyClient: ApifyClient;
  private readonly dailyBudgetLimit: number;
  private readonly config: ApifyScrapingConfig;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('APIFY_TOKEN') || '';
    this.dailyBudgetLimit = this.configService.get<number>('APIFY_DAILY_BUDGET_LIMIT') || 15;

    if (!token) {
      this.logger.error('APIFY_TOKEN not configured');
    }

    this.apifyClient = new ApifyClient({
      token,
    });

    this.config = {
      rate_limiting: {
        max_concurrent_actors: 3,
        delay_between_requests: 2000,
        respect_robot_txt: true,
      },
      error_handling: {
        max_retries: 2,
        timeout_per_actor: 300000, // 5 minutes
        fallback_to_cache: true,
      },
      data_efficiency: {
        minimal_fields: true,
        compress_results: true,
        incremental_updates: true,
      },
      monitoring: {
        cost_alerts: {
          daily_budget_limit: this.dailyBudgetLimit,
          usage_threshold: 0.8,
        },
        performance_tracking: {
          success_rate_threshold: 0.95,
          average_response_time_limit: 30000,
        },
      },
    };
  }

  async runActor(actorId: string, input: any, options?: {
    timeout?: number;
    memory?: number;
    build?: string;
  }): Promise<ApifyRunResult> {
    try {
      if (!this.configService.get<string>('APIFY_TOKEN')) {
        throw new Error('Apify token not configured');
      }

      this.logger.log(`Starting Apify actor: ${actorId}`);

      const run = await this.apifyClient.actor(actorId).call(input, {
        timeout: options?.timeout || this.config.error_handling.timeout_per_actor,
        memory: options?.memory || 1024, // MB
        build: options?.build || 'latest',
        waitSecs: this.config.error_handling.timeout_per_actor / 1000,
      });

      if (run.status !== 'SUCCEEDED') {
        throw new Error(`Actor run failed with status: ${run.status}`);
      }

      this.logger.log(`Apify actor completed: ${actorId} (${run.status})`);
      return {
        status: run.status,
        id: run.id,
        defaultDatasetId: run.defaultDatasetId,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
        stats: run.stats
      } as ApifyRunResult;
    } catch (error) {
      this.logger.error(`Apify actor failed: ${actorId}`, error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Apify scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDatasetItems(datasetId: string, options?: {
    offset?: number;
    limit?: number;
    fields?: string[];
    clean?: boolean;
  }): Promise<any[]> {
    try {
      const dataset = this.apifyClient.dataset(datasetId);
      const result = await dataset.listItems({
        offset: options?.offset || 0,
        limit: options?.limit || 1000,
        fields: options?.fields,
        clean: options?.clean ?? true,
      });

      return result.items;
    } catch (error) {
      this.logger.error('Failed to fetch dataset items:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Dataset fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getActorRun(runId: string): Promise<ApifyRunResult> {
    try {
      const run = await this.apifyClient.run(runId).get();
      return {
        status: run.status,
        id: run.id,
        defaultDatasetId: run.defaultDatasetId,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
        stats: run.stats
      } as ApifyRunResult;
    } catch (error) {
      this.logger.error('Failed to get actor run:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Run fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async abortActorRun(runId: string): Promise<void> {
    try {
      await this.apifyClient.run(runId).abort();
      this.logger.log(`Actor run aborted: ${runId}`);
    } catch (error) {
      this.logger.error('Failed to abort actor run:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Run abort failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  generateLocationHashtags(location: string, categories: string[]): string[] {
    const baseHashtags = ['#foodie', '#restaurant', '#delicious', '#yummy'];
    const locationHashtags = [
      `#${location.toLowerCase().replace(/\s+/g, '')}food`,
      `#${location.toLowerCase().replace(/\s+/g, '')}eats`,
    ];
    const categoryHashtags = categories.map(cat => `#${cat.toLowerCase()}`);

    return [...baseHashtags, ...locationHashtags, ...categoryHashtags];
  }

  generateFoodKeywords(location: string): string[] {
    const baseKeywords = [
      'restaurant', 'food', 'dining', 'cuisine', 'delicious',
      'yummy', 'tasty', 'meal', 'eat', 'cooking'
    ];

    const locationKeywords = [
      `${location} restaurant`,
      `${location} food`,
      `${location} dining`,
      `${location} eats`,
    ];

    return [...baseKeywords, ...locationKeywords];
  }

  async estimateCost(actorId: string, inputSize: number): Promise<{
    estimated_units: number;
    estimated_cost_usd: number;
    fits_daily_budget: boolean;
  }> {
    // Basic cost estimation based on actor type and input size
    const costMap = {
      'apify/instagram-scraper': 2.5,
      'apify/twitter-scraper': 1.8,
      'apify/reddit-scraper': 1.2,
      'apify/tiktok-scraper': 3.5,
      'apify/youtube-scraper': 4.0,
      'apify/facebook-pages-scraper': 2.0,
    };

    const baseUnits = (costMap as any)[actorId] || 2.0;
    const estimated_units = baseUnits * Math.max(1, inputSize / 100);
    const estimated_cost_usd = estimated_units * 0.025; // Approximate cost per unit
    const fits_daily_budget = estimated_cost_usd <= this.dailyBudgetLimit * 0.2; // 20% of daily budget per scrape

    return {
      estimated_units,
      estimated_cost_usd,
      fits_daily_budget,
    };
  }

  async getUsageMetrics(): Promise<{
    current_usage: number;
    daily_limit: number;
    remaining_budget: number;
    success_rate: number;
    average_response_time: number;
  }> {
    try {
      // This would typically integrate with Apify's usage API
      // For now, return basic metrics structure
      return {
        current_usage: 0,
        daily_limit: this.dailyBudgetLimit,
        remaining_budget: this.dailyBudgetLimit,
        success_rate: 0.95,
        average_response_time: 25000, // 25 seconds
      };
    } catch (error) {
      this.logger.error('Failed to get usage metrics:', error instanceof Error ? error.message : 'Unknown error');
      return {
        current_usage: 0,
        daily_limit: this.dailyBudgetLimit,
        remaining_budget: this.dailyBudgetLimit,
        success_rate: 0,
        average_response_time: 0,
      };
    }
  }

  getConfig(): ApifyScrapingConfig {
    return this.config;
  }
}