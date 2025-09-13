import { NewsApiService } from '../../external-apis/news/newsapi.service';
import { MediaIntelligence } from '../../common/types/intelligence.types';
export declare class MediaIntelligenceService {
    private readonly newsService;
    private readonly logger;
    constructor(newsService: NewsApiService);
    analyzeMediaInfluence(location: string): Promise<MediaIntelligence>;
    private extractMediaTrends;
    private identifyViralContent;
    private identifyCelebrityInfluence;
    private identifyTVShowImpact;
    private categorizeNewsCoverage;
    private extractFoodContent;
    private extractCelebrityInfluence;
    private extractTVShowImpact;
    private categorizeNewsArticle;
    private analyzeTrendPrediction;
    private predictPeakTiming;
    private analyzeGeographicSpread;
    private assessTrendSustainability;
    private isFoodRelated;
    private containsFoodTerms;
    private cleanFoodContent;
}
