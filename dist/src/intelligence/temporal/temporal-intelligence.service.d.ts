import { TemporalIntelligence } from '../../common/types/intelligence.types';
export declare class TemporalIntelligenceService {
    private readonly logger;
    analyzeTemporalBehavior(timeZone?: string): Promise<TemporalIntelligence>;
    private getTimeContext;
    private getSeasonalPeriod;
    private analyzeBehavioralPatterns;
    private determineEnergyState;
    private predictCravings;
    private calculateSocialDiningLikelihood;
    private determineMealTiming;
    private isHoliday;
    private getThanksgivingDay;
}
