"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const recommendations_controller_1 = require("./recommendations.controller");
const recommendations_service_1 = require("./recommendations.service");
const places_service_1 = require("../external-apis/google/places.service");
const maps_service_1 = require("../external-apis/google/maps.service");
const trends_service_1 = require("../external-apis/google/trends.service");
const chatgpt_service_1 = require("../external-apis/openai/chatgpt.service");
const database_module_1 = require("../common/database/database.module");
let RecommendationsModule = class RecommendationsModule {
};
exports.RecommendationsModule = RecommendationsModule;
exports.RecommendationsModule = RecommendationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            database_module_1.DatabaseModule,
            axios_1.HttpModule.register({
                timeout: 10000,
                maxRedirects: 5,
            }),
        ],
        controllers: [recommendations_controller_1.RecommendationsController, recommendations_controller_1.TestRecommendationsController],
        providers: [
            recommendations_service_1.RecommendationsService,
            places_service_1.GooglePlacesService,
            maps_service_1.MapsService,
            trends_service_1.TrendsService,
            chatgpt_service_1.ChatGPTService,
        ],
        exports: [recommendations_service_1.RecommendationsService],
    })
], RecommendationsModule);
//# sourceMappingURL=recommendations.module.js.map