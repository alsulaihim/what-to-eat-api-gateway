import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EconomicData } from '../../common/types/intelligence.types';

@Injectable()
export class FederalReserveService {
  private readonly logger = new Logger(FederalReserveService.name);
  private readonly baseUrl = 'https://api.stlouisfed.org/fred';

  constructor(private readonly httpService: HttpService) {}

  async getEconomicIndicators(): Promise<EconomicData> {
    try {
      const [unemployment, gasPrice, foodInflation, consumerConfidence] = await Promise.all([
        this.getUnemploymentRate(),
        this.getGasPrices(),
        this.getFoodInflationRate(),
        this.getConsumerConfidenceIndex(),
      ]);

      return {
        unemployment_rate: unemployment,
        gas_price_avg: gasPrice,
        food_price_index: foodInflation,
        consumer_confidence_index: consumerConfidence,
        inflation_rate: await this.getInflationRate(),
      };
    } catch (error) {
      this.logger.error('Failed to fetch economic indicators:', error.message);
      throw new Error(`Economic data unavailable: ${error.message}`);
    }
  }

  private async getUnemploymentRate(): Promise<number> {
    try {
      // Using the public FRED API (no key required for basic data)
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/series/observations`, {
          params: {
            series_id: 'UNRATE', // Unemployment Rate series
            limit: 1,
            sort_order: 'desc',
            file_type: 'json',
          },
          headers: {
            'User-Agent': 'WhatToEat-Intelligence/1.0',
          },
        }),
      );

      const observations = response.data.observations;
      if (observations && observations.length > 0) {
        return parseFloat(observations[0].value);
      }
      return 4.0; // Default fallback
    } catch (error) {
      this.logger.warn('Failed to fetch unemployment rate:', error.message);
      return 4.0; // Default fallback
    }
  }

  private async getGasPrices(): Promise<number> {
    try {
      // Alternative: Use EIA API for gas prices
      const response = await firstValueFrom(
        this.httpService.get('https://api.eia.gov/v2/petroleum/pri/gnd/data/', {
          params: {
            'frequency': 'weekly',
            'data[0]': 'value',
            'facets[duoarea][]': 'NUS', // National US average
            'facets[product][]': 'EPM0', // Regular gasoline
            'sort[0][column]': 'period',
            'sort[0][direction]': 'desc',
            'offset': 0,
            'length': 1,
          },
          headers: {
            'User-Agent': 'WhatToEat-Intelligence/1.0',
          },
        }),
      );

      if (response.data?.response?.data?.length > 0) {
        return response.data.response.data[0].value;
      }

      return 3.50; // Default fallback
    } catch (error) {
      this.logger.warn('Failed to fetch gas prices:', error.message);
      return 3.50; // Default fallback
    }
  }

  private async getFoodInflationRate(): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/series/observations`, {
          params: {
            series_id: 'CPIUFDSL', // Consumer Price Index for Food
            limit: 12, // Get last 12 months for YoY calculation
            sort_order: 'desc',
            file_type: 'json',
          },
          headers: {
            'User-Agent': 'WhatToEat-Intelligence/1.0',
          },
        }),
      );

      const observations = response.data.observations;
      if (observations && observations.length >= 12) {
        const current = parseFloat(observations[0].value);
        const yearAgo = parseFloat(observations[11].value);
        return ((current - yearAgo) / yearAgo) * 100;
      }

      return 3.2; // Default fallback
    } catch (error) {
      this.logger.warn('Failed to fetch food inflation rate:', error.message);
      return 3.2; // Default fallback
    }
  }

  private async getConsumerConfidenceIndex(): Promise<number> {
    try {
      // Using University of Michigan Consumer Sentiment Index
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/series/observations`, {
          params: {
            series_id: 'UMCSENT', // University of Michigan Consumer Sentiment
            limit: 1,
            sort_order: 'desc',
            file_type: 'json',
          },
          headers: {
            'User-Agent': 'WhatToEat-Intelligence/1.0',
          },
        }),
      );

      const observations = response.data.observations;
      if (observations && observations.length > 0) {
        return parseFloat(observations[0].value);
      }

      return 100.0; // Default fallback
    } catch (error) {
      this.logger.warn('Failed to fetch consumer confidence:', error.message);
      return 100.0; // Default fallback
    }
  }

  private async getInflationRate(): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/series/observations`, {
          params: {
            series_id: 'CPIAUCSL', // Consumer Price Index for All Urban Consumers
            limit: 12, // Get last 12 months for YoY calculation
            sort_order: 'desc',
            file_type: 'json',
          },
          headers: {
            'User-Agent': 'WhatToEat-Intelligence/1.0',
          },
        }),
      );

      const observations = response.data.observations;
      if (observations && observations.length >= 12) {
        const current = parseFloat(observations[0].value);
        const yearAgo = parseFloat(observations[11].value);
        return ((current - yearAgo) / yearAgo) * 100;
      }

      return 3.0; // Default fallback
    } catch (error) {
      this.logger.warn('Failed to fetch inflation rate:', error.message);
      return 3.0; // Default fallback
    }
  }
}