export declare enum UserAnalyticsMetric {
    ACTIVE_USERS = "active_users",
    NEW_REGISTRATIONS = "new_registrations",
    RECOMMENDATION_REQUESTS = "recommendation_requests",
    USER_RETENTION = "user_retention",
    CONVERSION_RATES = "conversion_rates"
}
export declare enum AnalyticsTimeRange {
    HOUR = "hour",
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
    YEAR = "year"
}
export declare class UserAnalyticsQueryDto {
    metric?: UserAnalyticsMetric;
    startDate?: string;
    endDate?: string;
    timeRange?: AnalyticsTimeRange;
    page?: number;
    limit?: number;
}
