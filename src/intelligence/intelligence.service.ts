import { Injectable, Logger } from '@nestjs/common';
import { WeatherIntelligenceService } from './weather/weather-intelligence.service';
import { EventIntelligenceService } from './events/event-intelligence.service';
import { SentimentAnalysisService } from './sentiment/sentiment-analysis.service';
import { EconomicIntelligenceService } from './economic/economic-intelligence.service';
import { HealthIntelligenceService } from './health/health-intelligence.service';
import { DemographicsService } from './demographics/demographics.service';
import { TemporalIntelligenceService } from './temporal/temporal-intelligence.service';
import { MediaIntelligenceService } from './media/media-intelligence.service';
import { ApifySocialIntelligenceService } from './apify-social-intelligence.service';
import { DemographicIntelligenceService } from './demographic-intelligence.service';
import {
  ComprehensiveIntelligenceRequest,
  ComprehensiveIntelligenceResponse,
  WeatherIntelligence,
  EventIntelligence,
  SentimentIntelligence,
  EconomicIntelligence,
  HealthIntelligence,
  DemographicsIntelligence,
  TemporalIntelligence,
  MediaIntelligence,
  ApifySocialIntelligence,
} from '../common/types/intelligence.types';

@Injectable()
export class IntelligenceService {
  private readonly logger = new Logger(IntelligenceService.name);

  constructor(
    private readonly weatherService: WeatherIntelligenceService,
    private readonly eventService: EventIntelligenceService,
    private readonly sentimentService: SentimentAnalysisService,
    private readonly economicService: EconomicIntelligenceService,
    private readonly healthService: HealthIntelligenceService,
    private readonly demographicsService: DemographicsService,
    private readonly temporalService: TemporalIntelligenceService,
    private readonly mediaService: MediaIntelligenceService,
    private readonly apifySocialService: ApifySocialIntelligenceService,
    private readonly demographicIntelligenceService: DemographicIntelligenceService,
  ) {}

  async getComprehensiveIntelligence(
    request: ComprehensiveIntelligenceRequest,
  ): Promise<ComprehensiveIntelligenceResponse> {
    try {
      const startTime = Date.now();

      // Prepare demographic filter if demographic data is provided
      const demographicFilter = request.demographic_data && request.enable_demographic_filtering ? {
        nationality: request.demographic_data.nationality ? [request.demographic_data.nationality] : undefined,
        ageGroups: request.demographic_data.ageGroup ? [request.demographic_data.ageGroup] : undefined,
        culturalBackgrounds: request.demographic_data.culturalBackground ? [request.demographic_data.culturalBackground] : undefined,
        incomeBrackets: request.demographic_data.incomeBracket ? [request.demographic_data.incomeBracket] : undefined,
        familyStructures: request.demographic_data.familyStructure ? [request.demographic_data.familyStructure] : undefined,
        minSpiceTolerance: request.demographic_data.spiceToleranceLevel,
        maxSpiceTolerance: request.demographic_data.spiceToleranceLevel,
        minAuthenticityPreference: request.demographic_data.authenticityPreference,
        maxAuthenticityPreference: request.demographic_data.authenticityPreference,
      } : undefined;

      // Fetch all intelligence layers in parallel for optimal performance
      const [
        weatherIntel,
        eventIntel,
        sentimentIntel,
        economicIntel,
        healthIntel,
        demographicsIntel,
        temporalIntel,
        mediaIntel,
        apifySocialIntel,
        demographicIntel,
      ] = await Promise.allSettled([
        this.weatherService.getWeatherFoodCorrelation(request.location),
        this.eventService.getEventImpactAnalysis(request.location, request.radius),
        this.sentimentService.analyzeFoodSentiment(request.location),
        this.economicService.analyzeEconomicImpact(),
        this.healthService.analyzeHealthFoodCorrelation(request.location),
        this.demographicsService.analyzeDemographicPatterns(request.location),
        this.temporalService.analyzeTemporalBehavior(),
        this.mediaService.analyzeMediaInfluence(request.location),
        // Use demographic-filtered social intelligence if demographics provided
        demographicFilter
          ? this.apifySocialService.orchestrateDemographicFilteredIntelligence(request.location, request.user_context.preferences, demographicFilter)
          : this.apifySocialService.orchestrateSocialIntelligence(request.location, request.user_context.preferences),
        // Get demographic intelligence if demographic data is provided
        request.demographic_data
          ? this.demographicIntelligenceService.getDemographicIntelligence({
              userDemographics: request.demographic_data,
              targetLocation: request.location,
              cuisineTypes: request.user_context.preferences,
              priceRange: request.user_context.budget,
              diningMode: request.user_context.mode
            })
          : Promise.resolve({ success: false, data: null, error: 'No demographic data provided' }),
      ]);

      // Extract successful results and handle failures gracefully
      const intelligenceData = this.processIntelligenceResults({
        weather: weatherIntel,
        events: eventIntel,
        sentiment: sentimentIntel,
        economic: economicIntel,
        health: healthIntel,
        demographics: demographicsIntel,
        temporal: temporalIntel,
        media: mediaIntel,
        apifySocial: apifySocialIntel,
        demographic: demographicIntel,
      });

      // Calculate intelligence summary scores
      const intelligenceSummary = this.calculateIntelligenceSummary(
        intelligenceData,
        request.user_context,
      );

      // Generate AI recommendation context
      const aiRecommendationContext = this.generateAIRecommendationContext(
        intelligenceData,
        intelligenceSummary,
        request,
      );

      // Calculate overall confidence score
      const confidenceScore = this.calculateConfidenceScore(
        intelligenceData,
        intelligenceSummary,
      );

      const responseTime = Date.now() - startTime;
      this.logger.log(`Comprehensive intelligence analysis completed in ${responseTime}ms`);

      // Process demographic intelligence data for response
      const demographicIntelligenceData = intelligenceData.demographic?.success
        ? {
            similar_users_count: intelligenceData.demographic.data?.similarUsers?.count || 0,
            cultural_preferences: intelligenceData.demographic.data?.similarUsers?.commonPreferences?.topCuisines?.map((cuisine: any) => cuisine.name) || [],
            authenticity_score: intelligenceData.demographic.data?.recommendations?.authenticityFactor || 0,
            spice_level_recommendation: intelligenceData.demographic.data?.recommendations?.spiceLevelRecommendation || 5,
            cuisine_boosts: intelligenceData.demographic.data?.recommendations?.cuisineBoosts || [],
            price_adjustment: intelligenceData.demographic.data?.recommendations?.priceAdjustment || 0,
            demographic_insights: [
              intelligenceData.demographic.data?.insights?.culturalContext || '',
              ...(intelligenceData.demographic.data?.insights?.dietaryConsiderations || []),
              ...(intelligenceData.demographic.data?.insights?.socialTrends || [])
            ].filter(insight => insight && insight.length > 0),
          }
        : undefined;

      return {
        intelligence_summary: intelligenceSummary,
        apify_social_intelligence: intelligenceData.apifySocial,
        demographic_intelligence: demographicIntelligenceData,
        ai_recommendation_context: aiRecommendationContext,
        confidence_score: confidenceScore,
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get comprehensive intelligence:', error.message);
      throw new Error(`Comprehensive intelligence unavailable: ${error.message}`);
    }
  }

  private processIntelligenceResults(results: any): any {
    const processedData: any = {};

    // Process each intelligence layer result
    Object.keys(results).forEach(key => {
      const result = results[key];
      if (result.status === 'fulfilled') {
        processedData[key] = result.value;
      } else {
        this.logger.warn(`${key} intelligence failed:`, result.reason?.message || 'Unknown error');
        processedData[key] = null;
      }
    });

    return processedData;
  }

  private calculateIntelligenceSummary(intelligenceData: any, userContext: any): any {
    return {
      weather_factor: this.calculateWeatherFactor(intelligenceData.weather),
      event_impact: this.calculateEventImpact(intelligenceData.events),
      sentiment_boost: this.calculateSentimentBoost(intelligenceData.sentiment, userContext),
      economic_factor: this.calculateEconomicFactor(intelligenceData.economic),
      health_consideration: this.calculateHealthConsideration(intelligenceData.health),
      demographic_match: this.calculateDemographicMatch(intelligenceData.demographics, userContext),
      temporal_optimal: this.calculateTemporalOptimal(intelligenceData.temporal),
      media_trending: this.calculateMediaTrending(intelligenceData.media),
      social_media_boost: this.calculateSocialMediaBoost(intelligenceData.apifySocial),
    };
  }

  private calculateWeatherFactor(weatherData: WeatherIntelligence | null): number {
    if (!weatherData) return 0.5; // Default neutral factor

    const temperatureImpact = weatherData.food_correlation.temperature_impact;
    const comfortFoodTrigger = weatherData.food_correlation.comfort_food_trigger ? 0.3 : 0;
    const seasonalBonus = weatherData.food_correlation.seasonal_trends.length * 0.05;

    return Math.min(1.0, temperatureImpact + comfortFoodTrigger + seasonalBonus);
  }

  private calculateEventImpact(eventData: EventIntelligence | null): number {
    if (!eventData) return 0.5;

    const demandMultiplier = eventData.impact_analysis.restaurant_demand;
    const eventCount =
      eventData.local_events.sports_events.length +
      eventData.local_events.cultural_events.length +
      eventData.local_events.business_conferences.length;

    // Convert demand multiplier to 0-1 scale
    let impact = (demandMultiplier - 1.0) / 2.0; // Assuming max multiplier of 3.0

    // Adjust for disruption level
    if (eventData.impact_analysis.traffic_impact.includes('severe')) {
      impact += 0.2;
    } else if (eventData.impact_analysis.traffic_impact.includes('moderate')) {
      impact += 0.1;
    }

    return Math.max(0.1, Math.min(1.0, impact));
  }

  private calculateSentimentBoost(
    sentimentData: SentimentIntelligence | null,
    userContext: any,
  ): number {
    if (!sentimentData) return 0.5;

    let boost = 0.5;
    const userPreferences = userContext.preferences || [];

    // Check sentiment for user's preferred cuisines
    userPreferences.forEach((preference: string) => {
      const cuisineSentiment = sentimentData.cuisine_sentiment[preference];
      if (cuisineSentiment) {
        boost += cuisineSentiment.sentiment_score * 0.2;

        // Additional boost for trending cuisines
        if (cuisineSentiment.trend_direction === 'rising') {
          boost += 0.1;
        }
      }
    });

    // Boost for viral dishes and positive trends
    boost += sentimentData.local_food_buzz.viral_dishes.length * 0.05;
    boost += sentimentData.local_food_buzz.positive_trends.length * 0.03;

    // Penalty for controversies
    boost -= sentimentData.local_food_buzz.controversy_alerts.length * 0.1;

    return Math.max(0.1, Math.min(1.0, boost));
  }

  private calculateEconomicFactor(economicData: EconomicIntelligence | null): number {
    if (!economicData) return 0.5;

    let factor = 0.5;

    // Consumer confidence impact
    const confidence = economicData.economic_indicators.consumer_confidence;
    if (confidence > 110) {
      factor += 0.3;
    } else if (confidence > 100) {
      factor += 0.2;
    } else if (confidence < 85) {
      factor -= 0.2;
    }

    // Unemployment impact (inverse relationship)
    const unemployment = economicData.economic_indicators.local_unemployment;
    if (unemployment < 4) {
      factor += 0.2;
    } else if (unemployment > 7) {
      factor -= 0.2;
    }

    // Food inflation impact
    const foodInflation = economicData.economic_indicators.food_inflation;
    if (foodInflation > 6) {
      factor -= 0.15;
    } else if (foodInflation < 2) {
      factor += 0.1;
    }

    return Math.max(0.1, Math.min(1.0, factor));
  }

  private calculateHealthConsideration(healthData: HealthIntelligence | null): number {
    if (!healthData) return 0.5;

    let consideration = 0.5;

    // Flu activity impact
    const fluActivity = healthData.health_trends.flu_activity;
    if (fluActivity === 'very high' || fluActivity === 'high') {
      consideration += 0.3;
    } else if (fluActivity === 'low') {
      consideration += 0.1;
    }

    // Air quality impact
    const aqi = healthData.health_trends.air_quality_index;
    if (aqi > 150) {
      consideration += 0.3;
    } else if (aqi > 100) {
      consideration += 0.2;
    }

    // Allergy consideration
    if (healthData.health_trends.allergy_forecast === 'high') {
      consideration += 0.2;
    }

    return Math.max(0.1, Math.min(1.0, consideration));
  }

  private calculateDemographicMatch(
    demographicsData: DemographicsIntelligence | null,
    userContext: any,
  ): number {
    if (!demographicsData) return 0.5;

    let match = 0.5;
    const userPreferences = userContext.preferences || [];

    // Check if user preferences align with area's authenticity expectations
    const authenticityExpected = demographicsData.food_culture_correlation.authenticity_expectations;
    const matchingPreferences = userPreferences.filter((pref: string) =>
      authenticityExpected.some((expected: string) =>
        expected.toLowerCase().includes(pref.toLowerCase())
      )
    );

    match += (matchingPreferences.length / Math.max(userPreferences.length, 1)) * 0.3;

    // Fusion acceptance factor
    match += demographicsData.food_culture_correlation.fusion_acceptance * 0.2;

    // Experimental dining factor
    match += demographicsData.food_culture_correlation.experimental_dining * 0.2;

    return Math.max(0.1, Math.min(1.0, match));
  }

  private calculateTemporalOptimal(temporalData: TemporalIntelligence | null): number {
    if (!temporalData) return 0.5;

    let optimal = 0.5;

    // Energy state impact
    const energyState = temporalData.behavioral_patterns.energy_state;
    if (energyState.includes('peak') || energyState.includes('high')) {
      optimal += 0.3;
    } else if (energyState.includes('moderate')) {
      optimal += 0.1;
    } else if (energyState.includes('low')) {
      optimal -= 0.1;
    }

    // Social dining likelihood
    optimal += temporalData.behavioral_patterns.social_dining_likelihood * 0.3;

    // Meal timing appropriateness
    const mealTiming = temporalData.behavioral_patterns.meal_timing;
    if (mealTiming.includes('time')) {
      optimal += 0.2;
    }

    return Math.max(0.1, Math.min(1.0, optimal));
  }

  private calculateMediaTrending(mediaData: MediaIntelligence | null): number {
    if (!mediaData) return 0.5;

    let trending = 0.5;

    // Viral content boost
    trending += mediaData.media_trends.viral_food_content.length * 0.08;

    // Celebrity influence boost
    trending += mediaData.media_trends.celebrity_influence.length * 0.06;

    // TV show impact boost
    trending += mediaData.media_trends.tv_show_impact.length * 0.08;

    // Sustainability factor
    trending *= mediaData.trend_prediction.sustainability;

    return Math.max(0.1, Math.min(1.0, trending));
  }

  private generateAIRecommendationContext(
    intelligenceData: any,
    intelligenceSummary: any,
    request: ComprehensiveIntelligenceRequest,
  ): string {
    const contextParts: string[] = [];

    // Weather context
    if (intelligenceData.weather && intelligenceSummary.weather_factor > 0.7) {
      const weatherRec = intelligenceData.weather.recommendations;
      contextParts.push(`Weather strongly favors ${weatherRec.cuisine_boost.join(', ')}`);
      if (weatherRec.dining_mode.includes('delivery')) {
        contextParts.push('delivery is recommended due to weather conditions');
      }
    }

    // Event context
    if (intelligenceData.events && intelligenceSummary.event_impact > 0.6) {
      const eventImpact = intelligenceData.events.impact_analysis;
      if (eventImpact.restaurant_demand > 1.5) {
        contextParts.push(`${Math.round((eventImpact.restaurant_demand - 1) * 100)}% higher restaurant demand due to local events`);
      }
    }

    // Sentiment context
    if (intelligenceData.sentiment && intelligenceSummary.sentiment_boost > 0.8) {
      const viralDishes = intelligenceData.sentiment.local_food_buzz.viral_dishes;
      if (viralDishes.length > 0) {
        contextParts.push(`trending foods include ${viralDishes.slice(0, 2).join(', ')}`);
      }
    }

    // Economic context
    if (intelligenceData.economic && intelligenceSummary.economic_factor < 0.4) {
      contextParts.push('economic conditions favor budget-friendly dining options');
    }

    // Health context
    if (intelligenceData.health && intelligenceSummary.health_consideration > 0.7) {
      const healthRecs = intelligenceData.health.nutritional_recommendations;
      if (healthRecs.immune_boost_foods.length > 0) {
        contextParts.push(`health trends suggest ${healthRecs.immune_boost_foods.slice(0, 2).join(', ')} are beneficial`);
      }
    }

    // Temporal context
    if (intelligenceData.temporal && intelligenceSummary.temporal_optimal > 0.8) {
      const cravings = intelligenceData.temporal.behavioral_patterns.craving_predictions;
      contextParts.push(`current time patterns suggest cravings for ${cravings.slice(0, 2).join(', ')}`);
    }

    // Social media context (Apify)
    if (intelligenceData.apifySocial && intelligenceSummary.social_media_boost > 0.8) {
      const viralTrends = intelligenceData.apifySocial.cross_platform_analysis.viral_convergence;
      if (viralTrends.length > 0) {
        contextParts.push(`UNPRECEDENTED social media convergence: ${viralTrends.slice(0, 2).join(', ')} trending across ${intelligenceData.apifySocial.cross_platform_analysis.platform_influence_ranking.slice(0, 3).join(', ')}`);
      }

      const unifiedSentiment = intelligenceData.apifySocial.cross_platform_analysis.unified_sentiment;
      if (unifiedSentiment > 0.6) {
        contextParts.push(`${Math.round(unifiedSentiment * 100)}% positive social sentiment across all platforms`);
      }
    }

    // Default context if no strong signals
    if (contextParts.length === 0) {
      contextParts.push('balanced conditions across all intelligence factors');
    }

    return contextParts.join(', ') + '. ' +
           `Recommendations optimized for ${request.user_context.mode} dining with ` +
           `${request.user_context.group_size} person${request.user_context.group_size > 1 ? 's' : ''} ` +
           `and ${request.user_context.budget} budget.`;
  }

  private calculateSocialMediaBoost(apifySocialData: ApifySocialIntelligence | null): number {
    if (!apifySocialData) return 0.5;

    let boost = 0.5;

    // Cross-platform viral convergence boost
    const viralConvergence = apifySocialData.cross_platform_analysis.viral_convergence;
    boost += viralConvergence.length * 0.05; // 0.05 per trending item

    // Unified sentiment boost
    const unifiedSentiment = apifySocialData.cross_platform_analysis.unified_sentiment;
    boost += unifiedSentiment * 0.3;

    // Platform influence boost
    const topPlatforms = apifySocialData.cross_platform_analysis.platform_influence_ranking.slice(0, 3);
    boost += topPlatforms.length * 0.05;

    // Authenticity and sustainability boost
    boost += apifySocialData.ai_social_insights.authenticity_score * 0.2;
    boost += apifySocialData.ai_social_insights.trend_sustainability * 0.15;

    // Local relevance boost
    if (apifySocialData.ai_social_insights.local_vs_global === 'local') {
      boost += 0.2;
    } else if (apifySocialData.ai_social_insights.local_vs_global === 'mixed') {
      boost += 0.1;
    }

    return Math.max(0.1, Math.min(1.0, boost));
  }

  private calculateConfidenceScore(intelligenceData: any, intelligenceSummary: any): number {
    let confidence = 0.5; // Base confidence

    // Count successful intelligence layers
    const successfulLayers = Object.values(intelligenceData).filter(data => data !== null).length;
    const totalLayers = Object.keys(intelligenceData).length;
    const successRate = successfulLayers / totalLayers;

    confidence = successRate * 0.6; // 60% weight on data availability

    // Add confidence based on intelligence factor strength
    const factors = Object.values(intelligenceSummary) as number[];
    const avgFactorStrength = factors.reduce((sum: number, factor: number) => sum + factor, 0) / factors.length;
    confidence += avgFactorStrength * 0.4; // 40% weight on factor strength

    // Boost confidence for strong signals in multiple areas
    const strongFactors = factors.filter(factor => factor > 0.8).length;
    if (strongFactors >= 3) {
      confidence += 0.1;
    }

    return Math.round(Math.max(0.1, Math.min(1.0, confidence)) * 100);
  }
}