"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligenceModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const test_intelligence_service_1 = require("./test-intelligence.service");
const demographic_intelligence_simple_service_1 = require("./demographic-intelligence-simple.service");
const demographic_intelligence_simple_controller_1 = require("./demographic-intelligence-simple.controller");
const external_weather_simple_service_1 = require("./external-weather-simple.service");
const external_news_simple_service_1 = require("./external-news-simple.service");
const external_events_simple_service_1 = require("./external-events-simple.service");
const database_module_1 = require("../common/database/database.module");
const firebase_module_1 = require("../common/firebase/firebase.module");
const apify_module_1 = require("../apify/apify.module");
let IntelligenceModule = class IntelligenceModule {
};
exports.IntelligenceModule = IntelligenceModule;
exports.IntelligenceModule = IntelligenceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 30000,
                maxRedirects: 3,
            }),
            config_1.ConfigModule,
            database_module_1.DatabaseModule,
            firebase_module_1.FirebaseModule,
            apify_module_1.ApifyModule,
        ],
        controllers: [demographic_intelligence_simple_controller_1.DemographicIntelligenceSimpleController],
        providers: [
            test_intelligence_service_1.TestIntelligenceService,
            demographic_intelligence_simple_service_1.DemographicIntelligenceSimpleService,
            external_weather_simple_service_1.ExternalWeatherSimpleService,
            external_news_simple_service_1.ExternalNewsSimpleService,
            external_events_simple_service_1.ExternalEventsSimpleService,
        ],
        exports: [
            test_intelligence_service_1.TestIntelligenceService,
            demographic_intelligence_simple_service_1.DemographicIntelligenceSimpleService,
            external_weather_simple_service_1.ExternalWeatherSimpleService,
            external_news_simple_service_1.ExternalNewsSimpleService,
            external_events_simple_service_1.ExternalEventsSimpleService,
        ],
    })
], IntelligenceModule);
//# sourceMappingURL=intelligence.module.js.map