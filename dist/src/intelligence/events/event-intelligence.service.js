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
var EventIntelligenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const eventbrite_service_1 = require("../../external-apis/events/eventbrite.service");
let EventIntelligenceService = EventIntelligenceService_1 = class EventIntelligenceService {
    eventbriteService;
    logger = new common_1.Logger(EventIntelligenceService_1.name);
    constructor(eventbriteService) {
        this.eventbriteService = eventbriteService;
    }
    async getEventImpactAnalysis(location, radiusKm = 25) {
        try {
            const [localEvents, transportationDisruptions] = await Promise.all([
                this.eventbriteService.getLocalEvents(location, radiusKm),
                this.eventbriteService.getTransportationDisruptions(location),
            ]);
            return this.analyzeEventImpact(localEvents, transportationDisruptions);
        }
        catch (error) {
            this.logger.error(`Failed to analyze events for ${location}:`, error.message);
            throw new Error(`Event intelligence unavailable: ${error.message}`);
        }
    }
    analyzeEventImpact(events, transportationDisruptions) {
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
    categorizeEvents(events) {
        const sports_events = events.filter(event => event.category === 'sports_events');
        const cultural_events = events.filter(event => event.category === 'cultural_events');
        const business_conferences = events.filter(event => event.category === 'business_conferences');
        return {
            sports_events: sports_events.slice(0, 10),
            cultural_events: cultural_events.slice(0, 10),
            business_conferences: business_conferences.slice(0, 10),
        };
    }
    calculateImpactAnalysis(events, transportationDisruptions) {
        const currentTime = new Date();
        const next24Hours = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
        const upcomingEvents = events.filter(event => {
            const eventTime = new Date(event.start_time);
            return eventTime >= currentTime && eventTime <= next24Hours;
        });
        const totalAttendance = upcomingEvents.reduce((sum, event) => sum + event.expected_attendance, 0);
        const restaurantDemand = this.calculateRestaurantDemand(totalAttendance, upcomingEvents);
        const trafficImpact = this.calculateTrafficImpact(upcomingEvents, transportationDisruptions);
        const crowdDisplacement = this.identifyCrowdDisplacement(upcomingEvents);
        const alternativeAreas = this.suggestAlternativeAreas(upcomingEvents, crowdDisplacement);
        return {
            restaurant_demand: restaurantDemand,
            traffic_impact: trafficImpact,
            crowd_displacement: crowdDisplacement,
            alternative_areas: alternativeAreas,
        };
    }
    calculateRestaurantDemand(totalAttendance, events) {
        if (totalAttendance === 0)
            return 1.0;
        let demandMultiplier = 1.0;
        if (totalAttendance > 10000) {
            demandMultiplier = 2.5;
        }
        else if (totalAttendance > 5000) {
            demandMultiplier = 2.0;
        }
        else if (totalAttendance > 1000) {
            demandMultiplier = 1.5;
        }
        else if (totalAttendance > 500) {
            demandMultiplier = 1.3;
        }
        else {
            demandMultiplier = 1.1;
        }
        const hasBusinessEvents = events.some(e => e.category === 'business_conferences');
        const hasSportsEvents = events.some(e => e.category === 'sports_events');
        const hasCulturalEvents = events.some(e => e.category === 'cultural_events');
        if (hasBusinessEvents)
            demandMultiplier *= 1.2;
        if (hasSportsEvents)
            demandMultiplier *= 1.3;
        if (hasCulturalEvents)
            demandMultiplier *= 1.1;
        const currentHour = new Date().getHours();
        if ((currentHour >= 11 && currentHour <= 14) || (currentHour >= 17 && currentHour <= 21)) {
            demandMultiplier *= 1.2;
        }
        return Math.min(3.0, demandMultiplier);
    }
    calculateTrafficImpact(events, transportationDisruptions) {
        const totalAttendance = events.reduce((sum, event) => sum + event.expected_attendance, 0);
        const disruptionCount = transportationDisruptions.length;
        if (disruptionCount > 2 || totalAttendance > 20000) {
            return 'severe delays expected, allow extra travel time';
        }
        else if (disruptionCount > 0 || totalAttendance > 5000) {
            return 'moderate delays possible, plan accordingly';
        }
        else if (totalAttendance > 1000) {
            return 'minor traffic increase expected';
        }
        else {
            return 'minimal traffic impact';
        }
    }
    identifyCrowdDisplacement(events) {
        const crowdedAreas = new Set();
        events.forEach(event => {
            if (event.expected_attendance > 1000) {
                const venue = event.venue.toLowerCase();
                if (venue.includes('downtown'))
                    crowdedAreas.add('downtown area');
                if (venue.includes('center') || venue.includes('centre'))
                    crowdedAreas.add('city center');
                if (venue.includes('stadium'))
                    crowdedAreas.add('stadium district');
                if (venue.includes('convention'))
                    crowdedAreas.add('convention center area');
                if (venue.includes('arena'))
                    crowdedAreas.add('arena district');
                if (venue.includes('theater') || venue.includes('theatre'))
                    crowdedAreas.add('theater district');
                const venueWords = venue.split(/[\s,]+/);
                venueWords.forEach(word => {
                    if (word.length > 3 && !['area', 'district', 'center', 'avenue', 'street'].includes(word)) {
                        crowdedAreas.add(`${word} area`);
                    }
                });
            }
        });
        return Array.from(crowdedAreas).slice(0, 5);
    }
    suggestAlternativeAreas(events, crowdedAreas) {
        const alternatives = new Set();
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
        alternatives.add('delivery and takeout options');
        if (alternatives.size === 1) {
            alternatives.add('quieter neighborhoods');
            alternatives.add('suburban locations');
            alternatives.add('less central dining areas');
        }
        return Array.from(alternatives).slice(0, 4);
    }
    optimizeTiming(events) {
        const currentTime = new Date();
        const recommendations = {
            pre_event_dining: 'standard dining times recommended',
            post_event_alternatives: [],
        };
        const upcomingEvents = events.filter(event => {
            const eventTime = new Date(event.start_time);
            const timeDiff = eventTime.getTime() - currentTime.getTime();
            return timeDiff > 0 && timeDiff <= 6 * 60 * 60 * 1000;
        });
        if (upcomingEvents.length > 0) {
            const nextMajorEvent = upcomingEvents.find(event => event.expected_attendance > 1000);
            if (nextMajorEvent) {
                const eventTime = new Date(nextMajorEvent.start_time);
                const hoursUntilEvent = (eventTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
                if (hoursUntilEvent <= 2) {
                    recommendations.pre_event_dining = 'dine now before crowds arrive, or wait until after event ends';
                }
                else if (hoursUntilEvent <= 4) {
                    recommendations.pre_event_dining = 'good time to dine before event crowds build up';
                }
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
};
exports.EventIntelligenceService = EventIntelligenceService;
exports.EventIntelligenceService = EventIntelligenceService = EventIntelligenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [eventbrite_service_1.EventbriteService])
], EventIntelligenceService);
//# sourceMappingURL=event-intelligence.service.js.map