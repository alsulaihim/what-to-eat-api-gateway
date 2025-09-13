import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { GooglePlacesService } from '../external-apis/google/places.service';
import { MapsService } from '../external-apis/google/maps.service';
import { TrendsService } from '../external-apis/google/trends.service';
import { ChatGPTService } from '../external-apis/openai/chatgpt.service';
import { DatabaseService } from '../common/database/database.service';
import { RecommendationRequestDto, RecommendationMode, BudgetRange } from './dto/recommendation-request.dto';
import { RecommendationResponseDto, RestaurantRecommendationDto } from './dto/recommendation-response.dto';

interface AlgorithmWeights {
  socialTrends: number;
  personalPreferences: number;
  contextualFactors: number;
  locationRelevance: number;
  ratingQuality: number;
  priceMatch: number;
}

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  
  // Configurable algorithm weights (can be adjusted via admin dashboard)
  private algorithmWeights: AlgorithmWeights = {
    socialTrends: 0.25,        // 25% - What's trending/popular
    personalPreferences: 0.30,  // 30% - User's past preferences
    contextualFactors: 0.20,   // 20% - Time, weather, events
    locationRelevance: 0.15,   // 15% - Distance and convenience
    ratingQuality: 0.10,       // 10% - Rating and review quality
    priceMatch: 0.10,          // 10% - Budget alignment (can boost if exact match)
  };

  constructor(
    private readonly googlePlacesService: GooglePlacesService,
    private readonly mapsService: MapsService,
    private readonly trendsService: TrendsService,
    private readonly chatGPTService: ChatGPTService,
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async generateRecommendations(
    request: RecommendationRequestDto,
    userId: string,
  ): Promise<RecommendationResponseDto> {
    const requestId = uuidv4();
    this.logger.log(`Generating recommendations for user ${userId}, request ${requestId}`);

    try {
      // Step 1: Resolve location to coordinates
      const locationData = await this.resolveLocation(request);
      
      // Step 2: Get user preferences and history
      const userProfile = await this.getUserProfile(userId);
      
      // Step 3: Get contextual factors (time, weather, trends)
      const contextualData = await this.getContextualFactors(locationData);
      
      // Step 4: Search for restaurants
      const restaurants = await this.searchRestaurants(request, locationData);
      
      // Step 5: Get social intelligence data
      const socialData = await this.getSocialIntelligence(restaurants, locationData);
      
      // Step 6: Apply recommendation algorithm
      const scoredRecommendations = await this.scoreAndRankRestaurants(
        restaurants,
        request,
        userProfile,
        contextualData,
        socialData,
      );
      
      // Step 7: Generate AI reasoning with ChatGPT
      const aiInsights = await this.generateAIRecommendationInsights(
        scoredRecommendations,
        request,
        contextualData,
      );
      
      // Step 8: Save recommendation to history
      await this.saveRecommendationHistory(userId, requestId, scoredRecommendations, request);
      
      // Step 9: Format response
      const response: RecommendationResponseDto = {
        recommendations: scoredRecommendations.slice(0, 3), // Top 3 recommendations
        totalResults: scoredRecommendations.length,
        searchLocation: locationData.formattedAddress,
        searchRadius: request.maxDistance || 5,
        overallConfidence: this.calculateOverallConfidence(scoredRecommendations),
        aiSummary: aiInsights.summary,
        socialTrends: aiInsights.socialTrends,
        timestamp: new Date(),
        requestId,
      };

      this.logger.log(`Successfully generated ${response.recommendations?.length || 0} recommendations for request ${requestId}`);
      return response;

    } catch (error) {
      this.logger.error(`Failed to generate recommendations for request ${requestId}:`, error);
      throw error;
    }
  }

  private async resolveLocation(request: RecommendationRequestDto): Promise<any> {
    if (request.latitude && request.longitude) {
      return {
        lat: request.latitude,
        lng: request.longitude,
        formattedAddress: 'Geocoded address placeholder',
      };
    }
    
    if (request.location) {
      const geocoded = await this.mapsService.geocode({ address: request.location });
      return geocoded[0];
    }
    
    throw new Error('Location is required - provide either address or coordinates');
  }

  private async getUserProfile(userId: string): Promise<any> {
    try {
      // Get user preferences from database
      const userPreferences = await this.databaseService.user.findUnique({
        where: { firebaseUid: userId },
        include: {
          recommendations: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      return userPreferences || { preferences: {}, recommendationHistory: [] };
    } catch (error) {
      this.logger.warn(`Could not fetch user profile for ${userId}:`, (error as Error).message);
      return { preferences: {}, recommendationHistory: [] };
    }
  }

  private async getContextualFactors(locationData: any): Promise<any> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Determine meal time
    let mealTime = 'lunch';
    if (hour < 11) mealTime = 'breakfast';
    else if (hour >= 11 && hour < 16) mealTime = 'lunch';
    else if (hour >= 16 && hour < 22) mealTime = 'dinner';
    else mealTime = 'late-night';

    return {
      currentTime: now,
      hour,
      dayOfWeek,
      mealTime,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      // TODO: Add weather data, local events, traffic conditions
    };
  }

  private async searchRestaurants(request: RecommendationRequestDto, locationData: any): Promise<any[]> {
    const searchQuery = this.buildSearchQuery(request);
    const radius = (request.maxDistance || 5) * 1609.34; // Convert miles to meters
    
    return this.googlePlacesService.searchRestaurants({
      query: searchQuery,
      location: locationData,
      radius,
      type: 'restaurant',
    });
  }

  private buildSearchQuery(request: RecommendationRequestDto): string {
    let query = 'restaurants';
    
    if (request.cuisinePreferences && request.cuisinePreferences.length > 0) {
      query += ` ${request.cuisinePreferences.join(' OR ')}`;
    }
    
    if (request.mode === RecommendationMode.DELIVERY) {
      query += ' delivery';
    }
    
    return query;
  }

  private async getSocialIntelligence(restaurants: any[], locationData: any): Promise<any> {
    // Get trending data from Google Trends (or alternative social intelligence)
    const trendingData = await this.trendsService.getTrendingFood({ keywords: ['restaurant', 'food'], location: { latitude: locationData.lat, longitude: locationData.lng, radius: 10 } });
    
    // Analyze popular times and current crowd levels
    const popularTimesData = restaurants.map(restaurant => ({
      placeId: restaurant.place_id,
      popularTimes: restaurant.popular_times || null,
      currentPopularity: restaurant.current_popularity || null,
    }));

    return {
      trendingCuisines: trendingData.map(t => t.keyword) || [],
      popularTimes: popularTimesData,
      localEvents: [], // TODO: Integrate event data
    };
  }

  private async scoreAndRankRestaurants(
    restaurants: any[],
    request: RecommendationRequestDto,
    userProfile: any,
    contextualData: any,
    socialData: any,
  ): Promise<RestaurantRecommendationDto[]> {
    
    const scoredRestaurants = restaurants.map(restaurant => {
      const scores = {
        socialTrends: this.calculateSocialTrendsScore(restaurant, socialData),
        personalPreferences: this.calculatePersonalPreferencesScore(restaurant, userProfile, request),
        contextualFactors: this.calculateContextualScore(restaurant, contextualData, request),
        locationRelevance: this.calculateLocationScore(restaurant, request),
        ratingQuality: this.calculateRatingScore(restaurant),
        priceMatch: this.calculatePriceScore(restaurant, request.budget || BudgetRange.MEDIUM),
      };

      const confidenceScore = Object.entries(scores).reduce((total, [key, score]) => {
        const weight = this.algorithmWeights[key as keyof AlgorithmWeights];
        return total + (score * weight);
      }, 0);

      return this.formatRestaurantRecommendation(restaurant, confidenceScore, scores);
    });

    // Sort by confidence score (highest first)
    return scoredRestaurants.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0));
  }

  private calculateSocialTrendsScore(restaurant: any, socialData: any): number {
    let score = 50; // Base score
    
    // Boost if cuisine is trending
    const cuisineTypes = restaurant.types || [];
    const trendingBoost = socialData.trendingCuisines.some((trending: string) =>
      cuisineTypes.some((type: string) => type.toLowerCase().includes(trending.toLowerCase()))
    ) ? 30 : 0;
    
    // Boost if currently popular (less crowded is better for some contexts)
    const popularityBoost = restaurant.current_popularity 
      ? Math.max(0, 100 - restaurant.current_popularity) * 0.2
      : 0;

    return Math.min(100, score + trendingBoost + popularityBoost);
  }

  private calculatePersonalPreferencesScore(restaurant: any, userProfile: any, request: RecommendationRequestDto): number {
    let score = 50; // Base score

    // Match cuisine preferences
    if (request.cuisinePreferences && request.cuisinePreferences.length > 0) {
      const cuisineMatch = request.cuisinePreferences.some(pref =>
        restaurant.types?.some((type: string) => type.toLowerCase().includes(pref.toLowerCase()))
      );
      if (cuisineMatch) score += 25;
    }

    // Match dietary restrictions (would need restaurant menu data)
    // TODO: Integrate menu/dietary restriction checking

    // Historical preference matching
    if (userProfile.recommendationHistory) {
      const historicalMatch = userProfile.recommendationHistory.some((hist: any) =>
        hist.restaurantTypes?.some((type: string) =>
          restaurant.types?.includes(type)
        )
      );
      if (historicalMatch) score += 15;
    }

    return Math.min(100, score);
  }

  private calculateContextualScore(restaurant: any, contextualData: any, request: RecommendationRequestDto): number {
    let score = 50; // Base score

    // Time-based scoring
    if (contextualData.mealTime === 'breakfast' && restaurant.types?.includes('breakfast_restaurant')) {
      score += 30;
    } else if (contextualData.mealTime === 'lunch' && restaurant.types?.includes('lunch')) {
      score += 20;
    } else if (contextualData.mealTime === 'dinner' && !restaurant.types?.includes('fast_food')) {
      score += 15;
    }

    // Weekend vs weekday preferences
    if (contextualData.isWeekend && restaurant.types?.includes('bar')) {
      score += 10;
    }

    // Delivery vs dine-out optimization
    if (request.mode === RecommendationMode.DELIVERY && restaurant.delivery) {
      score += 20;
    } else if (request.mode === RecommendationMode.DINE_OUT && restaurant.dine_in) {
      score += 15;
    }

    return Math.min(100, score);
  }

  private calculateLocationScore(restaurant: any, request: RecommendationRequestDto): number {
    // Distance scoring (closer is better, but not linear)
    const maxDistance = request.maxDistance || 5;
    const distance = restaurant.distance || 0;
    
    if (distance === 0) return 100;
    if (distance >= maxDistance) return 0;
    
    // Non-linear scoring - closer locations get disproportionately higher scores
    const distanceRatio = distance / maxDistance;
    return Math.round(100 * Math.pow(1 - distanceRatio, 2));
  }

  private calculateRatingScore(restaurant: any): number {
    const rating = restaurant.rating || 0;
    const reviewCount = restaurant.user_ratings_total || 0;
    
    if (rating === 0) return 0;
    
    // Base score from rating (0-5 scale to 0-100)
    let score = (rating / 5) * 100;
    
    // Boost for high review count (indicates reliability)
    if (reviewCount > 100) score += 10;
    else if (reviewCount > 50) score += 5;
    
    return Math.min(100, score);
  }

  private calculatePriceScore(restaurant: any, budgetPreference: BudgetRange): number {
    const priceLevel = restaurant.price_level || 2; // Default to medium
    const budgetMap = {
      [BudgetRange.LOW]: 1,
      [BudgetRange.MEDIUM]: 2,
      [BudgetRange.HIGH]: 3,
      [BudgetRange.PREMIUM]: 4,
    };
    
    const preferredPriceLevel = budgetMap[budgetPreference];
    const priceDifference = Math.abs(priceLevel - preferredPriceLevel);
    
    // Perfect match gets 100, each level away reduces score
    return Math.max(0, 100 - (priceDifference * 25));
  }

  private formatRestaurantRecommendation(
    restaurant: any, 
    confidenceScore: number, 
    scores: any
  ): RestaurantRecommendationDto {
    return {
      id: restaurant.place_id || uuidv4(),
      name: restaurant.name || 'Unknown Restaurant',
      address: restaurant.vicinity || restaurant.formatted_address || 'Address not available',
      rating: restaurant.rating || 0,
      priceLevel: '$'.repeat(restaurant.price_level || 2),
      cuisineTypes: restaurant.types?.filter((type: string) => 
        !['establishment', 'point_of_interest', 'food'].includes(type)
      ) || [],
      distance: restaurant.distance || 0,
      confidenceScore: Math.round(confidenceScore),
      recommendationReason: this.generateRecommendationReason(scores, restaurant),
      isTrending: scores.socialTrends > 70,
      estimatedWaitTime: restaurant.current_popularity ? 
        Math.round(restaurant.current_popularity / 10) : undefined,
      phoneNumber: restaurant.formatted_phone_number,
      website: restaurant.website,
      hoursToday: restaurant.opening_hours?.weekday_text?.[new Date().getDay()],
      socialInsights: {
        recentOrderTrends: scores.socialTrends > 70 ? 'Trending up' : 'Stable',
        popularTimes: restaurant.popular_times ? 'Available' : 'Not available',
        crowdLevel: restaurant.current_popularity > 70 ? 'high' : 
                   restaurant.current_popularity > 40 ? 'medium' : 'low',
      },
    };
  }

  private generateRecommendationReason(scores: any, restaurant: any): string {
    const reasons = [];
    
    if (scores.socialTrends > 80) reasons.push('Currently trending');
    if (scores.personalPreferences > 80) reasons.push('Matches your preferences');
    if (scores.ratingQuality > 90) reasons.push('Highly rated');
    if (scores.locationRelevance > 90) reasons.push('Very convenient location');
    if (scores.priceMatch > 95) reasons.push('Perfect budget match');
    
    return reasons.length > 0 ? reasons.join(', ') : 'Good overall match';
  }

  private async generateAIRecommendationInsights(
    recommendations: RestaurantRecommendationDto[],
    request: RecommendationRequestDto,
    contextualData: any,
  ): Promise<any> {
    try {
      // Get trending data for social intelligence
      const trendingData = await this.trendsService.getTrendingFood({ keywords: ['food', 'restaurant'] });
      
      // Build context for ChatGPT API
      const context = {
        userPreferences: {
          dietaryRestrictions: request.dietaryRestrictions || [],
          cuisinePreferences: request.cuisinePreferences || [],
          budgetRange: request.budget || 'medium',
          defaultPartySize: request.partySize || 2,
        },
        contextualFactors: {
          timeOfDay: contextualData.mealTime,
          dayOfWeek: contextualData.dayOfWeek.toString(),
          weather: 'pleasant', // TODO: Add weather API integration
          season: this.getCurrentSeason(),
          location: {
            latitude: contextualData.location?.lat || 0,
            longitude: contextualData.location?.lng || 0,
            address: contextualData.formattedAddress || '',
          },
        },
        socialIntelligence: {
          trendingFoods: trendingData.map(trend => ({
            keyword: trend.keyword,
            interest: trend.interest,
            risingPercentage: trend.risingPercentage,
          })),
          localTrends: trendingData.slice(0, 5).map(trend => ({
            keyword: trend.keyword,
            interest: trend.interest,
          })),
        },
        nearbyRestaurants: recommendations.slice(0, 3).map(rec => ({
          place_id: rec.id || '',
          name: rec.name || '',
          rating: rec.rating || 0,
          price_level: rec.priceLevel ? parseInt(rec.priceLevel.replace('$', '')) : 0,
          cuisine_type: rec.cuisineTypes || [],
        })),
        mode: (request.mode || 'delivery') as 'delivery' | 'dine-out' | 'pickup',
      };

      // Call ChatGPT service for AI-powered insights
      const aiResponse = await this.chatGPTService.generateRecommendations(context);
      
      return {
        summary: aiResponse.overallReasoning,
        socialTrends: {
          trendingCuisines: recommendations
            .filter(r => r.isTrending)
            .flatMap(r => r.cuisineTypes || [])
            .slice(0, 3),
          popularMealTimes: [contextualData.mealTime],
          localEvents: [], // TODO: Add event integration
        },
      };
    } catch (error) {
      this.logger.warn('ChatGPT API call failed, using fallback reasoning:', (error as Error).message);
      
      // Fallback to rule-based reasoning
      const aiSummary = `Based on your ${request.budget || 'medium'} budget preference and ${contextualData.mealTime} timing, we've found ${recommendations.length} great options nearby. ${recommendations.filter(r => r.isTrending).length > 0 ? 'Several trending spots are included in your recommendations.' : ''}`;
      
      return {
        summary: aiSummary,
        socialTrends: {
          trendingCuisines: recommendations
            .filter(r => r.isTrending)
            .flatMap(r => r.cuisineTypes || [])
            .slice(0, 3),
          popularMealTimes: [contextualData.mealTime],
          localEvents: [], // TODO: Add event integration
        },
      };
    }
  }

  private calculateOverallConfidence(recommendations: RestaurantRecommendationDto[]): number {
    if (recommendations.length === 0) return 0;
    
    const avgConfidence = recommendations
      .slice(0, 3)
      .reduce((sum, rec) => sum + (rec.confidenceScore || 0), 0) / Math.min(3, recommendations.length);
    
    return Math.round(avgConfidence);
  }

  private async saveRecommendationHistory(
    userId: string,
    requestId: string,
    recommendations: RestaurantRecommendationDto[],
    request: RecommendationRequestDto,
  ): Promise<void> {
    try {
      // TODO: Save to database
      this.logger.debug(`Saved recommendation history for user ${userId}, request ${requestId}`);
    } catch (error) {
      this.logger.error(`Failed to save recommendation history:`, error);
      // Don't throw - this shouldn't fail the recommendation request
    }
  }

  async generateBatchRecommendations(
    requests: RecommendationRequestDto[],
    userId: string,
  ): Promise<RecommendationResponseDto[]> {
    const promises = requests.map(request => 
      this.generateRecommendations(request, userId)
    );
    
    return Promise.all(promises);
  }

  async getUserRecommendationHistory(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<RecommendationResponseDto[]> {
    // TODO: Implement database query for recommendation history
    return [];
  }

  async getTrendingRestaurants(location: string, radius: number): Promise<any> {
    // TODO: Implement trending restaurants based on social intelligence
    return {
      trending: [],
      location,
      radius,
      timestamp: new Date(),
    };
  }

  // Admin function to update algorithm weights
  async updateAlgorithmWeights(weights: Partial<AlgorithmWeights>): Promise<AlgorithmWeights> {
    this.algorithmWeights = { ...this.algorithmWeights, ...weights };
    this.logger.log('Algorithm weights updated:', this.algorithmWeights);
    return this.algorithmWeights;
  }

  async getAlgorithmWeights(): Promise<AlgorithmWeights> {
    return this.algorithmWeights;
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }
}