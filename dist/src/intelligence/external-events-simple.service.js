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
var ExternalEventsSimpleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalEventsSimpleService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let ExternalEventsSimpleService = ExternalEventsSimpleService_1 = class ExternalEventsSimpleService {
    httpService;
    configService;
    logger = new common_1.Logger(ExternalEventsSimpleService_1.name);
    baseUrl = 'https://www.eventbriteapi.com/v3';
    apiKey;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.apiKey = this.configService.get('EVENTBRITE_API_KEY') || '';
        if (!this.apiKey) {
            this.logger.error('EVENTBRITE_API_KEY not configured');
        }
    }
    async getLocalEvents(location, radiusKm = 25) {
        try {
            if (!this.apiKey) {
                throw new Error('Eventbrite API key not configured');
            }
            const [culturalEvents, businessEvents, sportsEvents] = await Promise.all([
                this.searchEvents(location, radiusKm, 'Arts & Entertainment'),
                this.searchEvents(location, radiusKm, 'Business & Professional'),
                this.searchEvents(location, radiusKm, 'Sports & Fitness'),
            ]);
            const allEvents = [...culturalEvents, ...businessEvents, ...sportsEvents];
            return this.processEvents(allEvents);
        }
        catch (error) {
            this.logger.error(`Failed to fetch events for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
            throw new Error(`Events data unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async searchEvents(location, radiusKm, category) {
        try {
            const startDateTime = new Date().toISOString();
            const endDateTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/events/search/`, {
                params: {
                    'location.address': location,
                    'location.within': `${radiusKm}km`,
                    'start_date.range_start': startDateTime,
                    'start_date.range_end': endDateTime,
                    'categories': this.getCategoryId(category),
                    'sort_by': 'date',
                    'page_size': 20,
                    'expand': 'venue,organizer',
                },
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'User-Agent': 'WhatToEat-Intelligence/1.0',
                },
            }));
            return response.data.events || [];
        }
        catch (error) {
            this.logger.warn(`Failed to search ${category} events:`, error.message);
            return [];
        }
    }
    processEvents(events) {
        return events
            .filter(event => event && event.name && event.start)
            .map(event => ({
            id: event.id,
            name: event.name.text,
            start_time: event.start.local,
            end_time: event.end.local,
            venue: this.getVenueName(event.venue),
            expected_attendance: this.estimateAttendance(event),
            category: this.categorizeEvent(event),
        }))
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    }
    getCategoryId(category) {
        const categoryMap = {
            'Arts & Entertainment': '105',
            'Business & Professional': '101',
            'Sports & Fitness': '108',
            'Food & Drink': '110',
            'Health & Wellness': '107',
            'Music': '103',
        };
        return categoryMap[category] || '105';
    }
    getVenueName(venue) {
        if (!venue)
            return 'Venue TBD';
        if (venue.name)
            return venue.name;
        if (venue.address) {
            const address = venue.address;
            return `${address.address_1 || ''}, ${address.city || ''}`.trim();
        }
        return 'Location TBD';
    }
    estimateAttendance(event) {
        if (event.capacity) {
            return Math.floor(event.capacity * 0.7);
        }
        const baseAttendance = {
            'Arts & Entertainment': 150,
            'Business & Professional': 80,
            'Sports & Fitness': 200,
            'Food & Drink': 120,
            'Music': 300,
        };
        const category = this.categorizeEvent(event);
        let estimated = baseAttendance[category] || 100;
        const eventText = (event.name?.text || '').toLowerCase();
        if (eventText.includes('festival') || eventText.includes('conference')) {
            estimated *= 3;
        }
        else if (eventText.includes('workshop') || eventText.includes('meetup')) {
            estimated *= 0.5;
        }
        else if (eventText.includes('concert') || eventText.includes('game')) {
            estimated *= 2;
        }
        return Math.floor(Math.max(20, Math.min(5000, estimated)));
    }
    categorizeEvent(event) {
        if (!event.category_id && !event.name?.text)
            return 'cultural_events';
        const eventName = (event.name?.text || '').toLowerCase();
        if (eventName.includes('sport') || eventName.includes('game') || eventName.includes('match')) {
            return 'sports_events';
        }
        if (eventName.includes('business') || eventName.includes('conference') ||
            eventName.includes('seminar') || eventName.includes('workshop')) {
            return 'business_conferences';
        }
        if (eventName.includes('food') || eventName.includes('dining') ||
            eventName.includes('restaurant') || eventName.includes('culinary')) {
            return 'food_events';
        }
        return 'cultural_events';
    }
    async getTransportationDisruptions(location) {
        try {
            const events = await this.searchEvents(location, 50, 'Business & Professional');
            return events
                .filter(event => {
                const eventText = (event.name?.text || '').toLowerCase();
                return eventText.includes('marathon') ||
                    eventText.includes('parade') ||
                    eventText.includes('construction') ||
                    eventText.includes('closure');
            })
                .map(event => ({
                id: event.id,
                name: event.name.text,
                start_time: event.start.local,
                end_time: event.end.local,
                venue: this.getVenueName(event.venue),
                expected_attendance: this.estimateAttendance(event),
                category: 'transportation_disruptions',
            }));
        }
        catch (error) {
            this.logger.warn('Failed to fetch transportation disruptions:', error.message);
            return [];
        }
    }
};
exports.ExternalEventsSimpleService = ExternalEventsSimpleService;
exports.ExternalEventsSimpleService = ExternalEventsSimpleService = ExternalEventsSimpleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], ExternalEventsSimpleService);
//# sourceMappingURL=external-events-simple.service.js.map