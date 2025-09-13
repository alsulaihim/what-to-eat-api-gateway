"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MediaIntelligenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const newsapi_service_1 = require("../../external-apis/news/newsapi.service");
let MediaIntelligenceService = MediaIntelligenceService_1 = class MediaIntelligenceService {
    newsService;
    logger = new common_1.Logger(MediaIntelligenceService_1.name);
    constructor(newsService) {
        this.newsService = newsService;
    }
    async analyzeMediaInfluence(location) {
        try {
            const newsData = await this.newsService.getFoodRelatedNews(location);
            const mediaTrends = this.extractMediaTrends(newsData);
            const trendPrediction = this.analyzeTrendPrediction(mediaTrends, newsData);
            return {
                media_trends: mediaTrends,
                trend_prediction: trendPrediction,
            };
        }
        catch (error) {
            this.logger.error(`Failed to analyze media influence for ${location}:`, error.message);
            throw new Error(`Media intelligence unavailable: ${error.message}`);
        }
    }
    extractMediaTrends(newsData) {
        return {
            viral_food_content: this.identifyViralContent(newsData.articles),
            celebrity_influence: this.identifyCelebrityInfluence(newsData.articles),
            tv_show_impact: this.identifyTVShowImpact(newsData.articles),
            news_coverage: this.categorizeNewsCoverage(newsData.articles),
        };
    }
    identifyViralContent(articles) {
        const viralContent = new Set();
        const viralKeywords = [
            'viral', 'tiktok', 'instagram', 'social media', 'trending',
            'went viral', 'breaking the internet', 'exploding', 'phenomenon',
            'craze', 'challenge', 'hashtag', 'influencer', 'youtube'
        ];
        articles.forEach(article => {
            const text = (article.title + ' ' + (article.description || '')).toLowerCase();
            viralKeywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    const content = this.extractFoodContent(text, keyword);
                    if (content) {
                        viralContent.add(content);
                    }
                }
            });
        });
        return Array.from(viralContent).slice(0, 6);
    }
    identifyCelebrityInfluence(articles) {
        const celebrityInfluence = new Set();
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
    identifyTVShowImpact(articles) {
        const tvShowImpact = new Set();
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
    categorizeNewsCoverage(articles) {
        const coverage = new Set();
        articles.forEach(article => {
            const category = this.categorizeNewsArticle(article);
            if (category) {
                coverage.add(category);
            }
        });
        return Array.from(coverage).slice(0, 8);
    }
    extractFoodContent(text, viralKeyword) {
        const words = text.split(/\s+/);
        const keywordIndex = words.findIndex(word => word.includes(viralKeyword));
        if (keywordIndex === -1)
            return null;
        const searchRange = 5;
        for (let i = Math.max(0, keywordIndex - searchRange); i <= Math.min(words.length - 1, keywordIndex + searchRange); i++) {
            const word = words[i];
            if (this.isFoodRelated(word)) {
                const context = words.slice(Math.max(0, i - 2), Math.min(words.length, i + 3)).join(' ');
                return this.cleanFoodContent(context);
            }
        }
        return null;
    }
    extractCelebrityInfluence(text, title) {
        const cleanTitle = title.substring(0, 80);
        if (this.containsFoodTerms(text)) {
            return cleanTitle;
        }
        return null;
    }
    extractTVShowImpact(text, title) {
        const cleanTitle = title.substring(0, 80);
        if (this.containsFoodTerms(text)) {
            return cleanTitle;
        }
        return null;
    }
    categorizeNewsArticle(article) {
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
    analyzeTrendPrediction(mediaTrends, newsData) {
        return {
            peak_interest_timing: this.predictPeakTiming(mediaTrends),
            geographic_spread: this.analyzeGeographicSpread(newsData),
            sustainability: this.assessTrendSustainability(mediaTrends),
        };
    }
    predictPeakTiming(mediaTrends) {
        const viralCount = mediaTrends.viral_food_content.length;
        const celebrityCount = mediaTrends.celebrity_influence.length;
        const tvShowCount = mediaTrends.tv_show_impact.length;
        const totalBuzz = viralCount + celebrityCount + tvShowCount;
        if (totalBuzz >= 10) {
            return 'peak interest currently active - 1-2 weeks';
        }
        else if (totalBuzz >= 6) {
            return 'building momentum - 2-4 weeks to peak';
        }
        else if (totalBuzz >= 3) {
            return 'early trend phase - 4-8 weeks to peak';
        }
        else {
            return 'minimal trend activity - timing uncertain';
        }
    }
    analyzeGeographicSpread(newsData) {
        const nationalKeywords = ['nationwide', 'across america', 'coast to coast', 'national'];
        const regionalKeywords = ['regional', 'local', 'city', 'state', 'area'];
        const hasNationalMentions = newsData.articles.some((article) => nationalKeywords.some(keyword => (article.title + ' ' + (article.description || '')).toLowerCase().includes(keyword)));
        const hasRegionalMentions = newsData.articles.some((article) => regionalKeywords.some(keyword => (article.title + ' ' + (article.description || '')).toLowerCase().includes(keyword)));
        if (hasNationalMentions) {
            return 'spreading nationwide from major metro areas';
        }
        else if (hasRegionalMentions) {
            return 'concentrated in specific regions/cities';
        }
        else {
            return 'localized trend with limited geographic spread';
        }
    }
    assessTrendSustainability(mediaTrends) {
        let sustainability = 0.5;
        if (mediaTrends.viral_food_content.length > 3) {
            sustainability -= 0.2;
        }
        if (mediaTrends.celebrity_influence.length > 2) {
            sustainability += 0.2;
        }
        if (mediaTrends.tv_show_impact.length > 1) {
            sustainability += 0.3;
        }
        const diversityScore = Object.values(mediaTrends).filter((arr) => arr.length > 0).length;
        sustainability += (diversityScore * 0.1);
        return Math.max(0.1, Math.min(1.0, sustainability));
    }
    isFoodRelated(word) {
        const foodWords = [
            'restaurant', 'food', 'dish', 'meal', 'recipe', 'cuisine', 'chef',
            'cooking', 'dining', 'menu', 'plate', 'bowl', 'sandwich', 'burger',
            'pizza', 'pasta', 'soup', 'salad', 'dessert', 'drink', 'coffee',
            'tea', 'wine', 'beer', 'cocktail', 'bakery', 'cafe', 'bar'
        ];
        return foodWords.some(foodWord => word.includes(foodWord));
    }
    containsFoodTerms(text) {
        const foodTerms = [
            'restaurant', 'food', 'dish', 'cuisine', 'chef', 'cooking',
            'dining', 'menu', 'recipe', 'meal', 'eat', 'taste'
        ];
        return foodTerms.some(term => text.includes(term));
    }
    cleanFoodContent(content) {
        return content
            .replace(/[^\w\s-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 60);
    }
};
exports.MediaIntelligenceService = MediaIntelligenceService;
exports.MediaIntelligenceService = MediaIntelligenceService = MediaIntelligenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [newsapi_service_1.NewsApiService])
], MediaIntelligenceService);
//# sourceMappingURL=media-intelligence.service.js.map