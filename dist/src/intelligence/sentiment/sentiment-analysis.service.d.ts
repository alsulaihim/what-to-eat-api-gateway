import { NewsApiService } from '../../external-apis/news/newsapi.service';
import { SentimentIntelligence } from '../../common/types/intelligence.types';
export declare class SentimentAnalysisService {
    private readonly newsService;
    private readonly logger;
    constructor(newsService: NewsApiService);
    analyzeFoodSentiment(location: string): Promise<SentimentIntelligence>;
    private processNewsDataForSentiment;
    private analyzeCuisineSentiment;
    private findCuisineRelevantArticles;
    private getCuisineKeywords;
    private calculateCuisineSentiment;
    private extractTrendingKeywords;
    private isRelevantFoodKeyword;
    private determineTrendDirection;
    private analyzeLocalFoodBuzz;
    private identifyViralDishes;
    private identifyControversies;
    private identifyPositiveTrends;
    private isPotentialDishName;
    private cleanDishName;
    private isFoodRelatedTopic;
    private analyzeTopicSentiment;
}
