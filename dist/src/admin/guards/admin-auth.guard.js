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
exports.AdminAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../common/firebase/firebase.service");
const database_service_1 = require("../../common/database/database.service");
let AdminAuthGuard = class AdminAuthGuard {
    firebaseService;
    databaseService;
    constructor(firebaseService, databaseService) {
        this.firebaseService = firebaseService;
        this.databaseService = databaseService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new common_1.UnauthorizedException('Missing or invalid authorization header');
            }
            const token = authHeader.substring(7);
            const decodedToken = await this.firebaseService.verifyIdToken(token);
            const firebaseUid = decodedToken.uid;
            const user = await this.databaseService.user.findUnique({
                where: { firebaseUid },
                select: {
                    id: true,
                    firebaseUid: true,
                    email: true,
                    displayName: true,
                },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const isAdmin = await this.checkAdminPrivileges(user.email, firebaseUid);
            if (!isAdmin) {
                throw new common_1.ForbiddenException('Admin privileges required');
            }
            request.user = {
                ...user,
                isAdmin: true,
            };
            return true;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Token validation failed');
        }
    }
    async checkAdminPrivileges(email, firebaseUid) {
        try {
            try {
                const userRecord = await this.firebaseService.getUserByUid(firebaseUid);
                const customClaims = userRecord.customClaims;
                if (customClaims && customClaims.admin === true) {
                    return true;
                }
            }
            catch (error) {
            }
            const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
            if (adminEmails.includes(email)) {
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error checking admin privileges:', error);
            return false;
        }
    }
};
exports.AdminAuthGuard = AdminAuthGuard;
exports.AdminAuthGuard = AdminAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        database_service_1.DatabaseService])
], AdminAuthGuard);
//# sourceMappingURL=admin-auth.guard.js.map