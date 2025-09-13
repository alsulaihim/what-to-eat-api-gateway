import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Event } from '../../common/types/intelligence.types';
export declare class EventbriteService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    constructor(httpService: HttpService, configService: ConfigService);
    getLocalEvents(location: string, radiusKm?: number): Promise<Event[]>;
    private searchEvents;
    private processEvents;
    private getCategoryId;
    private getVenueName;
    private estimateAttendance;
    private categorizeEvent;
    getTransportationDisruptions(location: string): Promise<Event[]>;
}
