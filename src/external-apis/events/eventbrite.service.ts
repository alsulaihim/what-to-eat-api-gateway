import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Event } from '../../common/types/intelligence.types';

@Injectable()
export class EventbriteService {
  private readonly logger = new Logger(EventbriteService.name);
  private readonly baseUrl = 'https://www.eventbriteapi.com/v3';
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('EVENTBRITE_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.error('EVENTBRITE_API_KEY not configured');
    }
  }

  async getLocalEvents(location: string, radiusKm: number = 25): Promise<Event[]> {
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
    } catch (error) {
      this.logger.error(`Failed to fetch events for ${location}:`, error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Events data unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async searchEvents(location: string, radiusKm: number, category: string): Promise<any[]> {
    try {
      const startDateTime = new Date().toISOString();
      const endDateTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Next 7 days

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/events/search/`, {
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
        }),
      );

      return response.data.events || [];
    } catch (error) {
      this.logger.warn(`Failed to search ${category} events:`, error.message);
      return [];
    }
  }

  private processEvents(events: any[]): Event[] {
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

  private getCategoryId(category: string): string {
    const categoryMap = {
      'Arts & Entertainment': '105',
      'Business & Professional': '101',
      'Sports & Fitness': '108',
      'Food & Drink': '110',
      'Health & Wellness': '107',
      'Music': '103',
    };

    return categoryMap[category as keyof typeof categoryMap] || '105';
  }

  private getVenueName(venue: any): string {
    if (!venue) return 'Venue TBD';

    if (venue.name) return venue.name;
    if (venue.address) {
      const address = venue.address;
      return `${address.address_1 || ''}, ${address.city || ''}`.trim();
    }

    return 'Location TBD';
  }

  private estimateAttendance(event: any): number {
    // Estimate attendance based on event capacity and registration data
    if (event.capacity) {
      return Math.floor(event.capacity * 0.7); // Assume 70% attendance
    }

    // Fallback estimation based on event category and venue
    const baseAttendance = {
      'Arts & Entertainment': 150,
      'Business & Professional': 80,
      'Sports & Fitness': 200,
      'Food & Drink': 120,
      'Music': 300,
    };

    const category = this.categorizeEvent(event);
    let estimated = baseAttendance[category] || 100;

    // Adjust based on event indicators
    const eventText = (event.name?.text || '').toLowerCase();

    if (eventText.includes('festival') || eventText.includes('conference')) {
      estimated *= 3;
    } else if (eventText.includes('workshop') || eventText.includes('meetup')) {
      estimated *= 0.5;
    } else if (eventText.includes('concert') || eventText.includes('game')) {
      estimated *= 2;
    }

    return Math.floor(Math.max(20, Math.min(5000, estimated)));
  }

  private categorizeEvent(event: any): string {
    if (!event.category_id && !event.name?.text) return 'cultural_events';

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

    // Default to cultural events
    return 'cultural_events';
  }

  async getTransportationDisruptions(location: string): Promise<Event[]> {
    // This would typically integrate with transit APIs
    // For now, we'll return known major transportation events
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
    } catch (error) {
      this.logger.warn('Failed to fetch transportation disruptions:', error.message);
      return [];
    }
  }
}