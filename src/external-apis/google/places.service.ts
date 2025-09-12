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
export class PlacesService {
  private readonly logger = new Logger(PlacesService.name);
  private readonly httpClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place';

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
}