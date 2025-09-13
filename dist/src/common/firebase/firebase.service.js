"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = __importStar(require("firebase-admin"));
let FirebaseService = FirebaseService_1 = class FirebaseService {
    configService;
    logger = new common_1.Logger(FirebaseService_1.name);
    app;
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        await this.initializeFirebase();
    }
    async initializeFirebase() {
        try {
            const projectId = this.configService.get('FIREBASE_PROJECT_ID');
            const rawPrivateKey = this.configService.get('FIREBASE_PRIVATE_KEY');
            const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');
            if (!projectId || !rawPrivateKey || !clientEmail) {
                this.logger.warn('Firebase configuration incomplete - running in development mode');
                this.logger.warn('Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL');
                return;
            }
            let privateKey = rawPrivateKey;
            privateKey = privateKey.replace(/\\n/g, '\n');
            privateKey = privateKey.replace(/\\\n/g, '\n');
            if (!privateKey.includes('\n')) {
                privateKey = privateKey
                    .replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n')
                    .replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----')
                    .replace(/(.{64})/g, '$1\n')
                    .replace(/\n\n/g, '\n');
            }
            this.logger.debug('Attempting Firebase initialization...');
            this.app = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    privateKey,
                    clientEmail,
                }),
                projectId,
            });
            this.logger.log(`Firebase initialized successfully for project: ${projectId}`);
        }
        catch (error) {
            this.logger.error('Failed to initialize Firebase:', error);
            this.logger.error('This will affect authentication functionality');
            if (this.configService.get('NODE_ENV') === 'production') {
                throw error;
            }
        }
    }
    async verifyIdToken(idToken) {
        try {
            if (!this.app) {
                throw new Error('Firebase app not initialized');
            }
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            this.logger.debug(`Token verified for user: ${decodedToken.uid}`);
            return decodedToken;
        }
        catch (error) {
            this.logger.error('Token verification failed:', error);
            throw error;
        }
    }
    async getUserByUid(uid) {
        try {
            if (!this.app) {
                throw new Error('Firebase app not initialized');
            }
            const userRecord = await admin.auth().getUser(uid);
            return userRecord;
        }
        catch (error) {
            this.logger.error(`Failed to get user ${uid}:`, error);
            throw error;
        }
    }
    async deleteUser(uid) {
        try {
            if (!this.app) {
                throw new Error('Firebase app not initialized');
            }
            await admin.auth().deleteUser(uid);
            this.logger.log(`User ${uid} deleted from Firebase`);
        }
        catch (error) {
            this.logger.error(`Failed to delete user ${uid}:`, error);
            throw error;
        }
    }
    getApp() {
        if (!this.app) {
            throw new Error('Firebase app not initialized');
        }
        return this.app;
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map