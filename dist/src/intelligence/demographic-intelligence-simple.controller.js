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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemographicIntelligenceSimpleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const demographic_intelligence_simple_service_1 = require("./demographic-intelligence-simple.service");
class DemographicDataDto {
    nationality;
    ageGroup;
    culturalBackground;
    spiceToleranceLevel;
    authenticityPreference;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'US', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DemographicDataDto.prototype, "nationality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '25-34', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DemographicDataDto.prototype, "ageGroup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'asian', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DemographicDataDto.prototype, "culturalBackground", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DemographicDataDto.prototype, "spiceToleranceLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DemographicDataDto.prototype, "authenticityPreference", void 0);
class DemographicIntelligenceRequestDto {
    userDemographics;
    targetLocation;
}
__decorate([
    (0, swagger_1.ApiProperty)({ type: DemographicDataDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DemographicDataDto),
    __metadata("design:type", DemographicDataDto)
], DemographicIntelligenceRequestDto.prototype, "userDemographics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'San Francisco' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DemographicIntelligenceRequestDto.prototype, "targetLocation", void 0);
let DemographicIntelligenceSimpleController = class DemographicIntelligenceSimpleController {
    demographicIntelligenceService;
    constructor(demographicIntelligenceService) {
        this.demographicIntelligenceService = demographicIntelligenceService;
    }
    async analyzeDemographics(request) {
        return this.demographicIntelligenceService.getDemographicIntelligence(request);
    }
};
exports.DemographicIntelligenceSimpleController = DemographicIntelligenceSimpleController;
__decorate([
    (0, common_1.Post)('analyze'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate demographic intelligence analysis',
        description: 'Analyze user demographics to generate personalized food recommendations and insights'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Demographic intelligence analysis completed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request parameters' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DemographicIntelligenceRequestDto]),
    __metadata("design:returntype", Promise)
], DemographicIntelligenceSimpleController.prototype, "analyzeDemographics", null);
exports.DemographicIntelligenceSimpleController = DemographicIntelligenceSimpleController = __decorate([
    (0, swagger_1.ApiTags)('Intelligence - Demographics'),
    (0, common_1.Controller)('api/intelligence/demographics'),
    __metadata("design:paramtypes", [demographic_intelligence_simple_service_1.DemographicIntelligenceSimpleService])
], DemographicIntelligenceSimpleController);
//# sourceMappingURL=demographic-intelligence-simple.controller.js.map