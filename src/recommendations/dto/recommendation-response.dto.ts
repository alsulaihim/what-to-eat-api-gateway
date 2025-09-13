import { ApiProperty } from '@nestjs/swagger';

export class RestaurantRecommendationDto {
  @ApiProperty({ description: 'Unique identifier for the restaurant' })
  id?: string;

  @ApiProperty({ description: 'Restaurant name' })
  name?: string;

  @ApiProperty({ description: 'Restaurant address' })
  address?: string;

  @ApiProperty({ description: 'Restaurant rating (1-5)', minimum: 1, maximum: 5 })
  rating?: number;

  @ApiProperty({ description: 'Price level ($, $$, $$$, $$$$)' })
  priceLevel?: string;

  @ApiProperty({ description: 'Price range (e.g., "$15-25", "$$-$$$")', required: false })
  priceRange?: string;

  @ApiProperty({ description: 'Cuisine type(s)', type: [String] })
  cuisineTypes?: string[];

  @ApiProperty({ description: 'Distance from user location in miles' })
  distance?: number;

  @ApiProperty({ description: 'Confidence score (0-100)', minimum: 0, maximum: 100 })
  confidenceScore?: number;

  @ApiProperty({ description: 'Reason for recommendation' })
  recommendationReason?: string;

  @ApiProperty({ description: 'Whether this place is currently trending' })
  isTrending?: boolean;

  @ApiProperty({ description: 'Estimated wait time in minutes', required: false })
  estimatedWaitTime?: number;

  @ApiProperty({ description: 'Restaurant phone number', required: false })
  phoneNumber?: string;

  @ApiProperty({ description: 'Restaurant website URL', required: false })
  website?: string;

  @ApiProperty({ description: 'Google Maps URL for this restaurant', required: false })
  googleMapsUrl?: string;

  @ApiProperty({ description: 'Editorial summary/description from Google', required: false })
  editorialSummary?: string;

  @ApiProperty({ description: 'Business status (OPERATIONAL, CLOSED_TEMPORARILY, etc.)', required: false })
  businessStatus?: string;

  @ApiProperty({ description: 'Primary business type', required: false })
  primaryType?: string;

  @ApiProperty({ description: 'Primary business type display name', required: false })
  primaryTypeDisplay?: string;

  @ApiProperty({ description: 'Short formatted address', required: false })
  shortAddress?: string;

  @ApiProperty({ description: 'Restaurant photo URLs', type: [String], required: false })
  photoUrls?: string[];

  // Hours and status
  @ApiProperty({ description: 'Whether the restaurant is currently open', required: false })
  isOpenNow?: boolean;

  @ApiProperty({ description: 'Weekly opening hours', type: [String], required: false })
  openingHours?: string[];

  @ApiProperty({ description: 'Operating hours for today', required: false })
  hoursToday?: string;

  // Service options
  @ApiProperty({ description: 'Supports delivery service', required: false })
  supportsDelivery?: boolean;

  @ApiProperty({ description: 'Supports takeout service', required: false })
  supportsTakeout?: boolean;

  @ApiProperty({ description: 'Supports dine-in service', required: false })
  supportsDineIn?: boolean;

  @ApiProperty({ description: 'Supports curbside pickup', required: false })
  supportsCurbsidePickup?: boolean;

  @ApiProperty({ description: 'Accepts reservations', required: false })
  acceptsReservations?: boolean;

  // Amenities and features
  @ApiProperty({ description: 'Payment options available', required: false })
  paymentOptions?: any;

  @ApiProperty({ description: 'Parking options available', required: false })
  parkingOptions?: any;

  @ApiProperty({ description: 'Accessibility options', required: false })
  accessibilityOptions?: any;

  @ApiProperty({ description: 'Allows dogs/pets', required: false })
  allowsDogs?: boolean;

  @ApiProperty({ description: 'Has outdoor seating', required: false })
  outdoorSeating?: boolean;

  @ApiProperty({ description: 'Has live music', required: false })
  liveMusic?: boolean;

  @ApiProperty({ description: 'Kid-friendly (has children\'s menu)', required: false })
  kidFriendly?: boolean;

  @ApiProperty({ description: 'Serves beer', required: false })
  servesBeer?: boolean;

  @ApiProperty({ description: 'Serves wine', required: false })
  servesWine?: boolean;

  @ApiProperty({ description: 'Serves cocktails', required: false })
  servesCocktails?: boolean;

  // Menu & Meal Information
  @ApiProperty({ description: 'Serves breakfast', required: false })
  servesBreakfast?: boolean;

  @ApiProperty({ description: 'Serves lunch', required: false })
  servesLunch?: boolean;

  @ApiProperty({ description: 'Serves dinner', required: false })
  servesDinner?: boolean;

  @ApiProperty({ description: 'Serves brunch', required: false })
  servesBrunch?: boolean;

  @ApiProperty({ description: 'Serves vegetarian food', required: false })
  servesVegetarianFood?: boolean;

  // Enhanced Food & Beverage Options
  @ApiProperty({ description: 'Serves coffee', required: false })
  servesCoffee?: boolean;

  @ApiProperty({ description: 'Serves dessert', required: false })
  servesDessert?: boolean;

  // Enhanced Atmosphere & Experience
  @ApiProperty({ description: 'Good for children (enhanced)', required: false })
  goodForChildren?: boolean;

  @ApiProperty({ description: 'Good for groups', required: false })
  goodForGroups?: boolean;

  @ApiProperty({ description: 'Good for watching sports', required: false })
  goodForWatchingSports?: boolean;

  // Additional Services
  @ApiProperty({ description: 'EV charging options available', required: false })
  evChargeOptions?: any;

  // Reviews
  @ApiProperty({ description: 'Recent customer reviews', type: [Object], required: false })
  recentReviews?: Array<{
    author_name?: string;
    author_photo?: string;
    rating?: number;
    text?: string;
    time?: string;
    relative_time?: string;
  }>;

  @ApiProperty({ description: 'Popular dishes at this restaurant', type: [String], required: false })
  popularDishes?: string[];

  @ApiProperty({ description: 'Social intelligence insights', required: false })
  socialInsights?: {
    recentOrderTrends: string;
    popularTimes: string;
    crowdLevel: 'low' | 'medium' | 'high';
  };
}

export class RecommendationResponseDto {
  @ApiProperty({ description: 'List of restaurant recommendations', type: [RestaurantRecommendationDto] })
  recommendations?: RestaurantRecommendationDto[];

  @ApiProperty({ description: 'Total number of recommendations returned' })
  totalResults?: number;

  @ApiProperty({ description: 'Search location used for recommendations' })
  searchLocation?: string;

  @ApiProperty({ description: 'Search radius used in miles' })
  searchRadius?: number;

  @ApiProperty({ description: 'Overall search confidence (0-100)', minimum: 0, maximum: 100 })
  overallConfidence?: number;

  @ApiProperty({ description: 'AI-generated summary of recommendations' })
  aiSummary?: string;

  @ApiProperty({ description: 'Social trends affecting recommendations', required: false })
  socialTrends?: {
    trendingCuisines: string[];
    popularMealTimes: string[];
    localEvents: string[];
  };

  @ApiProperty({ description: 'Timestamp of recommendation generation' })
  timestamp?: Date;

  @ApiProperty({ description: 'Recommendation request ID for tracking' })
  requestId?: string;
}