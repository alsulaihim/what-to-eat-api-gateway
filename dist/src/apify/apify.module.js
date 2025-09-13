"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApifyModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const apify_controller_1 = require("./apify.controller");
const apify_service_1 = require("./apify.service");
const apify_client_service_1 = require("../external-apis/apify/apify-client.service");
const instagram_scraper_service_1 = require("../external-apis/apify/instagram-scraper.service");
const twitter_scraper_service_1 = require("../external-apis/apify/twitter-scraper.service");
const reddit_scraper_service_1 = require("../external-apis/apify/reddit-scraper.service");
const tiktok_scraper_service_1 = require("../external-apis/apify/tiktok-scraper.service");
const youtube_scraper_service_1 = require("../external-apis/apify/youtube-scraper.service");
const facebook_scraper_service_1 = require("../external-apis/apify/facebook-scraper.service");
let ApifyModule = class ApifyModule {
};
exports.ApifyModule = ApifyModule;
exports.ApifyModule = ApifyModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule, config_1.ConfigModule],
        controllers: [apify_controller_1.ApifyController],
        providers: [
            apify_service_1.ApifyService,
            apify_client_service_1.ApifyClientService,
            instagram_scraper_service_1.InstagramScraperService,
            twitter_scraper_service_1.TwitterScraperService,
            reddit_scraper_service_1.RedditScraperService,
            tiktok_scraper_service_1.TikTokScraperService,
            youtube_scraper_service_1.YouTubeScraperService,
            facebook_scraper_service_1.FacebookScraperService,
        ],
        exports: [
            apify_service_1.ApifyService,
            apify_client_service_1.ApifyClientService,
            instagram_scraper_service_1.InstagramScraperService,
            twitter_scraper_service_1.TwitterScraperService,
            reddit_scraper_service_1.RedditScraperService,
            tiktok_scraper_service_1.TikTokScraperService,
            youtube_scraper_service_1.YouTubeScraperService,
            facebook_scraper_service_1.FacebookScraperService,
        ],
    })
], ApifyModule);
//# sourceMappingURL=apify.module.js.map