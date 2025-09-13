import { Injectable, Logger } from '@nestjs/common';
import { EventbriteService } from '../../external-apis/events/eventbrite.service';
import { EventIntelligence, Event } from '../../common/types/intelligence.types';

@Injectable()
export class EventIntelligenceService {
  private readonly logger = new Logger(EventIntelligenceService.name);

  constructor(private readonly eventbriteService: EventbriteService) {}

  async getEventImpactAnalysis(location: string, radiusKm: number = 25): Promise<EventIntelligence> {
    try {
      const [localEvents, transportationDisruptions] = await Promise.all([
        this.eventbriteService.getLocalEvents(location, radiusKm),
        this.eventbriteService.getTransportationDisruptions(location),
      ]);

      return this.analyzeEventImpact(localEvents, transportationDisruptions);
    } catch (error) {
      this.logger.error(`Failed to analyze events for ${location}:`, error.message);
      throw new Error(`Event intelligence unavailable: ${error.message}`);
    }
  }

  private analyzeEventImpact(events: Event[], transportationDisruptions: Event[]): EventIntelligence {
    const categorizedEvents = this.categorizeEvents(events);
    const impactAnalysis = this.calculateImpactAnalysis(events, transportationDisruptions);
    const timingOptimization = this.optimizeTiming(events);

    return {
      local_events: {
        sports_events: categorizedEvents.sports_events,
        cultural_events: categorizedEvents.cultural_events,
        business_conferences: categorizedEvents.business_conferences,
        transportation_disruptions: transportationDisruptions,
      },
      impact_analysis: impactAnalysis,
      timing_optimization: timingOptimization,
    };
  }

  private categorizeEvents(events: Event[]): {
    sports_events: Event[];
    cultural_events: Event[];
    business_conferences: Event[];
  } {
    const sports_events = events.filter(event => event.category === 'sports_events');
    const cultural_events = events.filter(event => event.category === 'cultural_events');
    const business_conferences = events.filter(event => event.category === 'business_conferences');

    return {
      sports_events: sports_events.slice(0, 10), // Limit to most relevant
      cultural_events: cultural_events.slice(0, 10),
      business_conferences: business_conferences.slice(0, 10),
    };
  }

  private calculateImpactAnalysis(events: Event[], transportationDisruptions: Event[]): any {
    const currentTime = new Date();
    const next24Hours = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);

    // Filter events happening in the next 24 hours
    const upcomingEvents = events.filter(event => {
      const eventTime = new Date(event.start_time);
      return eventTime >= currentTime && eventTime <= next24Hours;
    });

    // Calculate total expected attendance for upcoming events
    const totalAttendance = upcomingEvents.reduce((sum, event) => sum + event.expected_attendance, 0);

    // Calculate restaurant demand impact
    const restaurantDemand = this.calculateRestaurantDemand(totalAttendance, upcomingEvents);

    // Analyze traffic impact
    const trafficImpact = this.calculateTrafficImpact(upcomingEvents, transportationDisruptions);

    // Identify areas to avoid
    const crowdDisplacement = this.identifyCrowdDisplacement(upcomingEvents);

    // Suggest alternative areas
    const alternativeAreas = this.suggestAlternativeAreas(upcomingEvents, crowdDisplacement);

    return {
      restaurant_demand: restaurantDemand,
      traffic_impact: trafficImpact,
      crowd_displacement: crowdDisplacement,
      alternative_areas: alternativeAreas,
    };
  }

  private calculateRestaurantDemand(totalAttendance: number, events: Event[]): number {
    if (totalAttendance === 0) return 1.0; // Baseline demand

    // Base multiplier calculation
    let demandMultiplier = 1.0;

    // Large events significantly increase demand
    if (totalAttendance > 10000) {
      demandMultiplier = 2.5;
    } else if (totalAttendance > 5000) {
      demandMultiplier = 2.0;
    } else if (totalAttendance > 1000) {
      demandMultiplier = 1.5;
    } else if (totalAttendance > 500) {
      demandMultiplier = 1.3;
    } else {
      demandMultiplier = 1.1;
    }

    // Adjust based on event types
    const hasBusinessEvents = events.some(e => e.category === 'business_conferences');
    const hasSportsEvents = events.some(e => e.category === 'sports_events');
    const hasCulturalEvents = events.some(e => e.category === 'cultural_events');

    if (hasBusinessEvents) demandMultiplier *= 1.2; // Business events increase upscale dining
    if (hasSportsEvents) demandMultiplier *= 1.3; // Sports events significantly increase demand
    if (hasCulturalEvents) demandMultiplier *= 1.1; // Cultural events moderately increase demand

    // Adjust for timing
    const currentHour = new Date().getHours();
    if ((currentHour >= 11 && currentHour <= 14) || (currentHour >= 17 && currentHour <= 21)) {
      demandMultiplier *= 1.2; // Peak dining hours
    }

    return Math.min(3.0, demandMultiplier); // Cap at 3x normal demand
  }

  private calculateTrafficImpact(events: Event[], transportationDisruptions: Event[]): string {
    const totalAttendance = events.reduce((sum, event) => sum + event.expected_attendance, 0);
    const disruptionCount = transportationDisruptions.length;

    if (disruptionCount > 2 || totalAttendance > 20000) {
      return 'severe delays expected, allow extra travel time';
    } else if (disruptionCount > 0 || totalAttendance > 5000) {
      return 'moderate delays possible, plan accordingly';
    } else if (totalAttendance > 1000) {
      return 'minor traffic increase expected';
    } else {
      return 'minimal traffic impact';
    }
  }

  private identifyCrowdDisplacement(events: Event[]): string[] {
    const crowdedAreas = new Set<string>();

    events.forEach(event => {
      if (event.expected_attendance > 1000) {
        // Extract area information from venue
        const venue = event.venue.toLowerCase();

        // Common venue area patterns
        if (venue.includes('downtown')) crowdedAreas.add('downtown area');
        if (venue.includes('center') || venue.includes('centre')) crowdedAreas.add('city center');
        if (venue.includes('stadium')) crowdedAreas.add('stadium district');
        if (venue.includes('convention')) crowdedAreas.add('convention center area');
        if (venue.includes('arena')) crowdedAreas.add('arena district');
        if (venue.includes('theater') || venue.includes('theatre')) crowdedAreas.add('theater district');

        // Add specific venue areas if identifiable
        const venueWords = venue.split(/[\s,]+/);
        venueWords.forEach(word => {
          if (word.length > 3 && !['area', 'district', 'center', 'avenue', 'street'].includes(word)) {
            crowdedAreas.add(`${word} area`);
          }
        });
      }
    });

    return Array.from(crowdedAreas).slice(0, 5); // Limit to top 5 areas
  }

  private suggestAlternativeAreas(events: Event[], crowdedAreas: string[]): string[] {
    const alternatives = new Set<string>();

    // General alternative suggestions based on typical city layout
    if (crowdedAreas.some(area => area.includes('downtown'))) {
      alternatives.add('suburban dining districts');
      alternatives.add('neighborhood restaurants');
      alternatives.add('shopping mall food courts');
    }

    if (crowdedAreas.some(area => area.includes('stadium') || area.includes('arena'))) {
      alternatives.add('opposite side of city');
      alternatives.add('residential neighborhoods');
      alternatives.add('business districts');
    }

    if (crowdedAreas.some(area => area.includes('convention'))) {
      alternatives.add('local neighborhood spots');
      alternatives.add('residential areas');
      alternatives.add('college districts');
    }

    // Always suggest delivery as an alternative
    alternatives.add('delivery and takeout options');

    // Add general alternatives if none specific
    if (alternatives.size === 1) { // Only delivery was added
      alternatives.add('quieter neighborhoods');
      alternatives.add('suburban locations');
      alternatives.add('less central dining areas');
    }

    return Array.from(alternatives).slice(0, 4);
  }

  private optimizeTiming(events: Event[]): any {
    const currentTime = new Date();
    const recommendations: any = {
      pre_event_dining: 'standard dining times recommended',
      post_event_alternatives: [],
    };

    // Analyze upcoming events in next 6 hours
    const upcomingEvents = events.filter(event => {
      const eventTime = new Date(event.start_time);
      const timeDiff = eventTime.getTime() - currentTime.getTime();
      return timeDiff > 0 && timeDiff <= 6 * 60 * 60 * 1000; // Next 6 hours
    });

    if (upcomingEvents.length > 0) {
      // Find the earliest major event
      const nextMajorEvent = upcomingEvents.find(event => event.expected_attendance > 1000);

      if (nextMajorEvent) {
        const eventTime = new Date(nextMajorEvent.start_time);
        const hoursUntilEvent = (eventTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

        if (hoursUntilEvent <= 2) {
          recommendations.pre_event_dining = 'dine now before crowds arrive, or wait until after event ends';
        } else if (hoursUntilEvent <= 4) {
          recommendations.pre_event_dining = 'good time to dine before event crowds build up';
        }

        // Calculate post-event timing
        const eventEndTime = new Date(nextMajorEvent.end_time);
        const endHour = eventEndTime.getHours();

        recommendations.post_event_alternatives = [
          `avoid dining 1-2 hours after ${nextMajorEvent.name} ends`,
          'consider late-night dining options if available',
          'food trucks and fast-casual may have shorter waits',
        ];
      }
    }

    return recommendations;
  }
}