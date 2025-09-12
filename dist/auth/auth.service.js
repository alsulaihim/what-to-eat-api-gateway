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
let AuthService = AuthService_1 = class AuthService {
    firebaseService;
    databaseService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(firebaseService, databaseService) {
        this.firebaseService = firebaseService;
        this.databaseService = databaseService;
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
        database_service_1.DatabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map