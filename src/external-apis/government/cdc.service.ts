import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HealthData } from '../../common/types/intelligence.types';

@Injectable()
export class CdcService {
  private readonly logger = new Logger(CdcService.name);

  constructor(private readonly httpService: HttpService) {}

  async getHealthData(location: string): Promise<HealthData> {
    try {
      const [fluActivity, airQuality, seasonalTrends] = await Promise.all([
        this.getFluActivity(),
        this.getAirQualityEstimate(location),
        this.getSeasonalHealthTrends(),
      ]);

      return {
        flu_activity_level: fluActivity,
        air_quality_index: airQuality,
        pollen_forecast: this.getPollenForecast(),
        seasonal_health_trends: seasonalTrends,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch health data for ${location}:`, error.message);
      throw new Error(`Health data unavailable: ${error.message}`);
    }
  }

  private async getFluActivity(): Promise<string> {
    try {
      // CDC's FluView API (simplified approach using their surveillance data)
      const response = await firstValueFrom(
        this.httpService.get('https://www.cdc.gov/flu/weekly/weeklyarchives2023-2024/data/senAllregt09.json', {
          headers: {
            'User-Agent': 'WhatToEat-Intelligence/1.0',
          },
        }),
      );

      if (response.data && Array.isArray(response.data)) {
        const latestWeek = response.data[response.data.length - 1];
        if (latestWeek && latestWeek.ACTIVITY_LEVEL) {
          return this.interpretFluActivity(latestWeek.ACTIVITY_LEVEL);
        }
      }

      return this.getSeasonalFluActivity();
    } catch (error) {
      this.logger.warn('Failed to fetch CDC flu data, using seasonal estimation:', error.message);
      return this.getSeasonalFluActivity();
    }
  }

  private interpretFluActivity(level: string): string {
    const levelMap = {
      '1': 'minimal',
      '2': 'low',
      '3': 'low',
      '4': 'moderate',
      '5': 'moderate',
      '6': 'high',
      '7': 'high',
      '8': 'high',
      '9': 'very high',
      '10': 'very high',
    };

    return levelMap[level] || 'moderate';
  }

  private getSeasonalFluActivity(): string {
    const now = new Date();
    const month = now.getMonth(); // 0-11

    // Flu season typically peaks between December and February
    if (month >= 11 || month <= 2) {
      return 'high';
    } else if (month >= 9 || month <= 4) {
      return 'moderate';
    } else {
      return 'low';
    }
  }

  private async getAirQualityEstimate(location: string): Promise<number> {
    try {
      // Seasonal air quality estimation based on location and time of year
      const now = new Date();
      const month = now.getMonth(); // 0-11
      const normalizedLocation = location.toLowerCase().replace(/[^a-z\s]/g, '').trim();

      // Base AQI by location type (major cities tend to have higher pollution)
      const majorCities = ['new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'dallas'];
      let baseAQI = majorCities.includes(normalizedLocation) ? 65 : 45;

      // Seasonal adjustments
      if (month >= 5 && month <= 8) {
        // Summer - higher ozone, wildfire season
        baseAQI += 15;
      } else if (month >= 11 || month <= 1) {
        // Winter - heating season, inversion layers
        baseAQI += 10;
      } else if (month >= 2 && month <= 4) {
        // Spring - dust, pollen
        baseAQI += 5;
      }

      // Location-specific adjustments
      if (normalizedLocation.includes('los angeles') || normalizedLocation.includes('phoenix')) {
        baseAQI += 20; // Desert cities, smog
      } else if (normalizedLocation.includes('seattle') || normalizedLocation.includes('portland')) {
        baseAQI -= 10; // Pacific Northwest, cleaner air
      }

      // Ensure AQI stays within reasonable bounds (0-150 for this estimation)
      return Math.max(25, Math.min(150, baseAQI));
    } catch (error) {
      this.logger.warn('Failed to estimate air quality:', error.message);
      return 50; // Default moderate air quality
    }
  }

  private async getLatitude(location: string): Promise<number> {
    // Simplified geocoding - in production, use Google Maps API
    const cityCoordinates = {
      'new york': 40.7128,
      'los angeles': 34.0522,
      'chicago': 41.8781,
      'houston': 29.7604,
      'phoenix': 33.4484,
      'philadelphia': 39.9526,
      'san antonio': 29.4241,
      'san diego': 32.7157,
      'dallas': 32.7767,
      'san jose': 37.3382,
      'austin': 30.2672,
      'jacksonville': 30.3322,
      'san francisco': 37.7749,
      'columbus': 39.9612,
      'fort worth': 32.7555,
      'indianapolis': 39.7684,
      'charlotte': 35.2271,
      'seattle': 47.6062,
      'denver': 39.7392,
      'washington': 38.9072,
    };

    const normalizedLocation = location.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    return cityCoordinates[normalizedLocation] || 39.8283; // Default to center of US
  }

  private async getLongitude(location: string): Promise<number> {
    const cityCoordinates = {
      'new york': -74.0060,
      'los angeles': -118.2437,
      'chicago': -87.6298,
      'houston': -95.3698,
      'phoenix': -112.0740,
      'philadelphia': -75.1652,
      'san antonio': -98.4936,
      'san diego': -117.1611,
      'dallas': -96.7970,
      'san jose': -121.8863,
      'austin': -97.7431,
      'jacksonville': -81.6557,
      'san francisco': -122.4194,
      'columbus': -82.9988,
      'fort worth': -97.3308,
      'indianapolis': -86.1581,
      'charlotte': -80.8431,
      'seattle': -122.3321,
      'denver': -104.9903,
      'washington': -77.0369,
    };

    const normalizedLocation = location.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    return cityCoordinates[normalizedLocation] || -98.5795; // Default to center of US
  }

  private getPollenForecast(): string {
    const now = new Date();
    const month = now.getMonth(); // 0-11

    // Seasonal pollen patterns
    if (month >= 2 && month <= 5) {
      return 'high'; // Spring - tree and grass pollen
    } else if (month >= 6 && month <= 8) {
      return 'moderate'; // Summer - grass pollen
    } else if (month >= 8 && month <= 10) {
      return 'high'; // Fall - ragweed and mold
    } else {
      return 'low'; // Winter - minimal pollen
    }
  }

  private async getSeasonalHealthTrends(): Promise<string[]> {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const trends: string[] = [];

    // Seasonal health patterns
    if (month >= 11 || month <= 2) {
      // Winter
      trends.push('flu_season_active');
      trends.push('vitamin_d_deficiency_risk');
      trends.push('respiratory_illness_peak');
      trends.push('comfort_food_cravings');
    } else if (month >= 3 && month <= 5) {
      // Spring
      trends.push('allergy_season_active');
      trends.push('seasonal_allergies_peak');
      trends.push('detox_interest_rising');
      trends.push('fresh_produce_availability');
    } else if (month >= 6 && month <= 8) {
      // Summer
      trends.push('food_safety_concerns');
      trends.push('hydration_focus');
      trends.push('fresh_fruit_season');
      trends.push('outdoor_dining_preference');
    } else {
      // Fall
      trends.push('immune_system_preparation');
      trends.push('harvest_foods_available');
      trends.push('comfort_food_transition');
      trends.push('seasonal_depression_onset');
    }

    return trends;
  }
}