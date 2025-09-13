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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ChatGPTService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGPTService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const database_service_1 = require("../../common/database/database.service");
let ChatGPTService = ChatGPTService_1 = class ChatGPTService {
    configService;
    databaseService;
    logger = new common_1.Logger(ChatGPTService_1.name);
    httpClient;
    apiKey;
    baseUrl = 'https://api.openai.com/v1';
    constructor(configService, databaseService) {
        this.configService = configService;
        this.databaseService = databaseService;
        this.apiKey = this.configService.get('OPENAI_API_KEY') || '';
        if (!this.apiKey) {
            this.logger.error('OpenAI API key not configured');
        }
        this.httpClient = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
        });
        this.httpClient.interceptors.response.use((response) => {
            this.trackApiUsage('chatgpt', 'chat/completions', this.calculateCost(response.data), response.config.metadata?.responseTime || 0, true);
            return response;
        }, (error) => {
            const responseTime = error.config?.metadata?.responseTime || 0;
            this.trackApiUsage('chatgpt', 'chat/completions', 0.002, responseTime, false);
            this.logger.error('OpenAI API error:', error.message);
            return Promise.reject(error);
        });
    }
    async generateRecommendations(context) {
        try {
            const startTime = Date.now();
            const prompt = this.buildRecommendationPrompt(context);
            const response = await this.httpClient.post('/chat/completions', {
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt(),
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                max_tokens: 2000,
                temperature: 0.7,
                response_format: { type: 'json_object' },
            }, {
                metadata: { responseTime: Date.now() - startTime },
            });
            const recommendations = JSON.parse(response.data.choices[0].message.content);
            this.logger.debug(`Generated ${recommendations.recommendations?.length || 0} recommendations`);
            return this.validateAndTransformResponse(recommendations, context.nearbyRestaurants);
        }
        catch (error) {
            this.logger.error('Failed to generate recommendations:', error);
            return this.generateFallbackRecommendations(context);
        }
    }
    async explainRecommendation(recommendation, context) {
        try {
            const startTime = Date.now();
            const prompt = `Explain why ${recommendation.restaurantName} is a great choice for this user:
      
User Context:
- Preferences: ${JSON.stringify(context.userPreferences)}
- Time: ${context.contextualFactors.timeOfDay}
- Mode: ${context.mode}
- Trending: ${context.socialIntelligence.trendingFoods.slice(0, 3).map(t => t.keyword).join(', ')}

Provide a friendly, personalized explanation in 2-3 sentences.`;
            const response = await this.httpClient.post('/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a friendly food recommendation assistant. Explain recommendations in a warm, personal way.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                max_tokens: 200,
                temperature: 0.8,
            }, {
                metadata: { responseTime: Date.now() - startTime },
            });
            return response.data.choices[0].message.content.trim();
        }
        catch (error) {
            this.logger.error('Failed to explain recommendation:', error);
            return `${recommendation.restaurantName} is a great match based on your preferences and current trends!`;
        }
    }
    getSystemPrompt() {
        return `You are an expert food recommendation AI that helps people decide where to eat. You have access to:

1. User preferences (dietary restrictions, cuisine likes, budget, party size)
2. Contextual factors (time, weather, location)
3. Social intelligence (trending foods, local popularity)
4. Nearby restaurant options with ratings and details

Your job is to:
- Analyze all factors holistically
- Provide 3 highly personalized recommendations
- Include confidence scores (0-100) based on match quality
- Explain reasoning transparently
- Consider both logical factors and current trends

Response Format (JSON):
{
  "recommendations": [
    {
      "restaurantId": "place_id",
      "restaurantName": "Name",
      "confidenceScore": 95,
      "reasoning": "Clear explanation of why this is recommended",
      "matchFactors": {
        "personalMatch": 90,
        "socialTrends": 85,
        "contextualFit": 95,
        "accessibility": 88
      },
      "suggestedDishes": ["dish1", "dish2"]
    }
  ],
  "overallReasoning": "Summary of the decision-making approach",
  "additionalTips": ["tip1", "tip2"]
}

Prioritize user preferences but weigh social trends and contextual factors appropriately.`;
    }
    buildRecommendationPrompt(context) {
        return `Please recommend restaurants from the available options below:

USER PREFERENCES:
${context.userPreferences ? JSON.stringify(context.userPreferences, null, 2) : 'No specific preferences provided'}

CONTEXTUAL FACTORS:
- Time: ${context.contextualFactors.timeOfDay}
- Day: ${context.contextualFactors.dayOfWeek}
- Season: ${context.contextualFactors.season}
- Weather: ${context.contextualFactors.weather || 'Unknown'}
- Location: ${context.contextualFactors.location.address || `${context.contextualFactors.location.latitude}, ${context.contextualFactors.location.longitude}`}
- Mode: ${context.mode}

SOCIAL INTELLIGENCE:
Trending Foods: ${context.socialIntelligence.trendingFoods.map(t => `${t.keyword} (${t.interest}% interest, ${t.risingPercentage || 0}% change)`).join(', ')}

Local Trends: ${context.socialIntelligence.localTrends.map(t => `${t.keyword} (${t.interest}% interest)`).join(', ')}

AVAILABLE RESTAURANTS:
${context.nearbyRestaurants.map(r => `- ${r.name} (ID: ${r.place_id})
    Rating: ${r.rating || 'N/A'}/5
    Price Level: ${r.price_level ? '$'.repeat(r.price_level) : 'N/A'}
    Cuisine: ${r.cuisine_type?.join(', ') || 'General'}`).join('\n')}

Provide 3 top recommendations with detailed reasoning, considering the user's preferences, current trends, contextual factors, and restaurant quality. Focus on confidence and personalization.`;
    }
    validateAndTransformResponse(aiResponse, availableRestaurants) {
        try {
            if (!aiResponse.recommendations || !Array.isArray(aiResponse.recommendations)) {
                throw new Error('Invalid AI response format');
            }
            const validRecommendations = aiResponse.recommendations
                .filter((rec) => {
                const restaurant = availableRestaurants.find(r => r.place_id === rec.restaurantId);
                return restaurant && rec.confidenceScore >= 0 && rec.confidenceScore <= 100;
            })
                .slice(0, 3);
            if (validRecommendations.length === 0) {
                throw new Error('No valid recommendations from AI');
            }
            return {
                recommendations: validRecommendations,
                overallReasoning: aiResponse.overallReasoning || 'Recommendations based on your preferences and current trends.',
                additionalTips: aiResponse.additionalTips || [],
            };
        }
        catch (error) {
            this.logger.error('Failed to validate AI response:', error);
            throw error;
        }
    }
    generateFallbackRecommendations(context) {
        const sortedRestaurants = context.nearbyRestaurants
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3);
        const recommendations = sortedRestaurants.map((restaurant, index) => ({
            restaurantId: restaurant.place_id,
            restaurantName: restaurant.name,
            confidenceScore: Math.max(60, 90 - index * 10),
            reasoning: `Highly rated option (${restaurant.rating || 'N/A'}/5) that matches your current ${context.mode} needs.`,
            matchFactors: {
                personalMatch: 70,
                socialTrends: 60,
                contextualFit: 80,
                accessibility: 85,
            },
        }));
        return {
            recommendations,
            overallReasoning: 'Recommendations based on restaurant ratings and accessibility.',
            additionalTips: ['Try checking reviews for more details', 'Consider calling ahead for wait times'],
        };
    }
    calculateCost(response) {
        const inputTokens = response.usage?.prompt_tokens || 1000;
        const outputTokens = response.usage?.completion_tokens || 500;
        return (inputTokens * 0.03 / 1000) + (outputTokens * 0.06 / 1000);
    }
    async trackApiUsage(apiName, endpoint, costEstimate, responseTime, success, userId) {
        try {
            await this.databaseService.apiUsageTracking.create({
                data: {
                    userId,
                    apiName,
                    endpoint,
                    costEstimate,
                    responseTime,
                    success,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to track API usage:', error);
        }
    }
};
exports.ChatGPTService = ChatGPTService;
exports.ChatGPTService = ChatGPTService = ChatGPTService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        database_service_1.DatabaseService])
], ChatGPTService);
//# sourceMappingURL=chatgpt.service.js.map