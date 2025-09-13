export declare enum ApiUsageTimeRange {
    HOUR = "hour",
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
    YEAR = "year"
}
export declare class ApiUsageQueryDto {
    apiName?: string;
    startDate?: string;
    endDate?: string;
    timeRange?: ApiUsageTimeRange;
    page?: number;
    limit?: number;
}
