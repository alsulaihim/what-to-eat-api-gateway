"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationResponseDto = exports.RestaurantRecommendationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class RestaurantRecommendationDto {
    id;
    name;
    address;
    rating;
    priceLevel;
    priceRange;
    cuisineTypes;
    distance;
    confidenceScore;
    recommendationReason;
    isTrending;
    estimatedWaitTime;
    phoneNumber;
    website;
    googleMapsUrl;
    editorialSummary;
    businessStatus;
    primaryType;
    primaryTypeDisplay;
    shortAddress;
    photoUrls;
    isOpenNow;
    openingHours;
    hoursToday;
    supportsDelivery;
    supportsTakeout;
    supportsDineIn;
    supportsCurbsidePickup;
    acceptsReservations;
    paymentOptions;
    parkingOptions;
    accessibilityOptions;
    allowsDogs;
    outdoorSeating;
    liveMusic;
    kidFriendly;
    servesBeer;
    servesWine;
    servesCocktails;
    servesBreakfast;
    servesLunch;
    servesDinner;
    servesBrunch;
    servesVegetarianFood;
    servesCoffee;
    servesDessert;
    goodForChildren;
    goodForGroups;
    goodForWatchingSports;
    evChargeOptions;
    recentReviews;
    popularDishes;
    socialInsights;
}
exports.RestaurantRecommendationDto = RestaurantRecommendationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier for the restaurant' }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Restaurant name' }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Restaurant address' }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Restaurant rating (1-5)', minimum: 1, maximum: 5 }),
    __metadata("design:type", Number)
], RestaurantRecommendationDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price level ($, $$, $$$, $$$$)' }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "priceLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price range (e.g., "$15-25", "$$-$$$")', required: false }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "priceRange", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cuisine type(s)', type: [String] }),
    __metadata("design:type", Array)
], RestaurantRecommendationDto.prototype, "cuisineTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Distance from user location in miles' }),
    __metadata("design:type", Number)
], RestaurantRecommendationDto.prototype, "distance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Confidence score (0-100)', minimum: 0, maximum: 100 }),
    __metadata("design:type", Number)
], RestaurantRecommendationDto.prototype, "confidenceScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for recommendation' }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "recommendationReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this place is currently trending' }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "isTrending", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated wait time in minutes', required: false }),
    __metadata("design:type", Number)
], RestaurantRecommendationDto.prototype, "estimatedWaitTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Restaurant phone number', required: false }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Restaurant website URL', required: false }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Google Maps URL for this restaurant', required: false }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "googleMapsUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Editorial summary/description from Google', required: false }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "editorialSummary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business status (OPERATIONAL, CLOSED_TEMPORARILY, etc.)', required: false }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "businessStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Primary business type', required: false }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "primaryType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Primary business type display name', required: false }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "primaryTypeDisplay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Short formatted address', required: false }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "shortAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Restaurant photo URLs', type: [String], required: false }),
    __metadata("design:type", Array)
], RestaurantRecommendationDto.prototype, "photoUrls", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the restaurant is currently open', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "isOpenNow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Weekly opening hours', type: [String], required: false }),
    __metadata("design:type", Array)
], RestaurantRecommendationDto.prototype, "openingHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Operating hours for today', required: false }),
    __metadata("design:type", String)
], RestaurantRecommendationDto.prototype, "hoursToday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supports delivery service', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "supportsDelivery", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supports takeout service', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "supportsTakeout", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supports dine-in service', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "supportsDineIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supports curbside pickup', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "supportsCurbsidePickup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Accepts reservations', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "acceptsReservations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment options available', required: false }),
    __metadata("design:type", Object)
], RestaurantRecommendationDto.prototype, "paymentOptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Parking options available', required: false }),
    __metadata("design:type", Object)
], RestaurantRecommendationDto.prototype, "parkingOptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Accessibility options', required: false }),
    __metadata("design:type", Object)
], RestaurantRecommendationDto.prototype, "accessibilityOptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Allows dogs/pets', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "allowsDogs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Has outdoor seating', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "outdoorSeating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Has live music', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "liveMusic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Kid-friendly (has children\'s menu)', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "kidFriendly", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Serves beer', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "servesBeer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Serves wine', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "servesWine", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Serves cocktails', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "servesCocktails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Serves breakfast', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "servesBreakfast", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Serves lunch', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "servesLunch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Serves dinner', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "servesDinner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Serves brunch', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "servesBrunch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Serves vegetarian food', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "servesVegetarianFood", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Serves coffee', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "servesCoffee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Serves dessert', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "servesDessert", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Good for children (enhanced)', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "goodForChildren", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Good for groups', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "goodForGroups", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Good for watching sports', required: false }),
    __metadata("design:type", Boolean)
], RestaurantRecommendationDto.prototype, "goodForWatchingSports", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'EV charging options available', required: false }),
    __metadata("design:type", Object)
], RestaurantRecommendationDto.prototype, "evChargeOptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recent customer reviews', type: [Object], required: false }),
    __metadata("design:type", Array)
], RestaurantRecommendationDto.prototype, "recentReviews", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Popular dishes at this restaurant', type: [String], required: false }),
    __metadata("design:type", Array)
], RestaurantRecommendationDto.prototype, "popularDishes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Social intelligence insights', required: false }),
    __metadata("design:type", Object)
], RestaurantRecommendationDto.prototype, "socialInsights", void 0);
class RecommendationResponseDto {
    recommendations;
    totalResults;
    searchLocation;
    searchRadius;
    overallConfidence;
    aiSummary;
    socialTrends;
    timestamp;
    requestId;
}
exports.RecommendationResponseDto = RecommendationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of restaurant recommendations', type: [RestaurantRecommendationDto] }),
    __metadata("design:type", Array)
], RecommendationResponseDto.prototype, "recommendations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of recommendations returned' }),
    __metadata("design:type", Number)
], RecommendationResponseDto.prototype, "totalResults", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Search location used for recommendations' }),
    __metadata("design:type", String)
], RecommendationResponseDto.prototype, "searchLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Search radius used in miles' }),
    __metadata("design:type", Number)
], RecommendationResponseDto.prototype, "searchRadius", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Overall search confidence (0-100)', minimum: 0, maximum: 100 }),
    __metadata("design:type", Number)
], RecommendationResponseDto.prototype, "overallConfidence", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'AI-generated summary of recommendations' }),
    __metadata("design:type", String)
], RecommendationResponseDto.prototype, "aiSummary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Social trends affecting recommendations', required: false }),
    __metadata("design:type", Object)
], RecommendationResponseDto.prototype, "socialTrends", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of recommendation generation' }),
    __metadata("design:type", Date)
], RecommendationResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recommendation request ID for tracking' }),
    __metadata("design:type", String)
], RecommendationResponseDto.prototype, "requestId", void 0);
//# sourceMappingURL=recommendation-response.dto.js.map