import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { NewsData } from '../../common/types/intelligence.types';
export declare class NewsApiService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    constructor(httpService: HttpService, configService: ConfigService);
    getFoodRelatedNews(location: string): Promise<NewsData>;
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
