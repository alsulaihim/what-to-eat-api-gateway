import { Injectable, Logger } from '@nestjs/common';
import { CdcService } from '../../external-apis/government/cdc.service';
import { HealthIntelligence, HealthData } from '../../common/types/intelligence.types';

@Injectable()
export class HealthIntelligenceService {
  private readonly logger = new Logger(HealthIntelligenceService.name);

  constructor(private readonly cdcService: CdcService) {}

  async analyzeHealthFoodCorrelation(location: string): Promise<HealthIntelligence> {
    try {
      const healthData = await this.cdcService.getHealthData(location);
      return this.processHealthDataForFood(healthData);
    } catch (error) {
      this.logger.error(`Failed to analyze health data for ${location}:`, error.message);
      throw new Error(`Health intelligence unavailable: ${error.message}`);
    }
  }

  private processHealthDataForFood(data: HealthData): HealthIntelligence {
    const nutritionalRecommendations = this.generateNutritionalRecommendations(data);

    return {
      health_trends: {
        flu_activity: data.flu_activity_level,
        air_quality_index: data.air_quality_index,
        allergy_forecast: data.pollen_forecast,
        fitness_season: this.determineFitnessSeason(),
      },
      nutritional_recommendations: nutritionalRecommendations,
    };
  }

  private generateNutritionalRecommendations(data: HealthData): any {
    return {
      immune_boost_foods: this.getImmuneBoosters(data),
      respiratory_considerations: this.getRespiratoryConsiderations(data),
      anti_inflammatory: this.getAntiInflammatoryFoods(data),
      performance_nutrition: this.getPerformanceNutrition(),
    };
  }

  private getImmuneBoosters(data: HealthData): string[] {
    const baseFoods = ['citrus fruits', 'leafy greens', 'yogurt', 'garlic', 'ginger'];
    const recommendations: string[] = [...baseFoods];

    // Flu season specific
    if (data.flu_activity_level === 'high' || data.flu_activity_level === 'very high') {
      recommendations.push('bone broth', 'turmeric dishes', 'zinc-rich seafood', 'elderberry');
    }

    // Seasonal health trends
    data.seasonal_health_trends.forEach(trend => {
      if (trend.includes('flu_season')) {
        recommendations.push('hot soups', 'herbal teas', 'spicy foods');
      }
      if (trend.includes('vitamin_d_deficiency')) {
        recommendations.push('fatty fish', 'fortified foods', 'mushrooms');
      }
    });

    return [...new Set(recommendations)].slice(0, 8);
  }

  private getRespiratoryConsiderations(data: HealthData): string[] {
    const considerations: string[] = [];

    // Air quality impact
    if (data.air_quality_index > 150) {
      considerations.push('avoid spicy foods that may irritate');
      considerations.push('choose anti-inflammatory options');
      considerations.push('stay hydrated with soups and broths');
      considerations.push('prefer indoor dining to limit exposure');
    } else if (data.air_quality_index > 100) {
      considerations.push('moderate spice levels recommended');
      considerations.push('focus on antioxidant-rich foods');
    }

    // Allergy considerations
    if (data.pollen_forecast === 'high') {
      considerations.push('avoid outdoor dining during peak hours');
      considerations.push('choose foods rich in quercetin');
      considerations.push('limit dairy if sensitive to mucus production');
      considerations.push('prefer HEPA-filtered indoor spaces');
    }

    // Flu activity considerations
    if (data.flu_activity_level === 'high' || data.flu_activity_level === 'very high') {
      considerations.push('prioritize hygiene-conscious establishments');
      considerations.push('consider contactless dining options');
      considerations.push('choose well-ventilated spaces');
    }

    return considerations.slice(0, 6);
  }

  private getAntiInflammatoryFoods(data: HealthData): string[] {
    const baseFoods = ['fatty fish', 'berries', 'leafy greens', 'nuts', 'olive oil'];
    const recommendations: string[] = [...baseFoods];

    // Air quality driven inflammation
    if (data.air_quality_index > 100) {
      recommendations.push('turmeric-based dishes', 'green tea', 'dark chocolate');
    }

    // Allergy season inflammation
    if (data.pollen_forecast === 'high') {
      recommendations.push('quercetin-rich foods', 'omega-3 rich options', 'fresh herbs');
    }

    // Seasonal considerations
    const month = new Date().getMonth();
    if (month >= 2 && month <= 5) { // Spring allergy season
      recommendations.push('nettle tea locations', 'local honey');
    }

    return [...new Set(recommendations)].slice(0, 8);
  }

  private getPerformanceNutrition(): string[] {
    const season = this.determineFitnessSeason();
    const recommendations: string[] = [];

    switch (season) {
      case 'marathon_training':
        recommendations.push('complex carbohydrates', 'lean proteins', 'electrolyte-rich foods');
        break;
      case 'beach_season':
        recommendations.push('lean proteins', 'fresh fruits', 'hydrating foods', 'light meals');
        break;
      case 'bulk_season':
        recommendations.push('protein-rich meals', 'healthy fats', 'calorie-dense options');
        break;
      case 'outdoor_activity':
        recommendations.push('energy-sustaining foods', 'portable nutrition', 'hydration focus');
        break;
      default:
        recommendations.push('balanced macronutrients', 'whole foods', 'adequate protein');
    }

    // Always include general performance foods
    recommendations.push('quinoa dishes', 'sweet potato options', 'Greek yogurt');

    return [...new Set(recommendations)].slice(0, 6);
  }

  private determineFitnessSeason(): string {
    const month = new Date().getMonth(); // 0-11
    const day = new Date().getDate();

    // New Year fitness season
    if (month === 0 || (month === 1 && day < 15)) {
      return 'new_year_fitness';
    }

    // Spring training season
    if (month >= 2 && month <= 4) {
      return 'marathon_training';
    }

    // Beach/summer body season
    if (month >= 4 && month <= 7) {
      return 'beach_season';
    }

    // Outdoor activity season
    if (month >= 7 && month <= 9) {
      return 'outdoor_activity';
    }

    // Bulk/maintenance season
    if (month >= 9 || month === 11) {
      return 'bulk_season';
    }

    return 'maintenance';
  }
}