import { Injectable, Logger } from '@nestjs/common';
import { FederalReserveService } from '../../external-apis/government/fed.service';
import { EconomicIntelligence, EconomicData } from '../../common/types/intelligence.types';

@Injectable()
export class EconomicIntelligenceService {
  private readonly logger = new Logger(EconomicIntelligenceService.name);

  constructor(private readonly fedService: FederalReserveService) {}

  async analyzeEconomicImpact(): Promise<EconomicIntelligence> {
    try {
      const economicData = await this.fedService.getEconomicIndicators();
      return this.processEconomicData(economicData);
    } catch (error) {
      this.logger.error('Failed to analyze economic impact:', error.message);
      throw new Error(`Economic intelligence unavailable: ${error.message}`);
    }
  }

  private processEconomicData(data: EconomicData): EconomicIntelligence {
    const diningBehaviorImpact = this.analyzeDiningBehaviorImpact(data);

    return {
      economic_indicators: {
        local_unemployment: data.unemployment_rate,
        gas_prices: data.gas_price_avg,
        food_inflation: data.food_price_index,
        consumer_confidence: data.consumer_confidence_index,
      },
      dining_behavior_impact: diningBehaviorImpact,
    };
  }

  private analyzeDiningBehaviorImpact(data: EconomicData): any {
    const budgetShift = this.determineBudgetShift(data);
    const deliverySensitivity = this.calculateDeliverySensitivity(data);
    const valueSeeking = this.assessValueSeekingBehavior(data);
    const categoryPreferences = this.determineCategoryPreferences(data);

    return {
      budget_shift: budgetShift,
      delivery_sensitivity: deliverySensitivity,
      value_seeking: valueSeeking,
      category_preferences: categoryPreferences,
    };
  }

  private determineBudgetShift(data: EconomicData): string {
    const economicStressScore = this.calculateEconomicStressScore(data);

    if (economicStressScore >= 0.8) {
      return 'strong shift toward budget dining options';
    } else if (economicStressScore >= 0.6) {
      return 'moderate preference for value dining';
    } else if (economicStressScore >= 0.4) {
      return 'slight preference for mid-range options';
    } else if (economicStressScore >= 0.2) {
      return 'stable spending on dining experiences';
    } else {
      return 'increased willingness for premium dining';
    }
  }

  private calculateEconomicStressScore(data: EconomicData): number {
    let stressScore = 0;

    // Unemployment impact (0.0 - 0.3)
    if (data.unemployment_rate > 7.0) {
      stressScore += 0.3;
    } else if (data.unemployment_rate > 5.0) {
      stressScore += 0.2;
    } else if (data.unemployment_rate > 3.5) {
      stressScore += 0.1;
    }

    // Gas price impact (0.0 - 0.2)
    if (data.gas_price_avg > 5.0) {
      stressScore += 0.2;
    } else if (data.gas_price_avg > 4.0) {
      stressScore += 0.15;
    } else if (data.gas_price_avg > 3.5) {
      stressScore += 0.1;
    }

    // Food inflation impact (0.0 - 0.25)
    if (data.food_price_index > 8.0) {
      stressScore += 0.25;
    } else if (data.food_price_index > 5.0) {
      stressScore += 0.2;
    } else if (data.food_price_index > 3.0) {
      stressScore += 0.15;
    } else if (data.food_price_index > 2.0) {
      stressScore += 0.1;
    }

    // Consumer confidence impact (0.0 - 0.25)
    if (data.consumer_confidence_index < 80) {
      stressScore += 0.25;
    } else if (data.consumer_confidence_index < 90) {
      stressScore += 0.2;
    } else if (data.consumer_confidence_index < 100) {
      stressScore += 0.15;
    } else if (data.consumer_confidence_index < 110) {
      stressScore += 0.1;
    }

    return Math.min(1.0, stressScore);
  }

  private calculateDeliverySensitivity(data: EconomicData): number {
    let sensitivity = 0.5; // Base sensitivity

    // Gas price impact on delivery preference
    if (data.gas_price_avg > 5.0) {
      sensitivity = 0.9; // Very high sensitivity - people avoid driving
    } else if (data.gas_price_avg > 4.5) {
      sensitivity = 0.8; // High sensitivity
    } else if (data.gas_price_avg > 4.0) {
      sensitivity = 0.7; // Moderate sensitivity
    } else if (data.gas_price_avg > 3.5) {
      sensitivity = 0.6; // Low sensitivity
    }

    // Adjust for unemployment (affects disposable income for delivery fees)
    if (data.unemployment_rate > 6.0) {
      sensitivity -= 0.2; // High unemployment reduces delivery usage due to fees
    } else if (data.unemployment_rate < 4.0) {
      sensitivity += 0.1; // Low unemployment increases delivery usage
    }

    // Adjust for consumer confidence
    if (data.consumer_confidence_index > 110) {
      sensitivity += 0.1; // High confidence increases delivery spending
    } else if (data.consumer_confidence_index < 85) {
      sensitivity -= 0.1; // Low confidence reduces delivery spending
    }

    return Math.max(0.1, Math.min(1.0, sensitivity));
  }

  private assessValueSeekingBehavior(data: EconomicData): boolean {
    const stressScore = this.calculateEconomicStressScore(data);
    const inflationPressure = data.food_price_index > 4.0;
    const lowConfidence = data.consumer_confidence_index < 95;

    return stressScore > 0.5 || inflationPressure || lowConfidence;
  }

  private determineCategoryPreferences(data: EconomicData): string[] {
    const preferences: string[] = [];
    const stressScore = this.calculateEconomicStressScore(data);

    if (stressScore >= 0.7) {
      // High economic stress
      preferences.push('fast food chains');
      preferences.push('value menu items');
      preferences.push('food trucks');
      preferences.push('ethnic restaurants'); // Often better value
      preferences.push('lunch specials');
    } else if (stressScore >= 0.5) {
      // Moderate economic stress
      preferences.push('fast-casual dining');
      preferences.push('chain restaurants');
      preferences.push('happy hour deals');
      preferences.push('buffet-style restaurants');
      preferences.push('family-friendly chains');
    } else if (stressScore >= 0.3) {
      // Low economic stress
      preferences.push('casual dining');
      preferences.push('mid-range restaurants');
      preferences.push('local favorites');
      preferences.push('themed restaurants');
      preferences.push('brunch spots');
    } else {
      // Economic confidence
      preferences.push('fine dining');
      preferences.push('upscale casual');
      preferences.push('chef-driven restaurants');
      preferences.push('wine bars');
      preferences.push('experiential dining');
    }

    // Gas price specific adjustments
    if (data.gas_price_avg > 4.5) {
      preferences.unshift('nearby locations preferred');
      preferences.push('delivery-friendly options');
    }

    // Food inflation adjustments
    if (data.food_price_index > 6.0) {
      preferences.unshift('portion size value');
      preferences.push('shareable plates');
    }

    // Consumer confidence adjustments
    if (data.consumer_confidence_index > 115) {
      preferences.push('new restaurant openings');
      preferences.push('premium experiences');
    } else if (data.consumer_confidence_index < 85) {
      preferences.unshift('reliable chains');
      preferences.push('comfort food establishments');
    }

    return preferences.slice(0, 8); // Limit to top 8 preferences
  }
}