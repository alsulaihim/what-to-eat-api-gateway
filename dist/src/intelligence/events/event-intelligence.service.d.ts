import { EventbriteService } from '../../external-apis/events/eventbrite.service';
import { EventIntelligence } from '../../common/types/intelligence.types';
export declare class EventIntelligenceService {
    private readonly eventbriteService;
    private readonly logger;
    constructor(eventbriteService: EventbriteService);
    getEventImpactAnalysis(location: string, radiusKm?: number): Promise<EventIntelligence>;
    private analyzeEventImpact;
    private categorizeEvents;
    private calculateImpactAnalysis;
    private calculateRestaurantDemand;
    private calculateTrafficImpact;
    private identifyCrowdDisplacement;
    private suggestAlternativeAreas;
    private optimizeTiming;
}
