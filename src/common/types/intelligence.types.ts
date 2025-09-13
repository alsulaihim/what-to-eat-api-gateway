export interface WeatherIntelligence {
  weather_context: {
    current_conditions: string;
    forecast: string;
    air_quality: number;
    pollen_count: string;
  };
  food_correlation: {
    temperature_impact: number;
    precipitation_effect: string;
    seasonal_trends: string[];
    comfort_food_trigger: boolean;
  };
  recommendations: {
    cuisine_boost: string[];
    temperature_preference: string;
    dining_mode: string;
  };
}

export interface EventIntelligence {
  local_events: {
    sports_events: Event[];
    cultural_events: Event[];
    business_conferences: Event[];
    transportation_disruptions: Event[];
  };
  impact_analysis: {
    restaurant_demand: number;
    traffic_impact: string;
    crowd_displacement: string[];
    alternative_areas: string[];
  };
  timing_optimization: {
    pre_event_dining: string;
    post_event_alternatives: string[];
  };
}

export interface Event {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  venue: string;
  expected_attendance: number;
  category: string;
}

export interface SentimentIntelligence {
  cuisine_sentiment: {
    [cuisine: string]: {
      sentiment_score: number;
      mention_volume: number;
      trending_keywords: string[];
      trend_direction: 'rising' | 'falling' | 'stable';
    };
  };
  local_food_buzz: {
    viral_dishes: string[];
    controversy_alerts: string[];
    positive_trends: string[];
  };
}

export interface EconomicIntelligence {
  economic_indicators: {
    local_unemployment: number;
    gas_prices: number;
    food_inflation: number;
    consumer_confidence: number;
  };
  dining_behavior_impact: {
    budget_shift: string;
    delivery_sensitivity: number;
    value_seeking: boolean;
    category_preferences: string[];
  };
}

export interface HealthIntelligence {
  health_trends: {
    flu_activity: string;
    air_quality_index: number;
    allergy_forecast: string;
    fitness_season: string;
  };
  nutritional_recommendations: {
    immune_boost_foods: string[];
    respiratory_considerations: string[];
    anti_inflammatory: string[];
    performance_nutrition: string[];
  };
}

export interface DemographicsIntelligence {
  area_profile: {
    median_age: number;
    education_level: string;
    income_bracket: string;
    cultural_diversity: {
      [ethnicity: string]: number;
    };
  };
  food_culture_correlation: {
    authenticity_expectations: string[];
    fusion_acceptance: number;
    experimental_dining: number;
    cultural_food_events: string[];
  };
}

export interface TemporalIntelligence {
  time_context: {
    current_time: string;
    day_of_week: string;
    seasonal_period: string;
    local_time_zone: string;
  };
  behavioral_patterns: {
    energy_state: string;
    craving_predictions: string[];
    social_dining_likelihood: number;
    meal_timing: string;
  };
}

export interface MediaIntelligence {
  media_trends: {
    viral_food_content: string[];
    celebrity_influence: string[];
    tv_show_impact: string[];
    news_coverage: string[];
  };
  trend_prediction: {
    peak_interest_timing: string;
    geographic_spread: string;
    sustainability: number;
  };
}

export interface ApifySocialIntelligence {
  platform_data: {
    instagram: {
      posts_analyzed: number;
      trending_hashtags: string[];
      viral_restaurants: string[];
      user_sentiment: number;
      engagement_metrics: {
        avg_likes: number;
        avg_comments: number;
        top_influencers: string[];
      };
    };
    twitter: {
      tweets_analyzed: number;
      trending_topics: string[];
      mention_sentiment: number;
      retweet_velocity: number;
      influence_metrics: {
        verified_mentions: number;
        follower_reach: number;
      };
    };
    reddit: {
      discussions_analyzed: number;
      hot_topics: string[];
      community_recommendations: string[];
      upvote_sentiment: number;
      subreddit_activity: {
        [subreddit: string]: {
          post_count: number;
          engagement_score: number;
        };
      };
    };
    tiktok: {
      videos_analyzed: number;
      viral_food_trends: string[];
      hashtag_performance: {
        [hashtag: string]: {
          video_count: number;
          total_views: number;
          engagement_rate: number;
        };
      };
      creator_influence: {
        top_creators: string[];
        trend_adoption_rate: number;
      };
    };
    youtube: {
      videos_analyzed: number;
      review_sentiment: number;
      channel_recommendations: string[];
      trending_food_content: string[];
      subscriber_influence: number;
    };
    facebook: {
      posts_analyzed: number;
      page_engagement: number;
      event_mentions: string[];
      community_sentiment: number;
    };
  };

  cross_platform_analysis: {
    unified_sentiment: number;
    viral_convergence: string[];
    platform_influence_ranking: string[];
    trend_lifecycle: {
      emerging: string[];
      peak: string[];
      declining: string[];
    };
  };

  ai_social_insights: {
    authenticity_score: number;
    trend_sustainability: number;
    local_vs_global: 'local' | 'global' | 'mixed';
    demographic_appeal: string[];
    optimal_recommendation_timing: string;
  };

  cost_tracking: {
    apify_units_consumed: number;
    estimated_monthly_cost: number;
    cost_per_intelligence_query: number;
    optimization_suggestions: string[];
  };
}

export interface ComprehensiveIntelligenceRequest {
  location: string;
  radius: number;
  user_context: {
    preferences: string[];
    budget: string;
    group_size: number;
    mode: 'delivery' | 'dine-out';
  };
  demographic_data?: {
    nationality?: string;
    ageGroup?: string;
    gender?: string;
    culturalBackground?: string;
    spiceToleranceLevel?: number;
    authenticityPreference?: number;
    languagePreference?: string;
    incomeBracket?: string;
    religiousDietaryRequirements?: string[];
    familyStructure?: string;
    occupationCategory?: string;
    livingArea?: string;
  };
  enable_demographic_filtering?: boolean;
}

export interface ComprehensiveIntelligenceResponse {
  intelligence_summary: {
    weather_factor: number;
    event_impact: number;
    sentiment_boost: number;
    economic_factor: number;
    health_consideration: number;
    demographic_match: number;
    temporal_optimal: number;
    media_trending: number;
    social_media_boost: number;
  };
  apify_social_intelligence?: ApifySocialIntelligence;
  demographic_intelligence?: {
    similar_users_count: number;
    cultural_preferences: string[];
    authenticity_score: number;
    spice_level_recommendation: number;
    cuisine_boosts: Array<{ cuisine: string; boost: number; reason: string }>;
    price_adjustment: number;
    demographic_insights: string[];
  };
  ai_recommendation_context: string;
  confidence_score: number;
  last_updated: string;
}

export interface IntelligenceMetrics {
  service_performance: {
    weather_service: ServiceMetric;
    event_service: ServiceMetric;
    sentiment_service: ServiceMetric;
    economic_service: ServiceMetric;
    health_service: ServiceMetric;
    demographics_service: ServiceMetric;
    temporal_service: ServiceMetric;
    media_service: ServiceMetric;
    apify_social_service: ServiceMetric;
  };
  api_usage: {
    total_requests: number;
    failed_requests: number;
    average_response_time: number;
    cost_estimate: number;
  };
  data_freshness: {
    [service: string]: string;
  };
}

export interface ServiceMetric {
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  average_response_time: number;
  last_successful_call: string;
  uptime_percentage: number;
}

export interface WeatherData {
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

export interface EconomicData {
  unemployment_rate: number;
  gas_price_avg: number;
  food_price_index: number;
  consumer_confidence_index: number;
  inflation_rate: number;
}

export interface HealthData {
  flu_activity_level: string;
  air_quality_index: number;
  pollen_forecast: string;
  seasonal_health_trends: string[];
}

export interface NewsData {
  articles: {
    title: string;
    url: string;
    published_at: string;
    sentiment_score: number;
    relevance_score: number;
  }[];
  trending_topics: string[];
  local_sentiment: number;
}