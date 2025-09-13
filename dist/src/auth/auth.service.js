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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../common/firebase/firebase.service");
const database_service_1 = require("../common/database/database.service");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let AuthService = AuthService_1 = class AuthService {
    firebaseService;
    databaseService;
    httpService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(firebaseService, databaseService, httpService, configService) {
        this.firebaseService = firebaseService;
        this.databaseService = databaseService;
        this.httpService = httpService;
        this.configService = configService;
    }
    async validateToken(idToken) {
        try {
            const decodedToken = await this.firebaseService.verifyIdToken(idToken);
            await this.syncUserWithDatabase(decodedToken);
            return {
                valid: true,
                user: {
                    uid: decodedToken.uid,
                    email: decodedToken.email,
                    displayName: decodedToken.name,
                    photoURL: decodedToken.picture,
                    provider: this.getProviderFromToken(decodedToken),
                },
            };
        }
        catch (error) {
            this.logger.error('Token validation failed:', error);
            return {
                valid: false,
                user: {
                    uid: '',
                    email: undefined,
                    displayName: undefined,
                    photoURL: undefined,
                    provider: undefined,
                },
            };
        }
    }
    async syncUserWithDatabase(decodedToken) {
        try {
            const existingUser = await this.databaseService.user.findUnique({
                where: { firebaseUid: decodedToken.uid },
            });
            if (existingUser) {
                const updatedUser = await this.databaseService.user.update({
                    where: { firebaseUid: decodedToken.uid },
                    data: {
                        lastLogin: new Date(),
                        displayName: decodedToken.name,
                        photoURL: decodedToken.picture,
                    },
                });
                this.logger.debug(`Updated existing user: ${decodedToken.uid}`);
                return updatedUser;
            }
            else {
                const newUser = await this.databaseService.user.create({
                    data: {
                        firebaseUid: decodedToken.uid,
                        email: decodedToken.email || '',
                        displayName: decodedToken.name,
                        photoURL: decodedToken.picture,
                        provider: this.getProviderFromToken(decodedToken),
                        lastLogin: new Date(),
                    },
                });
                this.logger.log(`Created new user: ${decodedToken.uid}`);
                return newUser;
            }
        }
        catch (error) {
            this.logger.error('Failed to sync user with database:', error);
            throw error;
        }
    }
    async logout(uid) {
        try {
            this.logger.log(`User ${uid} logged out`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Logout failed for user ${uid}:`, error);
            return { success: false };
        }
    }
    async refreshToken(refreshToken) {
        try {
            const apiKey = this.configService.get('FIREBASE_WEB_API_KEY');
            if (!apiKey) {
                throw new common_1.BadRequestException('Firebase Web API key not configured');
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            }));
            const data = response.data;
            await this.firebaseService.verifyIdToken(data.id_token);
            this.logger.log('Token refresh successful');
            return {
                success: true,
                idToken: data.id_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in,
            };
        }
        catch (error) {
            this.logger.error('Token refresh failed:', error);
            let errorMessage = 'Token refresh failed';
            if (error instanceof Error && error.message) {
                errorMessage = error.message;
            }
            else if (typeof error === 'object' && error && 'response' in error) {
                const axiosError = error;
                if (axiosError.response?.data?.error?.message) {
                    errorMessage = axiosError.response.data.error.message;
                }
            }
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
    getProviderFromToken(decodedToken) {
        const providerId = decodedToken.firebase?.sign_in_provider;
        switch (providerId) {
            case 'google.com':
                return 'google';
            case 'apple.com':
                return 'apple';
            case 'password':
                return 'email';
            default:
                return 'unknown';
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        database_service_1.DatabaseService,
        axios_1.HttpService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map