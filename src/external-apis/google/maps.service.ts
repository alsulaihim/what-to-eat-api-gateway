import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { DatabaseService } from '../../common/database/database.service';

export interface GeocodeRequest {
  address: string;
}

export interface ReverseGeocodeRequest {
  latitude: number;
  longitude: number;
}

export interface DirectionsRequest {
  origin: {
    latitude: number;
    longitude: number;
  };
  destination: {
    latitude: number;
    longitude: number;
  };
  travelMode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

export interface GeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  types: string[];
}

export interface DirectionsResult {
  distance: {
    text: string;
    value: number; // meters
  };
  duration: {
    text: string;
    value: number; // seconds
  };
  steps: Array<{
    distance: {
      text: string;
      value: number;
    };
    duration: {
      text: string;
      value: number;
    };
    html_instructions: string;
    start_location: {
      lat: number;
      lng: number;
    };
    end_location: {
      lat: number;
      lng: number;
    };
  }>;
}

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly httpClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
    
    if (!this.apiKey) {
      this.logger.error('Google Maps API key not configured');
    }

    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling and logging
    this.httpClient.interceptors.response.use(
      (response) => {
        this.trackApiUsage('google_maps', response.config.url || '', 0.002, response.config.metadata?.responseTime || 0, true);
        return response;
      },
      (error) => {
        const responseTime = error.config?.metadata?.responseTime || 0;
        this.trackApiUsage('google_maps', error.config?.url || '', 0.002, responseTime, false);
        this.logger.error('Google Maps API error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  async geocode(request: GeocodeRequest): Promise<GeocodeResult[]> {
    try {
      const startTime = Date.now();

      const params = {
        key: this.apiKey,
        address: request.address,
      };

      const response = await this.httpClient.get(`${this.baseUrl}/geocode/json`, {
        params,
        metadata: { responseTime: Date.now() - startTime },
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new HttpException(
          `Google Maps Geocoding API error: ${response.data.status}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      this.logger.debug(`Geocoded address: ${request.address}`);
      return response.data.results;
    } catch (error) {
      this.logger.error('Failed to geocode address:', error);
      throw new HttpException(
        'Failed to geocode address',
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async reverseGeocode(request: ReverseGeocodeRequest): Promise<GeocodeResult[]> {
    try {
      const startTime = Date.now();

      const params = {
        key: this.apiKey,
        latlng: `${request.latitude},${request.longitude}`,
      };

      const response = await this.httpClient.get(`${this.baseUrl}/geocode/json`, {
        params,
        metadata: { responseTime: Date.now() - startTime },
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new HttpException(
          `Google Maps Reverse Geocoding API error: ${response.data.status}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      this.logger.debug(`Reverse geocoded: ${request.latitude}, ${request.longitude}`);
      return response.data.results;
    } catch (error) {
      this.logger.error('Failed to reverse geocode coordinates:', error);
      throw new HttpException(
        'Failed to reverse geocode coordinates',
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async getDirections(request: DirectionsRequest): Promise<DirectionsResult[]> {
    try {
      const startTime = Date.now();

      const params = {
        key: this.apiKey,
        origin: `${request.origin.latitude},${request.origin.longitude}`,
        destination: `${request.destination.latitude},${request.destination.longitude}`,
        mode: request.travelMode || 'driving',
      };

      const response = await this.httpClient.get(`${this.baseUrl}/directions/json`, {
        params,
        metadata: { responseTime: Date.now() - startTime },
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new HttpException(
          `Google Maps Directions API error: ${response.data.status}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      // Transform routes to our format
      const routes = response.data.routes.map((route: any) => ({
        distance: route.legs[0].distance,
        duration: route.legs[0].duration,
        steps: route.legs[0].steps,
      }));

      this.logger.debug(`Retrieved directions for ${request.travelMode || 'driving'} mode`);
      return routes;
    } catch (error) {
      this.logger.error('Failed to get directions:', error);
      throw new HttpException(
        'Failed to get directions',
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async calculateDistanceMatrix(
    origins: Array<{ latitude: number; longitude: number }>,
    destinations: Array<{ latitude: number; longitude: number }>,
    travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<any> {
    try {
      const startTime = Date.now();

      const formatLocations = (locations: Array<{ latitude: number; longitude: number }>) =>
        locations.map(loc => `${loc.latitude},${loc.longitude}`).join('|');

      const params = {
        key: this.apiKey,
        origins: formatLocations(origins),
        destinations: formatLocations(destinations),
        mode: travelMode,
        units: 'metric',
      };

      const response = await this.httpClient.get(`${this.baseUrl}/distancematrix/json`, {
        params,
        metadata: { responseTime: Date.now() - startTime },
      });

      if (response.data.status !== 'OK') {
        throw new HttpException(
          `Google Maps Distance Matrix API error: ${response.data.status}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      this.logger.debug(`Calculated distance matrix for ${origins.length}x${destinations.length} locations`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to calculate distance matrix:', error);
      throw new HttpException(
        'Failed to calculate distance matrix',
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async getTimezone(location: { latitude: number; longitude: number }): Promise<any> {
    try {
      const startTime = Date.now();

      const params = {
        key: this.apiKey,
        location: `${location.latitude},${location.longitude}`,
        timestamp: Math.floor(Date.now() / 1000),
      };

      const response = await this.httpClient.get(`${this.baseUrl}/timezone/json`, {
        params,
        metadata: { responseTime: Date.now() - startTime },
      });

      if (response.data.status !== 'OK') {
        throw new HttpException(
          `Google Maps Timezone API error: ${response.data.status}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get timezone:', error);
      throw new HttpException(
        'Failed to get timezone information',
        HttpStatus.BAD_GATEWAY
      );
    }
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
    }
  }
}