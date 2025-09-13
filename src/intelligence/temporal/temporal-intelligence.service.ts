import { Injectable, Logger } from '@nestjs/common';
import { TemporalIntelligence } from '../../common/types/intelligence.types';

@Injectable()
export class TemporalIntelligenceService {
  private readonly logger = new Logger(TemporalIntelligenceService.name);

  async analyzeTemporalBehavior(timeZone: string = 'America/New_York'): Promise<TemporalIntelligence> {
    try {
      const timeContext = this.getTimeContext(timeZone);
      const behavioralPatterns = this.analyzeBehavioralPatterns(timeContext);

      return {
        time_context: timeContext,
        behavioral_patterns: behavioralPatterns,
      };
    } catch (error) {
      this.logger.error('Failed to analyze temporal behavior:', error.message);
      throw new Error(`Temporal intelligence unavailable: ${error.message}`);
    }
  }

  private getTimeContext(timeZone: string): any {
    const now = new Date();

    // Convert to specified timezone
    const timeInZone = new Date(now.toLocaleString("en-US", { timeZone }));

    return {
      current_time: timeInZone.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
      }),
      day_of_week: timeInZone.toLocaleDateString('en-US', { weekday: 'long' }),
      seasonal_period: this.getSeasonalPeriod(timeInZone),
      local_time_zone: timeZone,
    };
  }

  private getSeasonalPeriod(date: Date): string {
    const month = date.getMonth(); // 0-11
    const day = date.getDate();

    // Astronomical seasons with some cultural adjustments
    if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day < 20)) {
      return 'winter';
    } else if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
      return 'spring';
    } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 22)) {
      return 'summer';
    } else {
      return 'fall';
    }
  }

  private analyzeBehavioralPatterns(timeContext: any): any {
    const currentTime = new Date();
    const hour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay(); // 0 = Sunday

    return {
      energy_state: this.determineEnergyState(hour, dayOfWeek),
      craving_predictions: this.predictCravings(hour, dayOfWeek, timeContext.seasonal_period),
      social_dining_likelihood: this.calculateSocialDiningLikelihood(hour, dayOfWeek),
      meal_timing: this.determineMealTiming(hour),
    };
  }

  private determineEnergyState(hour: number, dayOfWeek: number): string {
    // Weekend vs weekday patterns
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      // Weekend energy patterns
      if (hour >= 6 && hour < 10) {
        return 'leisurely awakening - relaxed energy';
      } else if (hour >= 10 && hour < 14) {
        return 'peak weekend energy - social and active';
      } else if (hour >= 14 && hour < 18) {
        return 'afternoon relaxation - moderate energy';
      } else if (hour >= 18 && hour < 22) {
        return 'evening social energy - dining and entertainment';
      } else {
        return 'winding down - low energy';
      }
    } else {
      // Weekday energy patterns
      if (hour >= 6 && hour < 9) {
        return 'morning rush - high but focused energy';
      } else if (hour >= 9 && hour < 12) {
        return 'peak productivity - high mental energy';
      } else if (hour >= 12 && hour < 14) {
        return 'midday break - social energy for lunch';
      } else if (hour >= 14 && hour < 17) {
        return 'afternoon productivity - sustained energy';
      } else if (hour >= 17 && hour < 19) {
        return 'post-work transition - moderate energy';
      } else if (hour >= 19 && hour < 21) {
        return 'evening dining - social energy';
      } else {
        return 'evening wind-down - decreasing energy';
      }
    }
  }

  private predictCravings(hour: number, dayOfWeek: number, season: string): string[] {
    const cravings: string[] = [];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Time-based cravings
    if (hour >= 6 && hour < 10) {
      // Morning
      cravings.push('coffee and pastries', 'hearty breakfast', 'fresh fruit');
      if (isWeekend) {
        cravings.push('brunch items', 'pancakes and waffles');
      }
    } else if (hour >= 10 && hour < 12) {
      // Late morning
      cravings.push('coffee and snacks', 'light bites', 'energizing foods');
    } else if (hour >= 12 && hour < 14) {
      // Lunch time
      cravings.push('satisfying lunch', 'quick meals', 'protein-rich foods');
      if (!isWeekend) {
        cravings.push('convenient options', 'meal deals');
      }
    } else if (hour >= 14 && hour < 17) {
      // Afternoon
      cravings.push('afternoon snacks', 'caffeine boost', 'sweet treats');
    } else if (hour >= 17 && hour < 19) {
      // Early evening
      cravings.push('happy hour items', 'appetizers', 'comfort food');
    } else if (hour >= 19 && hour < 21) {
      // Dinner time
      cravings.push('substantial dinner', 'social dining', 'indulgent foods');
    } else if (hour >= 21) {
      // Late night
      cravings.push('late night snacks', 'comfort food', 'easy options');
    }

    // Seasonal cravings
    switch (season) {
      case 'winter':
        cravings.push('warm comfort foods', 'hot beverages', 'hearty stews');
        break;
      case 'spring':
        cravings.push('fresh vegetables', 'lighter fare', 'detox foods');
        break;
      case 'summer':
        cravings.push('cold refreshing foods', 'grilled items', 'fresh fruits');
        break;
      case 'fall':
        cravings.push('pumpkin spice', 'warming spices', 'harvest foods');
        break;
    }

    // Day-specific cravings
    if (dayOfWeek === 1) { // Monday
      cravings.push('motivational foods', 'healthy restart options');
    } else if (dayOfWeek === 5) { // Friday
      cravings.push('celebratory foods', 'indulgent options', 'social dining');
    } else if (isWeekend) {
      cravings.push('leisurely dining', 'special treats', 'experimental foods');
    }

    return [...new Set(cravings)].slice(0, 8);
  }

  private calculateSocialDiningLikelihood(hour: number, dayOfWeek: number): number {
    let likelihood = 0.3; // Base likelihood

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Time of day adjustments
    if (hour >= 11 && hour < 14) {
      // Lunch time
      likelihood += isWeekend ? 0.4 : 0.3;
    } else if (hour >= 17 && hour < 22) {
      // Dinner time
      likelihood += isWeekend ? 0.5 : 0.4;
    } else if (hour >= 22 && hour < 24) {
      // Late night
      likelihood += isWeekend ? 0.3 : 0.1;
    }

    // Day of week adjustments
    if (isWeekend) {
      likelihood += 0.3;
    } else if (dayOfWeek === 5) { // Friday
      likelihood += 0.4;
    } else if (dayOfWeek === 4) { // Thursday
      likelihood += 0.2;
    }

    // Special day considerations
    const date = new Date();
    if (this.isHoliday(date)) {
      likelihood += 0.4;
    }

    return Math.max(0.1, Math.min(1.0, likelihood));
  }

  private determineMealTiming(hour: number): string {
    if (hour >= 6 && hour < 11) {
      return 'breakfast time - morning fuel needed';
    } else if (hour >= 11 && hour < 14) {
      return 'lunch time - midday sustenance';
    } else if (hour >= 14 && hour < 17) {
      return 'afternoon snack time - energy maintenance';
    } else if (hour >= 17 && hour < 21) {
      return 'dinner time - main evening meal';
    } else if (hour >= 21 && hour < 24) {
      return 'late dinner/snack time - lighter options preferred';
    } else {
      return 'late night/early morning - minimal eating activity';
    }
  }

  private isHoliday(date: Date): boolean {
    const month = date.getMonth();
    const day = date.getDate();
    const dayOfWeek = date.getDay();

    // Major US holidays that affect dining patterns
    const holidays = [
      // New Year's Day
      { month: 0, day: 1 },
      // Valentine's Day
      { month: 1, day: 14 },
      // St. Patrick's Day
      { month: 2, day: 17 },
      // Independence Day
      { month: 6, day: 4 },
      // Halloween
      { month: 9, day: 31 },
      // Thanksgiving (4th Thursday in November)
      { month: 10, day: this.getThanksgivingDay(date.getFullYear()) },
      // Christmas Eve
      { month: 11, day: 24 },
      // Christmas Day
      { month: 11, day: 25 },
      // New Year's Eve
      { month: 11, day: 31 },
    ];

    return holidays.some(holiday => holiday.month === month && holiday.day === day);
  }

  private getThanksgivingDay(year: number): number {
    // Fourth Thursday in November
    const november1 = new Date(year, 10, 1);
    const firstThursday = 1 + (4 - november1.getDay() + 7) % 7;
    return firstThursday + 21; // Add 3 weeks
  }
}