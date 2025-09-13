import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import {
  DemographicData,
  DemographicSimilarityScore,
  DemographicIntelligenceRequest,
  DemographicIntelligenceResponse,
  UserSimilarityMatch,
  DemographicFilterCriteria
} from '../common/types/demographic.types';

@Injectable()
export class DemographicIntelligenceService {
  private readonly logger = new Logger(DemographicIntelligenceService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async getDemographicIntelligence(
    request: DemographicIntelligenceRequest
  ): Promise<DemographicIntelligenceResponse> {
    try {
      this.logger.log('Generating demographic intelligence for user');

      const similarUsers = await this.findSimilarUsers(request.userDemographics);
      const recommendations = await this.generateDemographicRecommendations(
        request.userDemographics,
        similarUsers,
        request
      );
      const insights = await this.generateCulturalInsights(
        request.userDemographics,
        request.targetLocation
      );

      return {
        success: true,
        data: {
          similarUsers: {
            count: similarUsers.length,
            demographics: similarUsers.map(user => user.demographics),
            commonPreferences: await this.analyzeCommonPreferences(similarUsers)
          },
          recommendations,
          insights
        }
      };
    } catch (error) {
      this.logger.error('Failed to generate demographic intelligence:', error);
      return {
        success: false,
        data: {
          similarUsers: { count: 0, demographics: [], commonPreferences: {
            topCuisines: [],
            avgSpiceTolerance: 5,
            avgAuthenticityPreference: 5,
            commonDietaryRestrictions: []
          }},
          recommendations: {
            cuisineBoosts: [],
            priceAdjustment: 0,
            authenticityFactor: 1,
            spiceLevelRecommendation: 5,
            culturalMatches: []
          },
          insights: {
            culturalContext: '',
            dietaryConsiderations: [],
            socialTrends: [],
            confidenceScore: 0
          }
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async findSimilarUsers(demographics: DemographicData): Promise<Array<{ demographics: DemographicData; userId: string }>> {
    try {
      const users = await this.databaseService.user.findMany({
        where: {
          AND: [
            demographics.nationality ? { nationality: demographics.nationality } : {},
            demographics.culturalBackground ? { culturalBackground: demographics.culturalBackground } : {},
            demographics.ageGroup ? { ageGroup: demographics.ageGroup } : {},
            demographics.familyStructure ? { familyStructure: demographics.familyStructure } : {},
          ]
        },
        select: {
          id: true,
          nationality: true,
          ageGroup: true,
          gender: true,
          culturalBackground: true,
          spiceToleranceLevel: true,
          authenticityPreference: true,
          languagePreference: true,
          incomeBracket: true,
          religiousDietaryRequirements: true,
          familyStructure: true,
          occupationCategory: true,
          livingArea: true,
          preferences: true
        },
        take: 100 // Limit for performance
      });

      return users.map(user => ({
        userId: user.id,
        demographics: {
          nationality: user.nationality || undefined,
          ageGroup: user.ageGroup || undefined,
          gender: user.gender || undefined,
          culturalBackground: user.culturalBackground || undefined,
          spiceToleranceLevel: user.spiceToleranceLevel || undefined,
          authenticityPreference: user.authenticityPreference || undefined,
          languagePreference: user.languagePreference || undefined,
          incomeBracket: user.incomeBracket || undefined,
          religiousDietaryRequirements: user.religiousDietaryRequirements ?
            JSON.parse(user.religiousDietaryRequirements) : undefined,
          familyStructure: user.familyStructure || undefined,
          occupationCategory: user.occupationCategory || undefined,
          livingArea: user.livingArea || undefined
        }
      }));
    } catch (error) {
      this.logger.error('Failed to find similar users:', error);
      return [];
    }
  }

  calculateSimilarityScore(userA: DemographicData, userB: DemographicData): DemographicSimilarityScore {
    let totalScore = 0;
    let categoryCount = 0;

    // Cultural similarity (30% weight)
    const culturalScore = this.calculateCulturalSimilarity(userA, userB);
    totalScore += culturalScore * 0.3;
    categoryCount++;

    // Dietary similarity (25% weight)
    const dietaryScore = this.calculateDietarySimilarity(userA, userB);
    totalScore += dietaryScore * 0.25;
    categoryCount++;

    // Lifestyle similarity (25% weight)
    const lifestyleScore = this.calculateLifestyleSimilarity(userA, userB);
    totalScore += lifestyleScore * 0.25;
    categoryCount++;

    // Preferences similarity (20% weight)
    const preferencesScore = this.calculatePreferencesSimilarity(userA, userB);
    totalScore += preferencesScore * 0.2;
    categoryCount++;

    const overallScore = totalScore / categoryCount;

    return {
      overallScore,
      categoryScores: {
        cultural: culturalScore,
        dietary: dietaryScore,
        lifestyle: lifestyleScore,
        preferences: preferencesScore
      },
      matchingFactors: this.getMatchingFactors(userA, userB),
      recommendationAdjustments: this.getRecommendationAdjustments(userA, userB)
    };
  }

  private calculateCulturalSimilarity(userA: DemographicData, userB: DemographicData): number {
    let score = 0;
    let factors = 0;

    if (userA.nationality && userB.nationality) {
      score += userA.nationality === userB.nationality ? 1 : 0;
      factors++;
    }

    if (userA.culturalBackground && userB.culturalBackground) {
      score += userA.culturalBackground === userB.culturalBackground ? 1 : 0;
      factors++;
    }

    if (userA.languagePreference && userB.languagePreference) {
      score += userA.languagePreference === userB.languagePreference ? 1 : 0;
      factors++;
    }

    return factors > 0 ? score / factors : 0.5;
  }

  private calculateDietarySimilarity(userA: DemographicData, userB: DemographicData): number {
    let score = 0;
    let factors = 0;

    if (userA.spiceToleranceLevel !== undefined && userB.spiceToleranceLevel !== undefined) {
      const diff = Math.abs(userA.spiceToleranceLevel - userB.spiceToleranceLevel);
      score += 1 - (diff / 10); // Normalize to 0-1 scale
      factors++;
    }

    if (userA.religiousDietaryRequirements && userB.religiousDietaryRequirements) {
      const commonReqs = userA.religiousDietaryRequirements.filter(req =>
        userB.religiousDietaryRequirements?.includes(req)
      ).length;
      const totalReqs = new Set([...userA.religiousDietaryRequirements, ...userB.religiousDietaryRequirements]).size;
      score += totalReqs > 0 ? commonReqs / totalReqs : 1;
      factors++;
    }

    return factors > 0 ? score / factors : 0.5;
  }

  private calculateLifestyleSimilarity(userA: DemographicData, userB: DemographicData): number {
    let score = 0;
    let factors = 0;

    if (userA.ageGroup && userB.ageGroup) {
      score += userA.ageGroup === userB.ageGroup ? 1 : 0.5;
      factors++;
    }

    if (userA.familyStructure && userB.familyStructure) {
      score += userA.familyStructure === userB.familyStructure ? 1 : 0;
      factors++;
    }

    if (userA.incomeBracket && userB.incomeBracket) {
      score += userA.incomeBracket === userB.incomeBracket ? 1 : 0.3;
      factors++;
    }

    if (userA.livingArea && userB.livingArea) {
      score += userA.livingArea === userB.livingArea ? 1 : 0;
      factors++;
    }

    return factors > 0 ? score / factors : 0.5;
  }

  private calculatePreferencesSimilarity(userA: DemographicData, userB: DemographicData): number {
    let score = 0;
    let factors = 0;

    if (userA.authenticityPreference !== undefined && userB.authenticityPreference !== undefined) {
      const diff = Math.abs(userA.authenticityPreference - userB.authenticityPreference);
      score += 1 - (diff / 10); // Normalize to 0-1 scale
      factors++;
    }

    return factors > 0 ? score / factors : 0.5;
  }

  private getMatchingFactors(userA: DemographicData, userB: DemographicData): string[] {
    const factors: string[] = [];

    if (userA.nationality === userB.nationality) factors.push('nationality');
    if (userA.culturalBackground === userB.culturalBackground) factors.push('cultural_background');
    if (userA.ageGroup === userB.ageGroup) factors.push('age_group');
    if (userA.familyStructure === userB.familyStructure) factors.push('family_structure');
    if (userA.incomeBracket === userB.incomeBracket) factors.push('income_bracket');

    return factors;
  }

  private getRecommendationAdjustments(userA: DemographicData, userB: DemographicData): any {
    return {
      cuisineBoost: this.getCuisineBoosts(userA),
      priceAdjustment: this.getPriceAdjustment(userA),
      authenticityFactor: userA.authenticityPreference ? userA.authenticityPreference / 10 : 0.5,
      spiceLevelAdjustment: userA.spiceToleranceLevel || 5
    };
  }

  private getCuisineBoosts(demographics: DemographicData): string[] {
    const boosts: string[] = [];

    // Cultural background to cuisine mapping
    if (demographics.culturalBackground) {
      switch (demographics.culturalBackground) {
        case 'asian':
          boosts.push('chinese', 'japanese', 'korean', 'thai', 'vietnamese', 'indian');
          break;
        case 'hispanic_latino':
          boosts.push('mexican', 'spanish', 'latin_american');
          break;
        case 'middle_eastern':
          boosts.push('middle_eastern', 'mediterranean', 'turkish');
          break;
        case 'black':
          boosts.push('african', 'caribbean', 'soul_food');
          break;
      }
    }

    return boosts;
  }

  private getPriceAdjustment(demographics: DemographicData): number {
    if (!demographics.incomeBracket) return 0;

    switch (demographics.incomeBracket) {
      case 'low':
        return -0.3;
      case 'lower_middle':
        return -0.15;
      case 'middle':
        return 0;
      case 'upper_middle':
        return 0.15;
      case 'high':
        return 0.3;
      default:
        return 0;
    }
  }

  private async generateDemographicRecommendations(
    demographics: DemographicData,
    similarUsers: Array<{ demographics: DemographicData; userId: string }>,
    request: DemographicIntelligenceRequest
  ): Promise<any> {
    const cuisineBoosts = this.getCuisineBoosts(demographics);
    const priceAdjustment = this.getPriceAdjustment(demographics);
    const authenticityFactor = demographics.authenticityPreference ? demographics.authenticityPreference / 10 : 0.5;
    const spiceLevelRecommendation = demographics.spiceToleranceLevel || 5;

    return {
      cuisineBoosts: cuisineBoosts.map(cuisine => ({
        cuisine,
        boost: 0.2,
        reason: `Cultural preference based on ${demographics.culturalBackground} background`
      })),
      priceAdjustment,
      authenticityFactor,
      spiceLevelRecommendation,
      culturalMatches: []
    };
  }

  private async analyzeCommonPreferences(similarUsers: Array<{ demographics: DemographicData; userId: string }>): Promise<any> {
    const spiceTolerances = similarUsers
      .map(user => user.demographics.spiceToleranceLevel)
      .filter(level => level !== undefined) as number[];

    const authenticityPreferences = similarUsers
      .map(user => user.demographics.authenticityPreference)
      .filter(pref => pref !== undefined) as number[];

    return {
      topCuisines: [
        { name: 'italian', popularity: 0.8 },
        { name: 'mexican', popularity: 0.6 },
        { name: 'asian', popularity: 0.7 }
      ],
      avgSpiceTolerance: spiceTolerances.length > 0 ?
        spiceTolerances.reduce((sum, val) => sum + val, 0) / spiceTolerances.length : 5,
      avgAuthenticityPreference: authenticityPreferences.length > 0 ?
        authenticityPreferences.reduce((sum, val) => sum + val, 0) / authenticityPreferences.length : 5,
      commonDietaryRestrictions: []
    };
  }

  private async generateCulturalInsights(
    demographics: DemographicData,
    location: string
  ): Promise<any> {
    const culturalContext = this.getCulturalContext(demographics);
    const dietaryConsiderations = this.getDietaryConsiderations(demographics);
    const socialTrends = await this.getSocialTrends(demographics, location);

    return {
      culturalContext,
      dietaryConsiderations,
      socialTrends,
      confidenceScore: 0.85
    };
  }

  private getCulturalContext(demographics: DemographicData): string {
    if (!demographics.culturalBackground) {
      return 'Diverse cultural preferences with emphasis on popular local cuisines';
    }

    switch (demographics.culturalBackground) {
      case 'asian':
        return 'Strong preference for authentic Asian cuisines with emphasis on fresh ingredients and umami flavors';
      case 'hispanic_latino':
        return 'Preference for bold flavors, family-style dining, and authentic Latin American cuisines';
      case 'middle_eastern':
        return 'Preference for halal options, Mediterranean flavors, and communal dining experiences';
      default:
        return 'Diverse cultural preferences with openness to various international cuisines';
    }
  }

  private getDietaryConsiderations(demographics: DemographicData): string[] {
    const considerations: string[] = [];

    if (demographics.religiousDietaryRequirements?.includes('halal')) {
      considerations.push('Halal certification required');
    }
    if (demographics.religiousDietaryRequirements?.includes('kosher')) {
      considerations.push('Kosher certification preferred');
    }
    if (demographics.spiceToleranceLevel && demographics.spiceToleranceLevel < 4) {
      considerations.push('Mild spice preference');
    }
    if (demographics.spiceToleranceLevel && demographics.spiceToleranceLevel > 7) {
      considerations.push('High spice tolerance');
    }

    return considerations;
  }

  private async getSocialTrends(demographics: DemographicData, location: string): Promise<string[]> {
    const trends: string[] = [];

    if (demographics.ageGroup) {
      switch (demographics.ageGroup) {
        case '18-24':
          trends.push('Instagram-worthy presentation', 'Trendy fusion cuisines', 'Late-night dining');
          break;
        case '25-34':
          trends.push('Craft cocktails', 'Farm-to-table dining', 'Weekend brunch');
          break;
        case '35-44':
          trends.push('Family-friendly options', 'Quality ingredients', 'Efficient service');
          break;
      }
    }

    return trends;
  }
}