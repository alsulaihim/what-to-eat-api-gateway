import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../common/database/database.service';
export interface PlaceSearchRequest {
    query?: string;
    location: {
        latitude: number;
        longitude: number;
    };
    radius: number;
    type?: string;
    priceLevel?: number;
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
export declare class GooglePlacesService {
    private configService;
    private databaseService;
    private readonly logger;
    private readonly httpClient;
    private readonly apiKey;
    private readonly baseUrl;
    constructor(configService: ConfigService, databaseService: DatabaseService);
    searchRestaurants(params: {
        query: string;
        location: {
            lat: number;
            lng: number;
            formattedAddress: string;
        };
        radius: number;
        type: string;
    }): Promise<any[]>;
    searchNearbyRestaurants(request: PlaceSearchRequest): Promise<GooglePlace[]>;
    getPlaceDetails(placeId: string): Promise<PlaceDetailsResponse>;
    getPhotoUrl(photoReference: string, maxWidth?: number): Promise<string>;
    private trackApiUsage;
    getApiUsageStats(): Promise<any>;
    private calculateDistance;
    private deg2rad;
    private getMockRestaurants;
    private extractCuisineTypes;
}
