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
var FirebaseAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../common/firebase/firebase.service");
let FirebaseAuthGuard = FirebaseAuthGuard_1 = class FirebaseAuthGuard {
    firebaseService;
    logger = new common_1.Logger(FirebaseAuthGuard_1.name);
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            this.logger.warn('Missing or invalid Authorization header');
            throw new common_1.UnauthorizedException('Missing or invalid Authorization header');
        }
        const idToken = authHeader.split('Bearer ')[1];
        if (!idToken) {
            this.logger.warn('Missing Firebase ID token');
            throw new common_1.UnauthorizedException('Missing Firebase ID token');
        }
        try {
            const decodedToken = await this.firebaseService.verifyIdToken(idToken);
            request.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                displayName: decodedToken.name,
                photoURL: decodedToken.picture,
            };
            this.logger.debug(`Authenticated user: ${decodedToken.uid}`);
            return true;
        }
        catch (error) {
            this.logger.error('Token verification failed:', error);
            throw new common_1.UnauthorizedException('Invalid Firebase token');
        }
    }
};
exports.FirebaseAuthGuard = FirebaseAuthGuard;
exports.FirebaseAuthGuard = FirebaseAuthGuard = FirebaseAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirebaseAuthGuard);
//# sourceMappingURL=firebase-auth.guard.js.map