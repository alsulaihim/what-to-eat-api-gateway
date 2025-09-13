import { Injectable, Logger } from '@nestjs/common';
import { NewsApiService } from '../../external-apis/news/newsapi.service';
import { MediaIntelligence } from '../../common/types/intelligence.types';

@Injectable()
export class MediaIntelligenceService {
  private readonly logger = new Logger(MediaIntelligenceService.name);

  constructor(private readonly newsService: NewsApiService) {}

  async analyzeMediaInfluence(location: string): Promise<MediaIntelligence> {
    try {
      const newsData = await this.newsService.getFoodRelatedNews(location);
      const mediaTrends = this.extractMediaTrends(newsData);
      const trendPrediction = this.analyzeTrendPrediction(mediaTrends, newsData);

      return {
        media_trends: mediaTrends,
        trend_prediction: trendPrediction,
      };
    } catch (error) {
      this.logger.error(`Failed to analyze media influence for ${location}:`, error.message);
      throw new Error(`Media intelligence unavailable: ${error.message}`);
    }
  }

  private extractMediaTrends(newsData: any): any {
    return {
      viral_food_content: this.identifyViralContent(newsData.articles),
      celebrity_influence: this.identifyCelebrityInfluence(newsData.articles),
      tv_show_impact: this.identifyTVShowImpact(newsData.articles),
      news_coverage: this.categorizeNewsCoverage(newsData.articles),
    };
  }

  private identifyViralContent(articles: any[]): string[] {
    const viralContent = new Set<string>();
    const viralKeywords = [
      'viral', 'tiktok', 'instagram', 'social media', 'trending',
      'went viral', 'breaking the internet', 'exploding', 'phenomenon',
      'craze', 'challenge', 'hashtag', 'influencer', 'youtube'
    ];

    articles.forEach(article => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();

      viralKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          // Extract the food/restaurant being discussed
          const content = this.extractFoodContent(text, keyword);
          if (content) {
            viralContent.add(content);
          }
        }
      });
    });

    return Array.from(viralContent).slice(0, 6);
  }

  private identifyCelebrityInfluence(articles: any[]): string[] {
    const celebrityInfluence = new Set<string>();
    const celebrityKeywords = [
      'celebrity chef', 'gordon ramsay', 'bobby flay', 'martha stewart',
      'emeril', 'wolfgang puck', 'jamie oliver', 'rachael ray',
      'anthony bourdain', 'guy fieri', 'ina garten', 'alton brown',
      'celebrity', 'chef', 'cookbook', 'endorsement', 'partnership',
      'restaurant owner', 'famous chef', 'michelin star'
    ];

    articles.forEach(article => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();

      celebrityKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          const influence = this.extractCelebrityInfluence(text, article.title);
          if (influence) {
            celebrityInfluence.add(influence);
          }
        }
      });
    });

    return Array.from(celebrityInfluence).slice(0, 5);
  }

  private identifyTVShowImpact(articles: any[]): string[] {
    const tvShowImpact = new Set<string>();
    const showKeywords = [
      'netflix', 'cooking show', 'food network', 'masterchef',
      'chopped', 'top chef', 'great british bake off', 'iron chef',
      'hell\'s kitchen', 'kitchen nightmares', 'diners drive-ins and dives',
      'chef\'s table', 'ugly delicious', 'salt fat acid heat',
      'the bear', 'emily in paris', 'julie & julia', 'food series'
    ];

    articles.forEach(article => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();

      showKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          const impact = this.extractTVShowImpact(text, article.title);
          if (impact) {
            tvShowImpact.add(impact);
          }
        }
      });
    });

    return Array.from(tvShowImpact).slice(0, 5);
  }

  private categorizeNewsCoverage(articles: any[]): string[] {
    const coverage = new Set<string>();

    articles.forEach(article => {
      const category = this.categorizeNewsArticle(article);
      if (category) {
        coverage.add(category);
      }
    });

    return Array.from(coverage).slice(0, 8);
  }

  private extractFoodContent(text: string, viralKeyword: string): string | null {
    // Look for food-related words near the viral keyword
    const words = text.split(/\s+/);
    const keywordIndex = words.findIndex(word => word.includes(viralKeyword));

    if (keywordIndex === -1) return null;

    // Search around the keyword for food content
    const searchRange = 5;
    for (let i = Math.max(0, keywordIndex - searchRange);
         i <= Math.min(words.length - 1, keywordIndex + searchRange); i++) {

      const word = words[i];
      if (this.isFoodRelated(word)) {
        // Try to get a more complete description
        const context = words.slice(
          Math.max(0, i - 2),
          Math.min(words.length, i + 3)
        ).join(' ');

        return this.cleanFoodContent(context);
      }
    }

    return null;
  }

  private extractCelebrityInfluence(text: string, title: string): string | null {
    // Extract meaningful celebrity food influence from the title/text
    const cleanTitle = title.substring(0, 80); // Limit length

    if (this.containsFoodTerms(text)) {
      return cleanTitle;
    }

    return null;
  }

  private extractTVShowImpact(text: string, title: string): string | null {
    const cleanTitle = title.substring(0, 80);

    if (this.containsFoodTerms(text)) {
      return cleanTitle;
    }

    return null;
  }

  private categorizeNewsArticle(article: any): string | null {
    const text = (article.title + ' ' + (article.description || '')).toLowerCase();

    if (text.includes('opening') || text.includes('new restaurant')) {
      return 'Restaurant Openings';
    }
    if (text.includes('award') || text.includes('winner') || text.includes('michelin')) {
      return 'Awards & Recognition';
    }
    if (text.includes('health') || text.includes('nutrition') || text.includes('diet')) {
      return 'Health & Nutrition';
    }
    if (text.includes('trend') || text.includes('popular') || text.includes('growing')) {
      return 'Food Trends';
    }
    if (text.includes('recall') || text.includes('contamination') || text.includes('outbreak')) {
      return 'Food Safety';
    }
    if (text.includes('delivery') || text.includes('tech') || text.includes('app')) {
      return 'Food Technology';
    }
    if (text.includes('sustainable') || text.includes('organic') || text.includes('farm')) {
      return 'Sustainability';
    }
    if (text.includes('price') || text.includes('cost') || text.includes('inflation')) {
      return 'Food Economics';
    }

    return null;
  }

  private analyzeTrendPrediction(mediaTrends: any, newsData: any): any {
    return {
      peak_interest_timing: this.predictPeakTiming(mediaTrends),
      geographic_spread: this.analyzeGeographicSpread(newsData),
      sustainability: this.assessTrendSustainability(mediaTrends),
    };
  }

  private predictPeakTiming(mediaTrends: any): string {
    const viralCount = mediaTrends.viral_food_content.length;
    const celebrityCount = mediaTrends.celebrity_influence.length;
    const tvShowCount = mediaTrends.tv_show_impact.length;

    const totalBuzz = viralCount + celebrityCount + tvShowCount;

    if (totalBuzz >= 10) {
      return 'peak interest currently active - 1-2 weeks';
    } else if (totalBuzz >= 6) {
      return 'building momentum - 2-4 weeks to peak';
    } else if (totalBuzz >= 3) {
      return 'early trend phase - 4-8 weeks to peak';
    } else {
      return 'minimal trend activity - timing uncertain';
    }
  }

  private analyzeGeographicSpread(newsData: any): string {
    const nationalKeywords = ['nationwide', 'across america', 'coast to coast', 'national'];
    const regionalKeywords = ['regional', 'local', 'city', 'state', 'area'];

    const hasNationalMentions = newsData.articles.some((article: any) =>
      nationalKeywords.some(keyword =>
        (article.title + ' ' + (article.description || '')).toLowerCase().includes(keyword)
      )
    );

    const hasRegionalMentions = newsData.articles.some((article: any) =>
      regionalKeywords.some(keyword =>
        (article.title + ' ' + (article.description || '')).toLowerCase().includes(keyword)
      )
    );

    if (hasNationalMentions) {
      return 'spreading nationwide from major metro areas';
    } else if (hasRegionalMentions) {
      return 'concentrated in specific regions/cities';
    } else {
      return 'localized trend with limited geographic spread';
    }
  }

  private assessTrendSustainability(mediaTrends: any): number {
    let sustainability = 0.5; // Base sustainability

    // Viral content tends to be less sustainable
    if (mediaTrends.viral_food_content.length > 3) {
      sustainability -= 0.2;
    }

    // Celebrity influence can be more sustainable
    if (mediaTrends.celebrity_influence.length > 2) {
      sustainability += 0.2;
    }

    // TV show impact tends to be more sustainable
    if (mediaTrends.tv_show_impact.length > 1) {
      sustainability += 0.3;
    }

    // Diverse media coverage increases sustainability
    const diversityScore = Object.values(mediaTrends).filter((arr: any) => arr.length > 0).length;
    sustainability += (diversityScore * 0.1);

    return Math.max(0.1, Math.min(1.0, sustainability));
  }

  private isFoodRelated(word: string): boolean {
    const foodWords = [
      'restaurant', 'food', 'dish', 'meal', 'recipe', 'cuisine', 'chef',
      'cooking', 'dining', 'menu', 'plate', 'bowl', 'sandwich', 'burger',
      'pizza', 'pasta', 'soup', 'salad', 'dessert', 'drink', 'coffee',
      'tea', 'wine', 'beer', 'cocktail', 'bakery', 'cafe', 'bar'
    ];

    return foodWords.some(foodWord => word.includes(foodWord));
  }

  private containsFoodTerms(text: string): boolean {
    const foodTerms = [
      'restaurant', 'food', 'dish', 'cuisine', 'chef', 'cooking',
      'dining', 'menu', 'recipe', 'meal', 'eat', 'taste'
    ];

    return foodTerms.some(term => text.includes(term));
  }

  private cleanFoodContent(content: string): string {
    // Remove extra whitespace and clean up the content
    return content
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 60); // Limit length
  }
}