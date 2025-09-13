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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../common/database/database.service");
const firebase_service_1 = require("../common/firebase/firebase.service");
let UsersService = UsersService_1 = class UsersService {
    databaseService;
    firebaseService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(databaseService, firebaseService) {
        this.databaseService = databaseService;
        this.firebaseService = firebaseService;
    }
    async getUserProfile(firebaseUid) {
        try {
            let user = await this.databaseService.user.findUnique({
                where: { firebaseUid },
            });
            if (!user) {
                this.logger.log(`User with Firebase UID ${firebaseUid} not found, creating new user`);
                user = await this.createUserFromFirebase(firebaseUid);
            }
            return this.transformUserToResponse(user);
        }
        catch (error) {
            this.logger.error(`Failed to get user profile for ${firebaseUid}:`, error);
            throw error;
        }
    }
    async updateUserProfile(firebaseUid, updateData) {
        try {
            const existingUser = await this.databaseService.user.findUnique({
                where: { firebaseUid },
            });
            if (!existingUser) {
                throw new common_1.NotFoundException(`User with Firebase UID ${firebaseUid} not found`);
            }
            const updatedUser = await this.databaseService.user.update({
                where: { firebaseUid },
                data: {
                    ...updateData,
                    updatedAt: new Date(),
                },
            });
            this.logger.log(`Updated profile for user: ${firebaseUid}`);
            return this.transformUserToResponse(updatedUser);
        }
        catch (error) {
            this.logger.error(`Failed to update user profile for ${firebaseUid}:`, error);
            throw error;
        }
    }
    async updateUserPreferences(firebaseUid, preferences) {
        try {
            const existingUser = await this.databaseService.user.findUnique({
                where: { firebaseUid },
            });
            if (!existingUser) {
                throw new common_1.NotFoundException(`User with Firebase UID ${firebaseUid} not found`);
            }
            this.validatePreferences(preferences);
            const updatedUser = await this.databaseService.user.update({
                where: { firebaseUid },
                data: {
                    preferences: preferences,
                    updatedAt: new Date(),
                },
            });
            this.logger.log(`Updated preferences for user: ${firebaseUid}`);
            return this.transformUserToResponse(updatedUser);
        }
        catch (error) {
            this.logger.error(`Failed to update user preferences for ${firebaseUid}:`, error);
            throw error;
        }
    }
    async deleteUserAccount(firebaseUid) {
        try {
            const user = await this.databaseService.user.findUnique({
                where: { firebaseUid },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with Firebase UID ${firebaseUid} not found`);
            }
            await this.databaseService.user.delete({
                where: { firebaseUid },
            });
            await this.firebaseService.deleteUser(firebaseUid);
            this.logger.log(`Deleted user account: ${firebaseUid}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to delete user account for ${firebaseUid}:`, error);
            throw error;
        }
    }
    validatePreferences(preferences) {
        if (preferences.defaultBudget) {
            const validBudgetOptions = ['low', 'medium', 'high'];
            if (!validBudgetOptions.includes(preferences.defaultBudget)) {
                throw new common_1.BadRequestException(`Invalid budget preference. Must be one of: ${validBudgetOptions.join(', ')}`);
            }
        }
        if (preferences.defaultMode) {
            const validModes = ['dine_out', 'takeout', 'delivery'];
            if (!validModes.includes(preferences.defaultMode)) {
                throw new common_1.BadRequestException(`Invalid dining mode. Must be one of: ${validModes.join(', ')}`);
            }
        }
        if (preferences.defaultPartySize !== undefined) {
            if (preferences.defaultPartySize < 1 || preferences.defaultPartySize > 20) {
                throw new common_1.BadRequestException('Default party size must be between 1 and 20');
            }
        }
        if (preferences.dietaryRestrictions) {
            const validRestrictions = [
                'vegetarian', 'vegan', 'pescatarian', 'gluten-free', 'dairy-free',
                'nut-free', 'soy-free', 'kosher', 'halal', 'low-carb', 'keto'
            ];
            const invalidRestrictions = preferences.dietaryRestrictions.filter(restriction => !validRestrictions.includes(restriction.toLowerCase()));
            if (invalidRestrictions.length > 0) {
                this.logger.warn(`Invalid dietary restrictions: ${invalidRestrictions.join(', ')}`);
            }
        }
    }
    async createUserFromFirebase(firebaseUid) {
        try {
            const firebaseUser = await this.firebaseService.getUserByUid(firebaseUid);
            if (!firebaseUser) {
                throw new common_1.NotFoundException(`Firebase user with UID ${firebaseUid} not found`);
            }
            const defaultPreferences = {
                defaultLocation: '',
                defaultPartySize: 2,
                defaultBudget: 'medium',
                defaultMode: 'dine_out',
                defaultRadius: 10,
                cuisinePreferences: [],
                dietaryRestrictions: [],
                notifications: {
                    email: true,
                    push: false,
                    trending: true,
                },
            };
            const user = await this.databaseService.user.create({
                data: {
                    firebaseUid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || null,
                    photoURL: firebaseUser.photoURL || null,
                    provider: firebaseUser.providerData?.[0]?.providerId || 'firebase',
                    preferences: defaultPreferences,
                    lastLogin: new Date(),
                },
            });
            this.logger.log(`Created new user for Firebase UID: ${firebaseUid}`);
            return user;
        }
        catch (error) {
            this.logger.error(`Failed to create user for Firebase UID ${firebaseUid}:`, error);
            throw error;
        }
    }
    transformUserToResponse(user) {
        return {
            id: user.id,
            firebaseUid: user.firebaseUid,
            email: user.email,
            displayName: user.displayName || undefined,
            photoURL: user.photoURL || undefined,
            provider: user.provider,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLogin: user.lastLogin,
            preferences: user.preferences,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        firebase_service_1.FirebaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map