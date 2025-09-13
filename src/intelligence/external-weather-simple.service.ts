import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface SimpleWeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  pressure: number;
  visibility: number;
  uv_index: number;
  air_quality: {
    aqi: number;
    main_pollutant: string;
  };
  forecast: {
    temperature_trend: string;
    precipitation_probability: number;
    condition_change: string;
  };
  pollen: {
    tree: string;
    grass: string;
    weed: string;
    mold: string;
  };
}

@Injectable()
export class ExternalWeatherSimpleService {
  private readonly logger = new Logger(ExternalWeatherSimpleService.name);
  private readonly baseUrl = 'http://api.openweathermap.org/data/2.5';
  private readonly airPollutionUrl = 'http://api.openweathermap.org/data/2.5/air_pollution';
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('OPENWEATHER_API_KEY');
    if (!this.apiKey) {
      this.logger.error('OPENWEATHER_API_KEY not configured');
    }
  }

  async getCurrentWeather(location: string): Promise<SimpleWeatherData> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenWeather API key not configured');
      }

      const coordinates = await this.getCoordinates(location);
      const [currentWeather, forecast, airPollution] = await Promise.all([
        this.getCurrentWeatherData(coordinates.lat, coordinates.lon),
        this.getForecastData(coordinates.lat, coordinates.lon),
        this.getAirPollutionData(coordinates.lat, coordinates.lon),
      ]);

      return {
        temperature: Math.round(currentWeather.main.temp),
        condition: currentWeather.weather[0].main,
        humidity: currentWeather.main.humidity,
        pressure: currentWeather.main.pressure,
        visibility: currentWeather.visibility / 1000,
        uv_index: forecast.current?.uvi || 0,
        air_quality: {
          aqi: airPollution.list[0].main.aqi,
          main_pollutant: this.getMainPollutant(airPollution.list[0].components),
        },
        forecast: {
          temperature_trend: this.analyzeTempTrend(forecast.daily.slice(0, 3)),
          precipitation_probability: forecast.daily[0].pop * 100,
          condition_change: this.analyzeConditionChange(forecast.daily.slice(0, 2)),
        },
        pollen: {
          tree: this.getPollenLevel(currentWeather.main.temp, 'tree'),
          grass: this.getPollenLevel(currentWeather.main.temp, 'grass'),
          weed: this.getPollenLevel(currentWeather.main.temp, 'weed'),
          mold: this.getPollenLevel(currentWeather.main.humidity, 'mold'),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch weather data for ${location}:`, error.message);
      throw new Error(`Weather data unavailable: ${error.message}`);
    }
  }

  private async getCoordinates(location: string): Promise<{ lat: number; lon: number }> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/weather`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
        },
      }),
    );

    return {
      lat: response.data.coord.lat,
      lon: response.data.coord.lon,
    };
  }

  private async getCurrentWeatherData(lat: number, lon: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
        },
      }),
    );
    return response.data;
  }

  private async getForecastData(lat: number, lon: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/onecall`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          exclude: 'minutely,alerts',
        },
      }),
    );
    return response.data;
  }

  private async getAirPollutionData(lat: number, lon: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(this.airPollutionUrl, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
        },
      }),
    );
    return response.data;
  }

  private getMainPollutant(components: any): string {
    const pollutants = [
      { name: 'pm2_5', value: components.pm2_5 },
      { name: 'pm10', value: components.pm10 },
      { name: 'o3', value: components.o3 },
      { name: 'no2', value: components.no2 },
      { name: 'so2', value: components.so2 },
    ];

    return pollutants.reduce((max, current) =>
      current.value > max.value ? current : max
    ).name;
  }

  private analyzeTempTrend(dailyForecasts: any[]): string {
    if (dailyForecasts.length < 2) return 'stable';

    const today = dailyForecasts[0].temp.max;
    const tomorrow = dailyForecasts[1].temp.max;
    const diff = tomorrow - today;

    if (diff > 5) return 'rising';
    if (diff < -5) return 'falling';
    return 'stable';
  }

  private analyzeConditionChange(forecasts: any[]): string {
    if (forecasts.length < 2) return 'no change expected';

    const todayCondition = forecasts[0].weather[0].main;
    const tomorrowCondition = forecasts[1].weather[0].main;

    if (todayCondition !== tomorrowCondition) {
      return `changing from ${todayCondition.toLowerCase()} to ${tomorrowCondition.toLowerCase()}`;
    }
    return 'conditions remaining stable';
  }

  private getPollenLevel(value: number, type: string): string {
    switch (type) {
      case 'tree':
        if (value > 15 && value < 25) return 'high';
        if (value > 10 && value < 30) return 'moderate';
        return 'low';
      case 'grass':
        if (value > 20 && value < 30) return 'high';
        if (value > 15 && value < 35) return 'moderate';
        return 'low';
      case 'weed':
        if (value > 25) return 'high';
        if (value > 20) return 'moderate';
        return 'low';
      case 'mold':
        if (value > 70) return 'high';
        if (value > 50) return 'moderate';
        return 'low';
      default:
        return 'unknown';
    }
  }
}