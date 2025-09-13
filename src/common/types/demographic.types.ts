export interface DemographicData {
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
}

export interface DemographicSimilarityScore {
  overallScore: number;
  categoryScores: {
    cultural: number;
    dietary: number;
    lifestyle: number;
    preferences: number;
  };
  matchingFactors: string[];
  recommendationAdjustments: {
    cuisineBoost?: string[];
    priceAdjustment?: number;
    authenticityFactor?: number;
    spiceLevelAdjustment?: number;
  };
}

export interface DemographicIntelligenceRequest {
  userDemographics: DemographicData;
  targetLocation: string;
  cuisineTypes?: string[];
  priceRange?: string;
  diningMode?: string;
}

export interface DemographicIntelligenceResponse {
  success: boolean;
  data: {
    similarUsers: {
      count: number;
      demographics: DemographicData[];
      commonPreferences: {
        topCuisines: Array<{ name: string; popularity: number }>;
        avgSpiceTolerance: number;
        avgAuthenticityPreference: number;
        commonDietaryRestrictions: string[];
      };
    };
    recommendations: {
      cuisineBoosts: Array<{ cuisine: string; boost: number; reason: string }>;
      priceAdjustment: number;
      authenticityFactor: number;
      spiceLevelRecommendation: number;
      culturalMatches: Array<{ restaurant: string; culturalRelevance: number }>;
    };
    insights: {
      culturalContext: string;
      dietaryConsiderations: string[];
      socialTrends: string[];
      confidenceScore: number;
    };
  };
  error?: string;
}

export interface UserSimilarityMatch {
  userId: string;
  similarityScore: DemographicSimilarityScore;
  sharedPreferences: string[];
  recommendationHistory: {
    sharedRestaurants: string[];
    similarRatings: number;
  };
}

export interface DemographicFilterCriteria {
  nationality?: string[];
  ageGroups?: string[];
  culturalBackgrounds?: string[];
  incomeBrackets?: string[];
  familyStructures?: string[];
  minSpiceTolerance?: number;
  maxSpiceTolerance?: number;
  minAuthenticityPreference?: number;
  maxAuthenticityPreference?: number;
}

export interface SocialMediaDemographicFilter extends DemographicFilterCriteria {
  platforms?: string[];
  hashtags?: string[];
  influencerTypes?: string[];
  engagementLevels?: string[];
}