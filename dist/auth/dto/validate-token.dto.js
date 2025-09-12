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
exports.ValidateTokenResponseDto = exports.ValidateTokenDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ValidateTokenDto {
    idToken;
}
exports.ValidateTokenDto = ValidateTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Firebase ID token',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ValidateTokenDto.prototype, "idToken", void 0);
class ValidateTokenResponseDto {
    valid;
    user;
}
exports.ValidateTokenResponseDto = ValidateTokenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the token is valid',
        example: true,
    }),
    __metadata("design:type", Boolean)
], ValidateTokenResponseDto.prototype, "valid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User information from the token',
        example: {
            uid: 'firebase-user-id',
            email: 'user@example.com',
            displayName: 'John Doe',
            photoURL: 'https://example.com/photo.jpg',
            provider: 'google',
        },
    }),
    __metadata("design:type", Object)
], ValidateTokenResponseDto.prototype, "user", void 0);
//# sourceMappingURL=validate-token.dto.js.map