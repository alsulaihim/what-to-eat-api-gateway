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
exports.UserProfileResponseDto = exports.UpdateUserPreferencesDto = exports.UpdateUserProfileDto = exports.UserPreferencesDto = exports.DemographicDataDto = exports.NotificationsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class NotificationsDto {
    email;
    push;
    trending;
}
exports.NotificationsDto = NotificationsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Email notifications enabled',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationsDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Push notifications enabled',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationsDto.prototype, "push", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Trending notifications enabled',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationsDto.prototype, "trending", void 0);
class DemographicDataDto {
    nationality;
    ageGroup;
    gender;
    culturalBackground;
    spiceToleranceLevel;
    authenticityPreference;
    languagePreference;
    incomeBracket;
    religiousDietaryRequirements;
    familyStructure;
    occupationCategory;
    livingArea;
}
exports.DemographicDataDto = DemographicDataDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User nationality (ISO 3166-1 alpha-2 code)',
        example: 'US',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DemographicDataDto.prototype, "nationality", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Age group',
        example: '25-34',
        enum: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['18-24', '25-34', '35-44', '45-54', '55-64', '65+']),
    __metadata("design:type", String)
], DemographicDataDto.prototype, "ageGroup", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Gender identity',
        example: 'other',
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['male', 'female', 'other', 'prefer_not_to_say']),
    __metadata("design:type", String)
], DemographicDataDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cultural background/ethnicity',
        example: 'latino',
        enum: ['asian', 'black', 'hispanic_latino', 'middle_eastern', 'native_american', 'pacific_islander', 'white', 'mixed', 'other', 'prefer_not_to_say'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['asian', 'black', 'hispanic_latino', 'middle_eastern', 'native_american', 'pacific_islander', 'white', 'mixed', 'other', 'prefer_not_to_say']),
    __metadata("design:type", String)
], DemographicDataDto.prototype, "culturalBackground", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Spice tolerance level (1-10 scale)',
        example: 7,
        minimum: 1,
        maximum: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], DemographicDataDto.prototype, "spiceToleranceLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Authenticity preference level (1-10 scale)',
        example: 8,
        minimum: 1,
        maximum: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], DemographicDataDto.prototype, "authenticityPreference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Primary language preference (ISO 639-1 code)',
        example: 'en',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DemographicDataDto.prototype, "languagePreference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Income bracket for dining budget estimation',
        example: 'middle',
        enum: ['low', 'lower_middle', 'middle', 'upper_middle', 'high', 'prefer_not_to_say'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['low', 'lower_middle', 'middle', 'upper_middle', 'high', 'prefer_not_to_say']),
    __metadata("design:type", String)
], DemographicDataDto.prototype, "incomeBracket", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Religious dietary requirements',
        example: ['halal'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], DemographicDataDto.prototype, "religiousDietaryRequirements", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Family structure for recommendation context',
        example: 'couple',
        enum: ['single', 'couple', 'family_with_kids', 'extended_family', 'roommates', 'other'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['single', 'couple', 'family_with_kids', 'extended_family', 'roommates', 'other']),
    __metadata("design:type", String)
], DemographicDataDto.prototype, "familyStructure", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Occupation category for dining pattern analysis',
        example: 'technology',
        enum: ['student', 'technology', 'healthcare', 'education', 'finance', 'retail', 'hospitality', 'government', 'arts', 'other', 'prefer_not_to_say'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['student', 'technology', 'healthcare', 'education', 'finance', 'retail', 'hospitality', 'government', 'arts', 'other', 'prefer_not_to_say']),
    __metadata("design:type", String)
], DemographicDataDto.prototype, "occupationCategory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Living area type',
        example: 'urban',
        enum: ['urban', 'suburban', 'rural'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['urban', 'suburban', 'rural']),
    __metadata("design:type", String)
], DemographicDataDto.prototype, "livingArea", void 0);
class UserPreferencesDto {
    defaultLocation;
    defaultPartySize;
    defaultBudget;
    defaultMode;
    defaultRadius;
    cuisinePreferences;
    dietaryRestrictions;
    notifications;
    demographicData;
}
exports.UserPreferencesDto = UserPreferencesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Default location',
        example: 'New York, NY',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserPreferencesDto.prototype, "defaultLocation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Default party size',
        example: 2,
        minimum: 1,
        maximum: 20,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], UserPreferencesDto.prototype, "defaultPartySize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Default budget preference',
        example: 'medium',
        enum: ['low', 'medium', 'high'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserPreferencesDto.prototype, "defaultBudget", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Default dining mode',
        example: 'dine_out',
        enum: ['dine_out', 'takeout', 'delivery'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserPreferencesDto.prototype, "defaultMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Default search radius in km',
        example: 10,
        minimum: 1,
        maximum: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], UserPreferencesDto.prototype, "defaultRadius", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cuisine preferences',
        example: ['italian', 'mexican', 'asian'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UserPreferencesDto.prototype, "cuisinePreferences", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Dietary restrictions',
        example: ['vegetarian', 'gluten-free'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UserPreferencesDto.prototype, "dietaryRestrictions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Notification preferences',
        type: NotificationsDto,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", NotificationsDto)
], UserPreferencesDto.prototype, "notifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Demographic information for enhanced recommendations',
        type: DemographicDataDto,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", DemographicDataDto)
], UserPreferencesDto.prototype, "demographicData", void 0);
class UpdateUserProfileDto {
    displayName;
    photoURL;
}
exports.UpdateUserProfileDto = UpdateUserProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User display name',
        example: 'John Doe',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User photo URL',
        example: 'https://example.com/photo.jpg',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "photoURL", void 0);
class UpdateUserPreferencesDto extends UserPreferencesDto {
}
exports.UpdateUserPreferencesDto = UpdateUserPreferencesDto;
class UserProfileResponseDto {
    id;
    firebaseUid;
    email;
    displayName;
    photoURL;
    provider;
    createdAt;
    updatedAt;
    lastLogin;
    preferences;
}
exports.UserProfileResponseDto = UserProfileResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID',
        example: 'clm123456789',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Firebase user ID',
        example: 'firebase-uid-123',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "firebaseUid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User email',
        example: 'user@example.com',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User display name',
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User photo URL',
        example: 'https://example.com/photo.jpg',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "photoURL", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Authentication provider',
        example: 'google',
        enum: ['google', 'apple', 'email'],
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account creation date',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], UserProfileResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last profile update',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], UserProfileResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last login date',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], UserProfileResponseDto.prototype, "lastLogin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User preferences',
        type: UserPreferencesDto,
    }),
    __metadata("design:type", UserPreferencesDto)
], UserProfileResponseDto.prototype, "preferences", void 0);
//# sourceMappingURL=user-profile.dto.js.map