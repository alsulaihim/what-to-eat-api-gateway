import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { DatabaseService } from '../../common/database/database.service';

export interface PlaceSearchRequest {
  query?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
  type?: string; // 'restaurant', 'meal_takeaway', 'meal_delivery'
  priceLevel?: number; // 0-4 (free to very expensive)
  openNow?: boolean;
}

export interface GooglePlace {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
  };
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

export interface PlaceDetailsResponse {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

@Injectable()
export class GooglePlacesService {
  private readonly logger = new Logger(GooglePlacesService.name);
  private readonly httpClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://places.googleapis.com/v1/places';

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY') || '';
    
    if (!this.apiKey) {
      this.logger.error('Google Places API key not configured');
    }

    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.location,places.types,places.photos',
      },
    });

    // Add request interceptor for logging
    this.httpClient.interceptors.request.use((config) => {
      this.logger.debug(`Google Places API request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Add response interceptor for error handling and logging
    this.httpClient.interceptors.response.use(
      (response) => {
        this.trackApiUsage('google_places', response.config.url || '', 0.002, response.config.metadata?.responseTime || 0, true);
        return response;
      },
      (error) => {
        const responseTime = error.config?.metadata?.responseTime || 0;
        this.trackApiUsage('google_places', error.config?.url || '', 0.002, responseTime, false);
        this.logger.error('Google Places API error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  async searchRestaurants(params: {
    query: string;
    location: { lat: number; lng: number; formattedAddress: string };
    radius: number;
    type: string;
  }): Promise<any[]> {
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

      // Calculate distances and enrich data
      const places = response.data.places || [];
      const enrichedPlaces = places.map((place: any) => {
        const distance = this.calculateDistance(
          params.location.lat,
          params.location.lng,
          place.location?.latitude,
          place.location?.longitude,
        );

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
        };
      });

      this.logger.log(`Found ${enrichedPlaces.length} restaurants`);
      return enrichedPlaces;

    } catch (error: any) {
      this.logger.error('Failed to search restaurants:', error.response?.data || error.message);
      
      if (error.response?.status === 403) {
        this.logger.warn('Google Places API access denied - falling back to mock data');
        return this.getMockRestaurants(params);
      }
      
      this.logger.warn('Google Places API error - falling back to mock data');
      return this.getMockRestaurants(params);
    }
  }

  async searchNearbyRestaurants(request: PlaceSearchRequest): Promise<GooglePlace[]> {
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
        throw new HttpException(
          `Google Places API error: ${response.data.status}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      this.logger.debug(`Found ${response.data.results.length} nearby restaurants`);
      return response.data.results;
    } catch (error) {
      this.logger.error('Failed to search nearby restaurants:', error);
      throw new HttpException(
        'Failed to fetch restaurant data',
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetailsResponse> {
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
        throw new HttpException(
          `Google Places API error: ${response.data.status}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      return response.data.result;
    } catch (error) {
      this.logger.error(`Failed to get place details for ${placeId}:`, error);
      throw new HttpException(
        'Failed to fetch restaurant details',
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async getPhotoUrl(photoReference: string, maxWidth: number = 400): Promise<string> {
    return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  private async trackApiUsage(
    apiName: string,
    endpoint: string,
    costEstimate: number,
    responseTime: number,
    success: boolean,
    userId?: string
  ): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to track API usage:', error);
      // Don't throw error as this is just for tracking
    }
  }

  async getApiUsageStats(): Promise<any> {
    try {
      const stats = await this.databaseService.apiUsageTracking.groupBy({
        by: ['apiName'],
        where: {
          apiName: 'google_places',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
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
    } catch (error) {
      this.logger.error('Failed to get API usage stats:', error);
      return [];
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const R = 3959; // Earth's radius in miles
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private getMockRestaurants(params: {
    query: string;
    location: { lat: number; lng: number; formattedAddress: string };
    radius: number;
    type: string;
  }): any[] {
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
        distance: 0.1,
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
        distance: 0.3,
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
        distance: 0.5,
        cuisine_type: cuisineTypes,
      },
    ];

    return mockRestaurants;
  }

  private extractCuisineTypes(types: string[]): string[] {
    const cuisineMap: { [key: string]: string } = {
      'restaurant': 'general',
      'meal_takeaway': 'takeaway',
      'meal_delivery': 'delivery',
      'food': 'general',
    };

    return types.map(type => cuisineMap[type] || type).filter(Boolean);
  }
}