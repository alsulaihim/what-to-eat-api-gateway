import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface SimpleNewsData {
    articles: {
        title: string;
        url: string;
        published_at: string;
        sentiment_score: number;
        relevance_score: number;
    }[];
    trending_topics: string[];
    local_sentiment: number;
}
export declare class ExternalNewsSimpleService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    constructor(httpService: HttpService, configService: ConfigService);
    getFoodRelatedNews(location: string): Promise<SimpleNewsData>;
    private searchFoodNews;
    private searchLocalFoodNews;
    private getTrendingTopics;
    private processArticles;
    private isFoodRelated;
    private analyzeSentiment;
    private calculateRelevanceScore;
    private extractTrendingKeywords;
    private isRelevantKeyword;
    private calculateLocalSentiment;
}
