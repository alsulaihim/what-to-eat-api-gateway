import { Injectable, Logger } from '@nestjs/common';
import { OpenWeatherService } from '../../external-apis/weather/openweather.service';
import { WeatherIntelligence, WeatherData } from '../../common/types/intelligence.types';

@Injectable()
export class WeatherIntelligenceService {
  private readonly logger = new Logger(WeatherIntelligenceService.name);

  constructor(private readonly weatherService: OpenWeatherService) {}

  async getWeatherFoodCorrelation(location: string): Promise<WeatherIntelligence> {
    try {
      const weatherData = await this.weatherService.getCurrentWeather(location);
      return this.analyzeWeatherFoodCorrelation(weatherData);
    } catch (error) {
      this.logger.error(`Failed to analyze weather for ${location}:`, error.message);
      throw new Error(`Weather intelligence unavailable: ${error.message}`);
    }
  }

  private analyzeWeatherFoodCorrelation(weatherData: WeatherData): WeatherIntelligence {
    const temperature = weatherData.temperature;
    const condition = weatherData.condition.toLowerCase();
    const humidity = weatherData.humidity;
    const airQuality = weatherData.air_quality.aqi;

    return {
      weather_context: {
        current_conditions: this.describeConditions(weatherData),
        forecast: this.describeForecast(weatherData),
        air_quality: airQuality,
        pollen_count: this.summarizePollenCount(weatherData.pollen),
      },
      food_correlation: {
        temperature_impact: this.calculateTemperatureImpact(temperature),
        precipitation_effect: this.analyzePrecipitationEffect(condition, weatherData.forecast.precipitation_probability),
        seasonal_trends: this.getSeasonalTrends(),
        comfort_food_trigger: this.isComfortFoodWeather(temperature, condition, airQuality),
      },
      recommendations: {
        cuisine_boost: this.getCuisineBoost(temperature, condition),
        temperature_preference: this.getTemperaturePreference(temperature, condition),
        dining_mode: this.getDiningModeRecommendation(weatherData),
      },
    };
  }

  private describeConditions(weatherData: WeatherData): string {
    const temp = weatherData.temperature;
    const condition = weatherData.condition;
    const visibility = weatherData.visibility;

    let description = `${temp}°C, ${condition.toLowerCase()}`;

    if (visibility < 5) {
      description += ', low visibility';
    }

    if (weatherData.uv_index > 7) {
      description += ', high UV';
    }

    return description;
  }

  private describeForecast(weatherData: WeatherData): string {
    const forecast = weatherData.forecast;
    let description = `Temperature ${forecast.temperature_trend}`;

    if (forecast.precipitation_probability > 50) {
      description += `, ${forecast.precipitation_probability}% chance of precipitation`;
    }

    if (forecast.condition_change !== 'conditions remaining stable') {
      description += `, ${forecast.condition_change}`;
    }

    return description;
  }

  private summarizePollenCount(pollen: any): string {
    const levels = Object.values(pollen) as string[];
    const highCount = levels.filter(level => level === 'high').length;

    if (highCount >= 3) return 'very high overall';
    if (highCount >= 2) return 'high overall';
    if (highCount >= 1) return 'moderate overall';
    return 'low overall';
  }

  private calculateTemperatureImpact(temperature: number): number {
    // Returns a value between 0.0 and 1.0 indicating how much temperature affects food choices
    if (temperature < 5) return 0.9; // Very cold drives strong comfort food preference
    if (temperature < 15) return 0.7; // Cold weather moderate comfort food preference
    if (temperature > 30) return 0.8; // Very hot drives cooling food preference
    if (temperature > 25) return 0.6; // Warm weather moderate cooling preference
    return 0.3; // Mild temperatures have minimal impact
  }

  private analyzePrecipitationEffect(condition: string, precipitationProb: number): string {
    if (condition.includes('rain') || condition.includes('storm') || precipitationProb > 70) {
      return 'strongly favors indoor dining and delivery';
    }
    if (condition.includes('cloud') || precipitationProb > 30) {
      return 'slightly favors indoor dining';
    }
    if (condition.includes('clear') || condition.includes('sun')) {
      return 'favors outdoor dining and patios';
    }
    return 'neutral impact on dining location preference';
  }

  private getSeasonalTrends(): string[] {
    const month = new Date().getMonth();
    const trends: string[] = [];

    if (month >= 11 || month <= 2) {
      // Winter
      trends.push('hot soups and stews popular');
      trends.push('comfort food demand peaks');
      trends.push('warming spices trending');
      trends.push('hearty protein dishes favored');
    } else if (month >= 3 && month <= 5) {
      // Spring
      trends.push('fresh vegetables in season');
      trends.push('lighter fare gaining popularity');
      trends.push('outdoor dining reopening');
      trends.push('detox and health foods trending');
    } else if (month >= 6 && month <= 8) {
      // Summer
      trends.push('cold dishes and salads peak');
      trends.push('ice cream and frozen treats surge');
      trends.push('grilling and BBQ season');
      trends.push('fresh fruit consumption high');
    } else {
      // Fall
      trends.push('pumpkin and autumn spices popular');
      trends.push('harvest vegetables featured');
      trends.push('transition to comfort foods begins');
      trends.push('warm beverages return');
    }

    return trends;
  }

  private isComfortFoodWeather(temperature: number, condition: string, airQuality: number): boolean {
    // Cold weather
    if (temperature < 10) return true;

    // Bad weather conditions
    if (condition.includes('rain') || condition.includes('storm') || condition.includes('snow')) {
      return true;
    }

    // Poor air quality makes people want indoor comfort
    if (airQuality > 150) return true;

    // Overcast, gloomy conditions
    if (condition.includes('overcast') || condition.includes('fog')) {
      return true;
    }

    return false;
  }

  private getCuisineBoost(temperature: number, condition: string): string[] {
    const boosts: string[] = [];

    // Temperature-based boosts
    if (temperature < 5) {
      boosts.push('Indian', 'Thai', 'Mexican', 'Italian'); // Spicy and warm cuisines
    } else if (temperature < 15) {
      boosts.push('Chinese', 'Japanese', 'Korean', 'Italian'); // Warm, comforting
    } else if (temperature > 30) {
      boosts.push('Mediterranean', 'Greek', 'Sushi', 'Vietnamese'); // Light, cooling
    } else if (temperature > 25) {
      boosts.push('Salad bars', 'Seafood', 'Mediterranean', 'Fresh Mexican');
    }

    // Condition-based adjustments
    if (condition.includes('rain') || condition.includes('storm')) {
      boosts.push('Pizza', 'Comfort food', 'Soup specialists');
    }

    if (condition.includes('sun') || condition.includes('clear')) {
      boosts.push('BBQ', 'Outdoor dining', 'Food trucks');
    }

    return [...new Set(boosts)]; // Remove duplicates
  }

  private getTemperaturePreference(temperature: number, condition: string): string {
    if (temperature < 5) {
      return 'very hot foods and beverages strongly preferred';
    } else if (temperature < 15) {
      return 'hot foods and warm beverages preferred';
    } else if (temperature > 30) {
      return 'cold foods and iced beverages strongly preferred';
    } else if (temperature > 25) {
      return 'cool foods and cold beverages preferred';
    } else {
      return 'temperature-neutral food preferences';
    }
  }

  private getDiningModeRecommendation(weatherData: WeatherData): string {
    const temp = weatherData.temperature;
    const condition = weatherData.condition.toLowerCase();
    const precipProb = weatherData.forecast.precipitation_probability;
    const airQuality = weatherData.air_quality.aqi;

    // Strong delivery preference conditions
    if (condition.includes('storm') || precipProb > 80) {
      return 'strongly recommend delivery';
    }

    if (temp < 0 || temp > 35) {
      return 'delivery preferred due to extreme temperature';
    }

    if (airQuality > 200) {
      return 'indoor dining only, avoid outdoor seating';
    }

    // Moderate delivery preference
    if (condition.includes('rain') || precipProb > 50) {
      return 'delivery preferred, indoor dining acceptable';
    }

    if (temp < 5 || temp > 30) {
      return 'indoor dining preferred';
    }

    // Good conditions for dining out
    if (condition.includes('clear') || condition.includes('sun')) {
      if (temp >= 15 && temp <= 25) {
        return 'excellent conditions for outdoor dining';
      } else {
        return 'good conditions for dining out';
      }
    }

    return 'neutral - both delivery and dining out suitable';
  }
}