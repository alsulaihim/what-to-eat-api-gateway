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
exports.UserProfileResponseDto = exports.UpdateUserPreferencesDto = exports.UpdateUserProfileDto = exports.UserPreferencesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UserPreferencesDto {
    dietaryRestrictions;
    cuisinePreferences;
    budgetRange;
    defaultPartySize;
}
exports.UserPreferencesDto = UserPreferencesDto;
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
        description: 'Budget range',
        example: 'moderate',
        enum: ['budget', 'moderate', 'upscale', 'fine-dining'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserPreferencesDto.prototype, "budgetRange", void 0);
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