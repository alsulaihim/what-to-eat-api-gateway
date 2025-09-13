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
exports.RecommendationRequestDto = exports.BudgetRange = exports.RecommendationMode = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var RecommendationMode;
(function (RecommendationMode) {
    RecommendationMode["DELIVERY"] = "delivery";
    RecommendationMode["DINE_OUT"] = "dine_out";
})(RecommendationMode || (exports.RecommendationMode = RecommendationMode = {}));
var BudgetRange;
(function (BudgetRange) {
    BudgetRange["LOW"] = "$";
    BudgetRange["MEDIUM"] = "$$";
    BudgetRange["HIGH"] = "$$$";
    BudgetRange["PREMIUM"] = "$$$$";
})(BudgetRange || (exports.BudgetRange = BudgetRange = {}));
class RecommendationRequestDto {
    mode;
    partySize;
    budget;
    location;
    latitude;
    longitude;
    cuisinePreferences;
    dietaryRestrictions;
    maxDistance;
    includeTrending;
}
exports.RecommendationRequestDto = RecommendationRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mode of dining (delivery or dine out)',
        enum: RecommendationMode,
        example: RecommendationMode.DINE_OUT
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RecommendationMode),
    __metadata("design:type", String)
], RecommendationRequestDto.prototype, "mode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of people in the party',
        minimum: 1,
        maximum: 20,
        example: 2
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], RecommendationRequestDto.prototype, "partySize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Budget range preference',
        enum: BudgetRange,
        example: BudgetRange.MEDIUM
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(BudgetRange),
    __metadata("design:type", String)
], RecommendationRequestDto.prototype, "budget", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User location (address or coordinates)',
        example: 'New York, NY'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecommendationRequestDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Latitude coordinate',
        example: 40.7128
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecommendationRequestDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Longitude coordinate',
        example: -74.0060
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecommendationRequestDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Preferred cuisine types',
        type: [String],
        example: ['italian', 'mexican', 'asian']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RecommendationRequestDto.prototype, "cuisinePreferences", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Dietary restrictions',
        type: [String],
        example: ['vegetarian', 'gluten-free']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RecommendationRequestDto.prototype, "dietaryRestrictions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum distance in miles (for dine out)',
        minimum: 0.1,
        maximum: 50,
        example: 5
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], RecommendationRequestDto.prototype, "maxDistance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Include trending/popular places',
        example: true
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], RecommendationRequestDto.prototype, "includeTrending", void 0);
//# sourceMappingURL=recommendation-request.dto.js.map