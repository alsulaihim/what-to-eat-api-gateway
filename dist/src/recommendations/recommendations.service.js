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
var RecommendationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const places_service_1 = require("../external-apis/google/places.service");
const maps_service_1 = require("../external-apis/google/maps.service");
const trends_service_1 = require("../external-apis/google/trends.service");
const chatgpt_service_1 = require("../external-apis/openai/chatgpt.service");
const database_service_1 = require("../common/database/database.service");
const recommendation_request_dto_1 = require("./dto/recommendation-request.dto");
let RecommendationsService = RecommendationsService_1 = class RecommendationsService {
    googlePlacesService;
    mapsService;
    trendsService;
    chatGPTService;
    databaseService;
    configService;
    logger = new common_1.Logger(RecommendationsService_1.name);
    algorithmWeights = {
        socialTrends: 0.25,
        personalPreferences: 0.30,
        contextualFactors: 0.20,
        locationRelevance: 0.15,
        ratingQuality: 0.10,
        priceMatch: 0.10,
    };
    constructor(googlePlacesService, mapsService, trendsService, chatGPTService, databaseService, configService) {
        this.googlePlacesService = googlePlacesService;
        this.mapsService = mapsService;
        this.trendsService = trendsService;
        this.chatGPTService = chatGPTService;
        this.databaseService = databaseService;
        this.configService = configService;
    }
    async generateRecommendations(request, userId) {
        const requestId = (0, uuid_1.v4)();
        this.logger.log(`Generating recommendations for user ${userId}, request ${requestId}`);
        try {
            const locationData = await this.resolveLocation(request);
            const userProfile = await this.getUserProfile(userId);
            const contextualData = await this.getContextualFactors(locationData);
            const restaurants = await this.searchRestaurants(request, locationData);
            const socialData = await this.getSocialIntelligence(restaurants, locationData);
            const scoredRecommendations = await this.scoreAndRankRestaurants(restaurants, request, userProfile, contextualData, socialData);
            const aiInsights = await this.generateAIRecommendationInsights(scoredRecommendations, request, contextualData);
            await this.saveRecommendationHistory(userId, requestId, scoredRecommendations, request);
            const response = {
                recommendations: scoredRecommendations.slice(0, 3),
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
        }
        catch (error) {
            this.logger.error(`Failed to generate recommendations for request ${requestId}:`, error);
            throw error;
        }
    }
    async resolveLocation(request) {
        if (request.latitude && request.longitude) {
            return {
                lat: request.latitude,
                lng: request.longitude,
                formattedAddress: request.location || 'User provided coordinates',
            };
        }
        if (request.location) {
            const geocoded = await this.mapsService.geocode({ address: request.location });
            if (geocoded && geocoded.length > 0 && geocoded[0]?.geometry?.location) {
                return {
                    lat: geocoded[0].geometry.location.lat,
                    lng: geocoded[0].geometry.location.lng,
                    formattedAddress: geocoded[0].formatted_address || request.location,
                };
            }
        }
        throw new Error('Location is required - provide either address or coordinates');
    }
    async getUserProfile(userId) {
        try {
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
        }
        catch (error) {
            this.logger.warn(`Could not fetch user profile for ${userId}:`, error.message);
            return { preferences: {}, recommendationHistory: [] };
        }
    }
    async getContextualFactors(locationData) {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        let mealTime = 'lunch';
        if (hour < 11)
            mealTime = 'breakfast';
        else if (hour >= 11 && hour < 16)
            mealTime = 'lunch';
        else if (hour >= 16 && hour < 22)
            mealTime = 'dinner';
        else
            mealTime = 'late-night';
        return {
            currentTime: now,
            hour,
            dayOfWeek,
            mealTime,
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        };
    }
    async searchRestaurants(request, locationData) {
        const searchQuery = this.buildSearchQuery(request);
        const radius = (request.maxDistance || 5) * 1000;
        return this.googlePlacesService.searchRestaurants({
            query: searchQuery,
            location: locationData,
            radius,
            type: 'restaurant',
        });
    }
    buildSearchQuery(request) {
        let query = 'restaurants';
        if (request.cuisinePreferences && request.cuisinePreferences.length > 0) {
            query += ` ${request.cuisinePreferences.join(' OR ')}`;
        }
        if (request.mode === recommendation_request_dto_1.RecommendationMode.DELIVERY) {
            query += ' delivery';
        }
        return query;
    }
    async getSocialIntelligence(restaurants, locationData) {
        const trendingData = await this.trendsService.getTrendingFood({ keywords: ['restaurant', 'food'], location: { latitude: locationData.lat, longitude: locationData.lng, radius: 10 } });
        const popularTimesData = restaurants.map(restaurant => ({
            placeId: restaurant.place_id,
            popularTimes: restaurant.popular_times || null,
            currentPopularity: restaurant.current_popularity || null,
        }));
        return {
            trendingCuisines: trendingData.map(t => t.keyword) || [],
            popularTimes: popularTimesData,
            localEvents: [],
        };
    }
    async scoreAndRankRestaurants(restaurants, request, userProfile, contextualData, socialData) {
        const scoredRestaurants = restaurants.map(restaurant => {
            const scores = {
                socialTrends: this.calculateSocialTrendsScore(restaurant, socialData),
                personalPreferences: this.calculatePersonalPreferencesScore(restaurant, userProfile, request),
                contextualFactors: this.calculateContextualScore(restaurant, contextualData, request),
                locationRelevance: this.calculateLocationScore(restaurant, request),
                ratingQuality: this.calculateRatingScore(restaurant),
                priceMatch: this.calculatePriceScore(restaurant, request.budget || recommendation_request_dto_1.BudgetRange.MEDIUM),
            };
            const confidenceScore = Object.entries(scores).reduce((total, [key, score]) => {
                const weight = this.algorithmWeights[key];
                return total + (score * weight);
            }, 0);
            return this.formatRestaurantRecommendation(restaurant, confidenceScore, scores);
        });
        return scoredRestaurants.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0));
    }
    calculateSocialTrendsScore(restaurant, socialData) {
        let score = 50;
        const cuisineTypes = restaurant.types || [];
        const trendingBoost = socialData.trendingCuisines.some((trending) => cuisineTypes.some((type) => type.toLowerCase().includes(trending.toLowerCase()))) ? 30 : 0;
        const popularityBoost = restaurant.current_popularity
            ? Math.max(0, 100 - restaurant.current_popularity) * 0.2
            : 0;
        return Math.min(100, score + trendingBoost + popularityBoost);
    }
    calculatePersonalPreferencesScore(restaurant, userProfile, request) {
        let score = 50;
        if (request.cuisinePreferences && request.cuisinePreferences.length > 0) {
            const cuisineMatch = request.cuisinePreferences.some(pref => restaurant.types?.some((type) => type.toLowerCase().includes(pref.toLowerCase())));
            if (cuisineMatch)
                score += 25;
        }
        if (userProfile.recommendationHistory) {
            const historicalMatch = userProfile.recommendationHistory.some((hist) => hist.restaurantTypes?.some((type) => restaurant.types?.includes(type)));
            if (historicalMatch)
                score += 15;
        }
        return Math.min(100, score);
    }
    calculateContextualScore(restaurant, contextualData, request) {
        let score = 50;
        if (contextualData.mealTime === 'breakfast' && restaurant.types?.includes('breakfast_restaurant')) {
            score += 30;
        }
        else if (contextualData.mealTime === 'lunch' && restaurant.types?.includes('lunch')) {
            score += 20;
        }
        else if (contextualData.mealTime === 'dinner' && !restaurant.types?.includes('fast_food')) {
            score += 15;
        }
        if (contextualData.isWeekend && restaurant.types?.includes('bar')) {
            score += 10;
        }
        if (request.mode === recommendation_request_dto_1.RecommendationMode.DELIVERY && restaurant.delivery) {
            score += 20;
        }
        else if (request.mode === recommendation_request_dto_1.RecommendationMode.DINE_OUT && restaurant.dine_in) {
            score += 15;
        }
        return Math.min(100, score);
    }
    calculateLocationScore(restaurant, request) {
        const maxDistance = request.maxDistance || 5;
        const distance = restaurant.distance || 0;
        if (distance === 0)
            return 100;
        if (distance >= maxDistance)
            return 0;
        const distanceRatio = distance / maxDistance;
        return Math.round(100 * Math.pow(1 - distanceRatio, 2));
    }
    calculateRatingScore(restaurant) {
        const rating = restaurant.rating || 0;
        const reviewCount = restaurant.user_ratings_total || 0;
        if (rating === 0)
            return 0;
        let score = (rating / 5) * 100;
        if (reviewCount > 100)
            score += 10;
        else if (reviewCount > 50)
            score += 5;
        return Math.min(100, score);
    }
    calculatePriceScore(restaurant, budgetPreference) {
        const priceLevel = restaurant.price_level || 2;
        const budgetMap = {
            [recommendation_request_dto_1.BudgetRange.LOW]: 1,
            [recommendation_request_dto_1.BudgetRange.MEDIUM]: 2,
            [recommendation_request_dto_1.BudgetRange.HIGH]: 3,
            [recommendation_request_dto_1.BudgetRange.PREMIUM]: 4,
        };
        const preferredPriceLevel = budgetMap[budgetPreference];
        const priceDifference = Math.abs(priceLevel - preferredPriceLevel);
        return Math.max(0, 100 - (priceDifference * 25));
    }
    formatRestaurantRecommendation(restaurant, confidenceScore, scores) {
        return {
            id: restaurant.place_id || (0, uuid_1.v4)(),
            name: restaurant.name || 'Unknown Restaurant',
            address: restaurant.vicinity || restaurant.formatted_address || 'Address not available',
            rating: restaurant.rating || 0,
            priceLevel: '$'.repeat(restaurant.price_level || 2),
            priceRange: restaurant.price_range
                ? (typeof restaurant.price_range === 'object'
                    ? `${restaurant.price_range.startPrice?.text || '$'}-${restaurant.price_range.endPrice?.text || '$$$'}`
                    : restaurant.price_range)
                : undefined,
            cuisineTypes: restaurant.types?.filter((type) => !['establishment', 'point_of_interest', 'food'].includes(type)) || [],
            distance: restaurant.distance || 0,
            confidenceScore: Math.round(confidenceScore),
            recommendationReason: this.generateRecommendationReason(scores, restaurant),
            isTrending: scores.socialTrends > 70,
            phoneNumber: restaurant.phone_number,
            website: restaurant.website,
            googleMapsUrl: restaurant.google_maps_url,
            editorialSummary: restaurant.editorial_summary,
            businessStatus: restaurant.business_status,
            primaryType: restaurant.primary_type,
            primaryTypeDisplay: restaurant.primary_type_display,
            shortAddress: restaurant.short_address,
            photoUrls: restaurant.photo_urls,
            isOpenNow: restaurant.is_open_now,
            openingHours: restaurant.opening_hours,
            hoursToday: restaurant.current_hours?.[new Date().getDay()],
            supportsDelivery: restaurant.supports_delivery,
            supportsTakeout: restaurant.supports_takeout,
            supportsDineIn: restaurant.supports_dine_in,
            supportsCurbsidePickup: restaurant.supports_curbside_pickup,
            acceptsReservations: restaurant.accepts_reservations,
            paymentOptions: restaurant.payment_options,
            parkingOptions: restaurant.parking_options,
            accessibilityOptions: restaurant.accessibility_options,
            allowsDogs: restaurant.allows_dogs,
            outdoorSeating: restaurant.outdoor_seating,
            liveMusic: restaurant.live_music,
            kidFriendly: restaurant.kid_friendly,
            servesBeer: restaurant.serves_beer,
            servesWine: restaurant.serves_wine,
            servesCocktails: restaurant.serves_cocktails,
            servesBreakfast: restaurant.serves_breakfast,
            servesLunch: restaurant.serves_lunch,
            servesDinner: restaurant.serves_dinner,
            servesBrunch: restaurant.serves_brunch,
            servesVegetarianFood: restaurant.serves_vegetarian_food,
            servesCoffee: restaurant.serves_coffee,
            servesDessert: restaurant.serves_dessert,
            goodForChildren: restaurant.good_for_children,
            goodForGroups: restaurant.good_for_groups,
            goodForWatchingSports: restaurant.good_for_watching_sports,
            evChargeOptions: restaurant.ev_charge_options,
            recentReviews: restaurant.recent_reviews,
            socialInsights: {
                recentOrderTrends: scores.socialTrends > 70 ? 'Trending up' : 'Stable',
                popularTimes: restaurant.popular_times ? 'Available' : 'Not available',
                crowdLevel: restaurant.current_popularity > 70 ? 'high' :
                    restaurant.current_popularity > 40 ? 'medium' : 'low',
            },
        };
    }
    generateRecommendationReason(scores, restaurant) {
        const reasons = [];
        if (scores.socialTrends > 80)
            reasons.push('Currently trending');
        if (scores.personalPreferences > 80)
            reasons.push('Matches your preferences');
        if (scores.ratingQuality > 90)
            reasons.push('Highly rated');
        if (scores.locationRelevance > 90)
            reasons.push('Very convenient location');
        if (scores.priceMatch > 95)
            reasons.push('Perfect budget match');
        return reasons.length > 0 ? reasons.join(', ') : 'Good overall match';
    }
    async generateAIRecommendationInsights(recommendations, request, contextualData) {
        try {
            const trendingData = await this.trendsService.getTrendingFood({ keywords: ['food', 'restaurant'] });
            const context = {
                userPreferences: {
                    dietaryRestrictions: request.dietaryRestrictions || [],
                    cuisinePreferences: request.cuisinePreferences || [],
                    budgetRange: request.budget || '$$',
                    defaultPartySize: request.partySize || 2,
                },
                contextualFactors: {
                    timeOfDay: contextualData.mealTime,
                    dayOfWeek: contextualData.dayOfWeek.toString(),
                    weather: 'pleasant',
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
                mode: (request.mode || 'delivery'),
            };
            const aiResponse = await this.chatGPTService.generateRecommendations(context);
            return {
                summary: aiResponse.overallReasoning,
                socialTrends: {
                    trendingCuisines: recommendations
                        .filter(r => r.isTrending)
                        .flatMap(r => r.cuisineTypes || [])
                        .slice(0, 3),
                    popularMealTimes: [contextualData.mealTime],
                    localEvents: [],
                },
            };
        }
        catch (error) {
            this.logger.warn('ChatGPT API call failed, using fallback reasoning:', error.message);
            const aiSummary = `Based on your ${request.budget || '$$'} budget preference and ${contextualData.mealTime} timing, we've found ${recommendations.length} great options nearby. ${recommendations.filter(r => r.isTrending).length > 0 ? 'Several trending spots are included in your recommendations.' : ''}`;
            return {
                summary: aiSummary,
                socialTrends: {
                    trendingCuisines: recommendations
                        .filter(r => r.isTrending)
                        .flatMap(r => r.cuisineTypes || [])
                        .slice(0, 3),
                    popularMealTimes: [contextualData.mealTime],
                    localEvents: [],
                },
            };
        }
    }
    calculateOverallConfidence(recommendations) {
        if (recommendations.length === 0)
            return 0;
        const avgConfidence = recommendations
            .slice(0, 3)
            .reduce((sum, rec) => sum + (rec.confidenceScore || 0), 0) / Math.min(3, recommendations.length);
        return Math.round(avgConfidence);
    }
    async saveRecommendationHistory(firebaseUid, requestId, recommendations, request) {
        try {
            const user = await this.databaseService.user.findUnique({
                where: { firebaseUid },
                select: { id: true }
            });
            if (!user) {
                this.logger.warn(`User with Firebase UID ${firebaseUid} not found, cannot save history`);
                return;
            }
            await this.databaseService.recommendationHistory.create({
                data: {
                    id: requestId,
                    userId: user.id,
                    requestData: {
                        location: request.location || '',
                        partySize: request.partySize || 2,
                        budget: request.budget || '$$',
                        mode: request.mode || 'dine_out',
                        cuisinePreferences: request.cuisinePreferences || [],
                        dietaryRestrictions: request.dietaryRestrictions || [],
                        maxDistance: request.maxDistance || 5,
                    },
                    recommendations: recommendations.map(rec => ({
                        id: rec.id,
                        name: rec.name,
                        address: rec.address,
                        rating: rec.rating,
                        priceLevel: rec.priceLevel,
                        cuisineTypes: rec.cuisineTypes,
                        distance: rec.distance,
                        reasons: [rec.recommendationReason || ''],
                    })),
                    confidence: this.calculateOverallConfidence(recommendations),
                },
            });
            this.logger.debug(`Saved recommendation history for user ${firebaseUid} (ID: ${user.id}), request ${requestId}`);
        }
        catch (error) {
            this.logger.error(`Failed to save recommendation history:`, error);
        }
    }
    async generateBatchRecommendations(requests, userId) {
        const promises = requests.map(request => this.generateRecommendations(request, userId));
        return Promise.all(promises);
    }
    async getUserRecommendationHistory(userId, limit, offset) {
        try {
            const historyEntries = await this.databaseService.recommendationHistory.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            });
            const formattedHistory = historyEntries.map(entry => {
                const requestData = entry.requestData;
                return {
                    id: entry.id,
                    timestamp: entry.createdAt.toISOString(),
                    location: requestData?.location || 'Unknown location',
                    criteria: {
                        partySize: requestData?.partySize || 2,
                        budget: requestData?.budget || '$$',
                        mode: requestData?.mode || 'dine_out',
                        cuisinePreferences: requestData?.cuisinePreferences || [],
                        dietaryRestrictions: requestData?.dietaryRestrictions || [],
                    },
                    recommendations: entry.recommendations.map(rec => ({
                        id: rec.id,
                        name: rec.name,
                        address: rec.address,
                        rating: rec.rating,
                        priceLevel: rec.priceLevel,
                        cuisineTypes: rec.cuisineTypes || [],
                        distance: rec.distance,
                        reasons: rec.reasons || [],
                    })),
                    confidence: entry.confidence,
                    reasoning: `Generated ${entry.recommendations.length} recommendations based on your preferences`,
                };
            });
            return formattedHistory;
        }
        catch (error) {
            this.logger.error('Failed to get recommendation history:', error);
            return [];
        }
    }
    async getTrendingRestaurants(location, radius) {
        try {
            const trendingData = await this.trendsService.getTrendingFood({
                keywords: ['pizza', 'sushi', 'burger', 'tacos', 'ramen', 'pasta', 'salad'],
                location: { latitude: 40.7128, longitude: -74.0060, radius },
            });
            const localTrends = await this.trendsService.getLocalFoodTrends({
                latitude: 40.7128,
                longitude: -74.0060,
                radius
            });
            return {
                topCuisines: trendingData.slice(0, 8).map(trend => ({
                    id: (0, uuid_1.v4)(),
                    name: trend.keyword,
                    trendPercentage: trend.interest,
                    direction: trend.risingPercentage && trend.risingPercentage > 0 ? 'up' : 'stable',
                    description: `${trend.keyword} is ${trend.risingPercentage && trend.risingPercentage > 0 ? 'trending up' : 'popular'} with ${trend.interest}% interest`
                })),
                popularRestaurants: [
                    {
                        id: "sample-restaurant-1",
                        name: "The Italian Corner",
                        cuisine: "Italian",
                        rating: 4.5,
                        distance: 0.8,
                        confidenceScore: 92,
                        priceLevel: 2,
                        isOpen: true,
                        address: "456 Broadway, New York, NY 10013",
                        phoneNumber: "+1 (555) 123-4567",
                        imageUrl: null,
                        socialContext: null
                    },
                    {
                        id: "sample-restaurant-2",
                        name: "Sushi Express",
                        cuisine: "Japanese",
                        rating: 4.3,
                        distance: 1.2,
                        confidenceScore: 87,
                        priceLevel: 3,
                        isOpen: true,
                        address: "789 5th Ave, New York, NY 10022",
                        phoneNumber: "+1 (555) 987-6543",
                        imageUrl: null,
                        socialContext: null
                    }
                ],
                localTrends: localTrends.map(trend => ({
                    id: (0, uuid_1.v4)(),
                    title: trend.keyword,
                    description: `Popular in your area`,
                    growth: trend.risingPercentage || 0
                })),
                socialInsights: [
                    {
                        id: (0, uuid_1.v4)(),
                        title: "Peak Hours",
                        description: "Most people dine out between 7-9 PM on weekdays",
                        type: "timing"
                    },
                    {
                        id: (0, uuid_1.v4)(),
                        title: "Popular Choice",
                        description: "Food delivery orders increased by 25% this week",
                        type: "delivery"
                    }
                ],
                lastUpdated: new Date().toISOString()
            };
        }
        catch (error) {
            this.logger.error('Failed to get trending restaurants:', error);
            return {
                topCuisines: [
                    {
                        id: (0, uuid_1.v4)(),
                        name: "Italian",
                        trendPercentage: 85,
                        direction: "up",
                        description: "Italian cuisine is trending up with 85% interest"
                    },
                    {
                        id: (0, uuid_1.v4)(),
                        name: "Mexican",
                        trendPercentage: 72,
                        direction: "up",
                        description: "Mexican cuisine is trending up with 72% interest"
                    },
                    {
                        id: (0, uuid_1.v4)(),
                        name: "Asian",
                        trendPercentage: 68,
                        direction: "stable",
                        description: "Asian cuisine is popular with 68% interest"
                    }
                ],
                popularRestaurants: [
                    {
                        id: "fallback-restaurant-1",
                        name: "Local Favorite",
                        cuisine: "American",
                        rating: 4.2,
                        distance: 0.5,
                        confidenceScore: 85,
                        priceLevel: 2,
                        isOpen: true,
                        address: "123 Main St, New York, NY 10001",
                        phoneNumber: "+1 (555) 000-0000",
                        imageUrl: null,
                        socialContext: null
                    }
                ],
                localTrends: [],
                socialInsights: [],
                lastUpdated: new Date().toISOString()
            };
        }
    }
    async updateAlgorithmWeights(weights) {
        this.algorithmWeights = { ...this.algorithmWeights, ...weights };
        this.logger.log('Algorithm weights updated:', this.algorithmWeights);
        return this.algorithmWeights;
    }
    async getAlgorithmWeights() {
        return this.algorithmWeights;
    }
    async clearUserRecommendationHistory(userId) {
        try {
            await this.databaseService.recommendationHistory.deleteMany({
                where: { userId }
            });
            this.logger.log(`Cleared recommendation history for user: ${userId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to clear recommendation history for user ${userId}:`, error);
            throw error;
        }
    }
    async deleteUserRecommendationEntry(userId, entryId) {
        try {
            await this.databaseService.recommendationHistory.delete({
                where: {
                    id: entryId,
                    userId
                }
            });
            this.logger.log(`Deleted recommendation entry ${entryId} for user: ${userId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to delete recommendation entry ${entryId} for user ${userId}:`, error);
            throw error;
        }
    }
    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4)
            return 'spring';
        if (month >= 5 && month <= 7)
            return 'summer';
        if (month >= 8 && month <= 10)
            return 'fall';
        return 'winter';
    }
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = RecommendationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [places_service_1.GooglePlacesService,
        maps_service_1.MapsService,
        trends_service_1.TrendsService,
        chatgpt_service_1.ChatGPTService,
        database_service_1.DatabaseService,
        config_1.ConfigService])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map