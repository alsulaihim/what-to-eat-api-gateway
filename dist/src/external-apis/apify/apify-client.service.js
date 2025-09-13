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
var ApifyClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApifyClientService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const apify_client_1 = require("apify-client");
let ApifyClientService = ApifyClientService_1 = class ApifyClientService {
    configService;
    logger = new common_1.Logger(ApifyClientService_1.name);
    apifyClient;
    dailyBudgetLimit;
    config;
    constructor(configService) {
        this.configService = configService;
        const token = this.configService.get('APIFY_TOKEN') || '';
        this.dailyBudgetLimit = this.configService.get('APIFY_DAILY_BUDGET_LIMIT') || 15;
        if (!token) {
            this.logger.error('APIFY_TOKEN not configured');
        }
        this.apifyClient = new apify_client_1.ApifyClient({
            token,
        });
        this.config = {
            rate_limiting: {
                max_concurrent_actors: 3,
                delay_between_requests: 2000,
                respect_robot_txt: true,
            },
            error_handling: {
                max_retries: 2,
                timeout_per_actor: 300000,
                fallback_to_cache: true,
            },
            data_efficiency: {
                minimal_fields: true,
                compress_results: true,
                incremental_updates: true,
            },
            monitoring: {
                cost_alerts: {
                    daily_budget_limit: this.dailyBudgetLimit,
                    usage_threshold: 0.8,
                },
                performance_tracking: {
                    success_rate_threshold: 0.95,
                    average_response_time_limit: 30000,
                },
            },
        };
    }
    async runActor(actorId, input, options) {
        try {
            if (!this.configService.get('APIFY_TOKEN')) {
                throw new Error('Apify token not configured');
            }
            this.logger.log(`Starting Apify actor: ${actorId}`);
            const run = await this.apifyClient.actor(actorId).call(input, {
                timeout: options?.timeout || this.config.error_handling.timeout_per_actor,
                memory: options?.memory || 1024,
                build: options?.build || 'latest',
                waitSecs: this.config.error_handling.timeout_per_actor / 1000,
            });
            if (run.status !== 'SUCCEEDED') {
                throw new Error(`Actor run failed with status: ${run.status}`);
            }
            this.logger.log(`Apify actor completed: ${actorId} (${run.status})`);
            return {
                status: run.status,
                id: run.id,
                defaultDatasetId: run.defaultDatasetId,
                startedAt: run.startedAt,
                finishedAt: run.finishedAt,
                stats: run.stats
            };
        }
        catch (error) {
            this.logger.error(`Apify actor failed: ${actorId}`, error instanceof Error ? error.message : 'Unknown error');
            throw new Error(`Apify scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getDatasetItems(datasetId, options) {
        try {
            const dataset = this.apifyClient.dataset(datasetId);
            const result = await dataset.listItems({
                offset: options?.offset || 0,
                limit: options?.limit || 1000,
                fields: options?.fields,
                clean: options?.clean ?? true,
            });
            return result.items;
        }
        catch (error) {
            this.logger.error('Failed to fetch dataset items:', error instanceof Error ? error.message : 'Unknown error');
            throw new Error(`Dataset fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getActorRun(runId) {
        try {
            const run = await this.apifyClient.run(runId).get();
            return {
                status: run.status,
                id: run.id,
                defaultDatasetId: run.defaultDatasetId,
                startedAt: run.startedAt,
                finishedAt: run.finishedAt,
                stats: run.stats
            };
        }
        catch (error) {
            this.logger.error('Failed to get actor run:', error instanceof Error ? error.message : 'Unknown error');
            throw new Error(`Run fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async abortActorRun(runId) {
        try {
            await this.apifyClient.run(runId).abort();
            this.logger.log(`Actor run aborted: ${runId}`);
        }
        catch (error) {
            this.logger.error('Failed to abort actor run:', error instanceof Error ? error.message : 'Unknown error');
            throw new Error(`Run abort failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    generateLocationHashtags(location, categories) {
        const baseHashtags = ['#foodie', '#restaurant', '#delicious', '#yummy'];
        const locationHashtags = [
            `#${location.toLowerCase().replace(/\s+/g, '')}food`,
            `#${location.toLowerCase().replace(/\s+/g, '')}eats`,
        ];
        const categoryHashtags = categories.map(cat => `#${cat.toLowerCase()}`);
        return [...baseHashtags, ...locationHashtags, ...categoryHashtags];
    }
    generateFoodKeywords(location) {
        const baseKeywords = [
            'restaurant', 'food', 'dining', 'cuisine', 'delicious',
            'yummy', 'tasty', 'meal', 'eat', 'cooking'
        ];
        const locationKeywords = [
            `${location} restaurant`,
            `${location} food`,
            `${location} dining`,
            `${location} eats`,
        ];
        return [...baseKeywords, ...locationKeywords];
    }
    async estimateCost(actorId, inputSize) {
        const costMap = {
            'apify/instagram-scraper': 2.5,
            'apify/twitter-scraper': 1.8,
            'apify/reddit-scraper': 1.2,
            'apify/tiktok-scraper': 3.5,
            'apify/youtube-scraper': 4.0,
            'apify/facebook-pages-scraper': 2.0,
        };
        const baseUnits = costMap[actorId] || 2.0;
        const estimated_units = baseUnits * Math.max(1, inputSize / 100);
        const estimated_cost_usd = estimated_units * 0.025;
        const fits_daily_budget = estimated_cost_usd <= this.dailyBudgetLimit * 0.2;
        return {
            estimated_units,
            estimated_cost_usd,
            fits_daily_budget,
        };
    }
    async getUsageMetrics() {
        try {
            return {
                current_usage: 0,
                daily_limit: this.dailyBudgetLimit,
                remaining_budget: this.dailyBudgetLimit,
                success_rate: 0.95,
                average_response_time: 25000,
            };
        }
        catch (error) {
            this.logger.error('Failed to get usage metrics:', error instanceof Error ? error.message : 'Unknown error');
            return {
                current_usage: 0,
                daily_limit: this.dailyBudgetLimit,
                remaining_budget: this.dailyBudgetLimit,
                success_rate: 0,
                average_response_time: 0,
            };
        }
    }
    getConfig() {
        return this.config;
    }
};
exports.ApifyClientService = ApifyClientService;
exports.ApifyClientService = ApifyClientService = ApifyClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ApifyClientService);
//# sourceMappingURL=apify-client.service.js.map