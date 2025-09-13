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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const firebase_auth_guard_1 = require("./firebase-auth.guard");
const validate_token_dto_1 = require("./dto/validate-token.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async validateToken(validateTokenDto) {
        return this.authService.validateToken(validateTokenDto.idToken);
    }
    async logout(req) {
        return this.authService.logout(req.user.uid);
    }
    async refreshToken(refreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('validate-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Validate Firebase ID token',
        description: 'Validates a Firebase ID token and returns user information',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token validation result',
        type: validate_token_dto_1.ValidateTokenResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid request body',
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Too many requests',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validate_token_dto_1.ValidateTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
__decorate([
    (0, common_1.Delete)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Logout user',
        description: 'Logs out the authenticated user',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Logout successful',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Too many requests',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Refresh Firebase ID token',
        description: 'Refreshes an expired Firebase ID token using a refresh token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token refresh result',
        type: refresh_token_dto_1.RefreshTokenResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid refresh token or request body',
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Too many requests',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('api/auth'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map