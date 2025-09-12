import { ConfigService } from '@nestjs/config';
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
        value: number;
    };
    duration: {
        text: string;
        value: number;
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
export declare class MapsService {
    private configService;
    private databaseService;
    private readonly logger;
    private readonly httpClient;
    private readonly apiKey;
    private readonly baseUrl;
    constructor(configService: ConfigService, databaseService: DatabaseService);
    geocode(request: GeocodeRequest): Promise<GeocodeResult[]>;
    reverseGeocode(request: ReverseGeocodeRequest): Promise<GeocodeResult[]>;
    getDirections(request: DirectionsRequest): Promise<DirectionsResult[]>;
    calculateDistanceMatrix(origins: Array<{
        latitude: number;
        longitude: number;
    }>, destinations: Array<{
        latitude: number;
        longitude: number;
    }>, travelMode?: 'driving' | 'walking' | 'bicycling' | 'transit'): Promise<any>;
    getTimezone(location: {
        latitude: number;
        longitude: number;
    }): Promise<any>;
    private trackApiUsage;
}
