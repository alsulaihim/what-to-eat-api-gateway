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
var GooglePlacesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GooglePlacesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const database_service_1 = require("../../common/database/database.service");
let GooglePlacesService = GooglePlacesService_1 = class GooglePlacesService {
    configService;
    databaseService;
    logger = new common_1.Logger(GooglePlacesService_1.name);
    httpClient;
    apiKey;
    baseUrl = 'https://places.googleapis.com/v1/places';
    constructor(configService, databaseService) {
        this.configService = configService;
        this.databaseService = databaseService;
        this.apiKey = this.configService.get('GOOGLE_PLACES_API_KEY') || '';
        if (!this.apiKey) {
            this.logger.error('Google Places API key not configured');
        }
        this.httpClient = axios_1.default.create({
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': this.apiKey,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.priceRange,places.location,places.types,places.photos,places.currentOpeningHours,places.regularOpeningHours,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.reviews,places.editorialSummary,places.takeout,places.delivery,places.dineIn,places.curbsidePickup,places.reservable,places.paymentOptions,places.parkingOptions,places.accessibilityOptions,places.allowsDogs,places.outdoorSeating,places.liveMusic,places.menuForChildren,places.servesBeer,places.servesWine,places.servesCocktails,places.servesCoffee,places.servesDessert,places.goodForChildren,places.goodForGroups,places.goodForWatchingSports,places.restroom,places.primaryType,places.primaryTypeDisplayName,places.shortFormattedAddress,places.adrFormatAddress,places.businessStatus,places.currentSecondaryOpeningHours,places.servesBreakfast,places.servesLunch,places.servesDinner,places.servesBrunch,places.servesVegetarianFood,places.evChargeOptions',
            },
        });
        this.httpClient.interceptors.request.use((config) => {
            this.logger.debug(`Google Places API request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        });
        this.httpClient.interceptors.response.use((response) => {
            this.trackApiUsage('google_places', response.config.url || '', 0.002, response.config.metadata?.responseTime || 0, true);
            return response;
        }, (error) => {
            const responseTime = error.config?.metadata?.responseTime || 0;
            this.trackApiUsage('google_places', error.config?.url || '', 0.002, responseTime, false);
            this.logger.error('Google Places API error:', error.message);
            return Promise.reject(error);
        });
    }
    async searchRestaurants(params) {
        try {
            const startTime = Date.now();
            this.logger.log(`Searching restaurants: ${params.query} near ${params.location.formattedAddress}`);
            const requestBody = {
                textQuery: params.query,
                locationBias: {
                    circle: {
                        center: {
                            latitude: params.location.lat,
                            longitude: params.location.lng,
                        },
                        radius: params.radius
                    }
                },
                maxResultCount: 20,
                languageCode: 'en'
            };
            const response = await this.httpClient.post(`${this.baseUrl}:searchText`, requestBody, {
                metadata: { responseTime: Date.now() - startTime },
            });
            if (!response.data.places) {
                this.logger.warn('No places found in Google Places API response');
                return [];
            }
            const places = response.data.places || [];
            const enrichedPlaces = places.map((place) => {
                const distance = this.calculateDistance(params.location.lat, params.location.lng, place.location?.latitude, place.location?.longitude);
                return {
                    place_id: place.id,
                    name: place.displayName?.text || place.name,
                    vicinity: place.formattedAddress,
                    rating: place.rating,
                    user_ratings_total: place.userRatingCount,
                    price_level: place.priceLevel,
                    geometry: {
                        location: {
                            lat: place.location?.latitude,
                            lng: place.location?.longitude,
                        },
                    },
                    types: place.types || [],
                    photos: place.photos || [],
                    distance: distance,
                    cuisine_type: this.extractCuisineTypes(place.types || []),
                    phone_number: place.nationalPhoneNumber || place.internationalPhoneNumber,
                    website: place.websiteUri,
                    google_maps_url: place.googleMapsUri,
                    editorial_summary: place.editorialSummary?.text,
                    business_status: place.businessStatus,
                    photo_urls: place.photos?.map((photo) => {
                        const photoReference = photo.name?.replace('places/', '') || '';
                        return photoReference ?
                            `https://places.googleapis.com/v1/${photo.name}/media?key=${this.apiKey}&maxHeightPx=400&maxWidthPx=400` : null;
                    }).filter(Boolean) || [],
                    is_open_now: place.currentOpeningHours?.openNow,
                    opening_hours: place.regularOpeningHours?.weekdayDescriptions || [],
                    current_hours: place.currentOpeningHours?.weekdayDescriptions || [],
                    secondary_hours: place.currentSecondaryOpeningHours?.weekdayDescriptions || [],
                    short_address: place.shortFormattedAddress,
                    adr_address: place.adrFormatAddress,
                    primary_type: place.primaryType,
                    primary_type_display: place.primaryTypeDisplayName?.text,
                    price_range: place.priceRange,
                    supports_takeout: place.takeout,
                    supports_delivery: place.delivery,
                    supports_dine_in: place.dineIn,
                    supports_curbside_pickup: place.curbsidePickup,
                    accepts_reservations: place.reservable,
                    payment_options: place.paymentOptions,
                    parking_options: place.parkingOptions,
                    accessibility_options: place.accessibilityOptions,
                    allows_dogs: place.allowsDogs,
                    outdoor_seating: place.outdoorSeating,
                    live_music: place.liveMusic,
                    kid_friendly: place.menuForChildren,
                    serves_beer: place.servesBeer,
                    serves_wine: place.servesWine,
                    serves_cocktails: place.servesCocktails,
                    serves_coffee: place.servesCoffee,
                    serves_dessert: place.servesDessert,
                    good_for_children: place.goodForChildren,
                    good_for_groups: place.goodForGroups,
                    good_for_watching_sports: place.goodForWatchingSports,
                    ev_charge_options: place.evChargeOptions,
                    serves_breakfast: place.servesBreakfast,
                    serves_lunch: place.servesLunch,
                    serves_dinner: place.servesDinner,
                    serves_brunch: place.servesBrunch,
                    serves_vegetarian_food: place.servesVegetarianFood,
                    recent_reviews: place.reviews?.slice(0, 3)?.map((review) => ({
                        author_name: review.authorAttribution?.displayName,
                        author_photo: review.authorAttribution?.photoUri,
                        rating: review.rating,
                        text: review.text?.text,
                        time: review.publishTime,
                        relative_time: review.relativePublishTimeDescription,
                    })) || [],
                };
            });
            this.logger.log(`Found ${enrichedPlaces.length} restaurants`);
            return enrichedPlaces;
        }
        catch (error) {
            this.logger.error('Failed to search restaurants:', error.response?.data || error.message);
            if (error.response?.status === 403) {
                this.logger.warn('Google Places API access denied - falling back to mock data');
                return this.getMockRestaurants(params);
            }
            this.logger.warn('Google Places API error - falling back to mock data');
            return this.getMockRestaurants(params);
        }
    }
    async searchNearbyRestaurants(request) {
        try {
            const startTime = Date.now();
            const params = {
                key: this.apiKey,
                location: `${request.location.latitude},${request.location.longitude}`,
                radius: request.radius,
                type: request.type || 'restaurant',
                ...(request.query && { keyword: request.query }),
                ...(request.priceLevel !== undefined && { minprice: request.priceLevel, maxprice: request.priceLevel }),
                ...(request.openNow && { opennow: true }),
            };
            const response = await this.httpClient.get(`${this.baseUrl}/nearbysearch/json`, {
                params,
                metadata: { responseTime: Date.now() - startTime },
            });
            if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
                throw new common_1.HttpException(`Google Places API error: ${response.data.status}`, common_1.HttpStatus.BAD_GATEWAY);
            }
            this.logger.debug(`Found ${response.data.results.length} nearby restaurants`);
            return response.data.results;
        }
        catch (error) {
            this.logger.error('Failed to search nearby restaurants:', error);
            throw new common_1.HttpException('Failed to fetch restaurant data', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async getPlaceDetails(placeId) {
        try {
            const startTime = Date.now();
            const params = {
                key: this.apiKey,
                place_id: placeId,
                fields: [
                    'place_id',
                    'name',
                    'formatted_address',
                    'formatted_phone_number',
                    'website',
                    'rating',
                    'user_ratings_total',
                    'price_level',
                    'opening_hours',
                    'photos',
                    'reviews',
                    'geometry',
                    'types',
                ].join(','),
            };
            const response = await this.httpClient.get(`${this.baseUrl}/details/json`, {
                params,
                metadata: { responseTime: Date.now() - startTime },
            });
            if (response.data.status !== 'OK') {
                throw new common_1.HttpException(`Google Places API error: ${response.data.status}`, common_1.HttpStatus.BAD_GATEWAY);
            }
            return response.data.result;
        }
        catch (error) {
            this.logger.error(`Failed to get place details for ${placeId}:`, error);
            throw new common_1.HttpException('Failed to fetch restaurant details', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async getPhotoUrl(photoReference, maxWidth = 400) {
        return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
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
    async getApiUsageStats() {
        try {
            const stats = await this.databaseService.apiUsageTracking.groupBy({
                by: ['apiName'],
                where: {
                    apiName: 'google_places',
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
                _sum: {
                    costEstimate: true,
                },
                _count: {
                    id: true,
                },
                _avg: {
                    responseTime: true,
                },
            });
            return stats;
        }
        catch (error) {
            this.logger.error('Failed to get API usage stats:', error);
            return [];
        }
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2)
            return 0;
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return Math.round(distance * 1000) / 1000;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    getMockRestaurants(params) {
        this.logger.log(`Returning mock restaurants for query: ${params.query}`);
        const cuisineTypes = params.query.toLowerCase().includes('italian') ? ['italian'] :
            params.query.toLowerCase().includes('chinese') ? ['chinese'] :
                params.query.toLowerCase().includes('mexican') ? ['mexican'] :
                    params.query.toLowerCase().includes('american') ? ['american'] :
                        ['restaurant', 'food', 'meal_takeaway'];
        const mockRestaurants = [
            {
                place_id: 'mock_restaurant_1',
                name: `Tony's ${cuisineTypes[0] === 'italian' ? 'Italian' : cuisineTypes[0] === 'chinese' ? 'Chinese' : 'American'} Kitchen`,
                vicinity: '123 Main St, New York, NY',
                rating: 4.5,
                user_ratings_total: 256,
                price_level: 2,
                geometry: {
                    location: {
                        lat: params.location.lat + 0.001,
                        lng: params.location.lng + 0.001,
                    },
                },
                types: ['restaurant', 'food', ...cuisineTypes],
                photos: [],
                distance: 0.16,
                cuisine_type: cuisineTypes,
            },
            {
                place_id: 'mock_restaurant_2',
                name: `Bella ${cuisineTypes[0] === 'italian' ? 'Vista' : cuisineTypes[0] === 'chinese' ? 'Garden' : 'Bistro'}`,
                vicinity: '456 Oak Ave, New York, NY',
                rating: 4.2,
                user_ratings_total: 189,
                price_level: 3,
                geometry: {
                    location: {
                        lat: params.location.lat - 0.002,
                        lng: params.location.lng + 0.002,
                    },
                },
                types: ['restaurant', 'food', ...cuisineTypes],
                photos: [],
                distance: 0.48,
                cuisine_type: cuisineTypes,
            },
            {
                place_id: 'mock_restaurant_3',
                name: `The ${cuisineTypes[0] === 'italian' ? 'Olive Branch' : cuisineTypes[0] === 'chinese' ? 'Golden Dragon' : 'Corner Grill'}`,
                vicinity: '789 Pine St, New York, NY',
                rating: 4.7,
                user_ratings_total: 312,
                price_level: 2,
                geometry: {
                    location: {
                        lat: params.location.lat + 0.003,
                        lng: params.location.lng - 0.001,
                    },
                },
                types: ['restaurant', 'food', ...cuisineTypes],
                photos: [],
                distance: 0.80,
                cuisine_type: cuisineTypes,
            },
        ];
        return mockRestaurants;
    }
    extractCuisineTypes(types) {
        const cuisineMap = {
            'restaurant': 'general',
            'meal_takeaway': 'takeaway',
            'meal_delivery': 'delivery',
            'food': 'general',
        };
        return types.map(type => cuisineMap[type] || type).filter(Boolean);
    }
};
exports.GooglePlacesService = GooglePlacesService;
exports.GooglePlacesService = GooglePlacesService = GooglePlacesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        database_service_1.DatabaseService])
], GooglePlacesService);
//# sourceMappingURL=places.service.js.map