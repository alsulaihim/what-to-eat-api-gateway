export declare class ApifyFoodTrendRequest {
    location: string;
    categories?: string[];
}
export declare class ApifyTwitterMentionsRequest {
    location: string;
    categories?: string[];
}
export declare class ApifyRedditDiscussionsRequest {
    location: string;
    categories?: string[];
}
export declare class ApifyTikTokTrendsRequest {
    location: string;
    categories?: string[];
}
export declare class ApifyYouTubeReviewsRequest {
    location: string;
    categories?: string[];
}
export declare class ApifyFacebookPagesRequest {
    location: string;
    categories?: string[];
}
export declare class ApifyComprehensiveRequest {
    location: string;
    categories?: string[];
    user_preferences?: {
        dietary_restrictions?: string[];
        budget?: string;
        group_size?: number;
        mode?: string;
        preferences?: string[];
    };
}
export declare class ApifyUsageMetricsResponse {
    current_usage: number;
    daily_limit: number;
    remaining_budget: number;
    success_rate: number;
    average_response_time: number;
    platform_costs: {
        instagram: number;
        twitter: number;
        reddit: number;
        tiktok: number;
        youtube: number;
        facebook: number;
    };
    optimization_suggestions: string[];
    estimated_monthly_cost: number;
}
export declare class ApifyJobStatusResponse {
    status: string;
    job_id: string;
    progress: number;
    items_processed: number;
    estimated_time_remaining: number;
    error_message?: string;
}
export declare class ApifyCostEstimationRequest {
    platform: string;
    data_size: number;
}
export declare class ApifyCostEstimationResponse {
    estimated_units: number;
    estimated_cost_usd: number;
    fits_daily_budget: boolean;
    estimated_completion_time: number;
}
export declare class ApifyOptimizationSuggestion {
    type: string;
    description: string;
    potential_savings: number;
    difficulty: string;
}
export declare class ApifyOptimizationResponse {
    suggestions: ApifyOptimizationSuggestion[];
    current_efficiency: number;
    potential_efficiency: number;
    total_potential_savings: number;
}
