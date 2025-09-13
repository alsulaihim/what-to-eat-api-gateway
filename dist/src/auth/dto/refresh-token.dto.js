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
exports.RefreshTokenResponseDto = exports.RefreshTokenDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RefreshTokenDto {
    refreshToken = '';
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Firebase refresh token',
        example: 'AEu4IL1234...',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class RefreshTokenResponseDto {
    success = false;
    idToken;
    refreshToken;
    expiresIn;
    error;
}
exports.RefreshTokenResponseDto = RefreshTokenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the token refresh was successful',
        example: true,
    }),
    __metadata("design:type", Boolean)
], RefreshTokenResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New Firebase ID token',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
    }),
    __metadata("design:type", String)
], RefreshTokenResponseDto.prototype, "idToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New refresh token',
        example: 'AEu4IL1234...',
    }),
    __metadata("design:type", String)
], RefreshTokenResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Token expiration time in seconds',
        example: 3600,
    }),
    __metadata("design:type", String)
], RefreshTokenResponseDto.prototype, "expiresIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Error message if refresh failed',
        example: 'Invalid refresh token',
    }),
    __metadata("design:type", String)
], RefreshTokenResponseDto.prototype, "error", void 0);
//# sourceMappingURL=refresh-token.dto.js.map