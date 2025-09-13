import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface SimpleEvent {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    venue: string;
    expected_attendance: number;
    category: string;
}
export declare class ExternalEventsSimpleService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    constructor(httpService: HttpService, configService: ConfigService);
    getLocalEvents(location: string, radiusKm?: number): Promise<SimpleEvent[]>;
    private searchEvents;
    private processEvents;
    private getCategoryId;
    private getVenueName;
    private estimateAttendance;
    private categorizeEvent;
    getTransportationDisruptions(location: string): Promise<SimpleEvent[]>;
}
