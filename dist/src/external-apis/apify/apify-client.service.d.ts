import { ConfigService } from '@nestjs/config';
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
export declare class ApifyClientService {
    private readonly configService;
    private readonly logger;
    private readonly apifyClient;
    private readonly dailyBudgetLimit;
    private readonly config;
    constructor(configService: ConfigService);
    runActor(actorId: string, input: any, options?: {
        timeout?: number;
        memory?: number;
        build?: string;
    }): Promise<ApifyRunResult>;
    getDatasetItems(datasetId: string, options?: {
        offset?: number;
        limit?: number;
        fields?: string[];
        clean?: boolean;
    }): Promise<any[]>;
    getActorRun(runId: string): Promise<ApifyRunResult>;
    abortActorRun(runId: string): Promise<void>;
    generateLocationHashtags(location: string, categories: string[]): string[];
    generateFoodKeywords(location: string): string[];
    estimateCost(actorId: string, inputSize: number): Promise<{
        estimated_units: number;
        estimated_cost_usd: number;
        fits_daily_budget: boolean;
    }>;
    getUsageMetrics(): Promise<{
        current_usage: number;
        daily_limit: number;
        remaining_budget: number;
        success_rate: number;
        average_response_time: number;
    }>;
    getConfig(): ApifyScrapingConfig;
}
