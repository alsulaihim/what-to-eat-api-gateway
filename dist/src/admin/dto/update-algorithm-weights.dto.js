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
exports.UpdateAlgorithmWeightsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateAlgorithmWeightsDto {
    socialWeight;
    personalWeight;
    contextualWeight;
    trendsWeight;
    updatedBy;
}
exports.UpdateAlgorithmWeightsDto = UpdateAlgorithmWeightsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Weight for social signals (0.0 to 1.0)',
        example: 0.4,
        minimum: 0,
        maximum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], UpdateAlgorithmWeightsDto.prototype, "socialWeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Weight for personal preferences (0.0 to 1.0)',
        example: 0.35,
        minimum: 0,
        maximum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], UpdateAlgorithmWeightsDto.prototype, "personalWeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Weight for contextual factors (0.0 to 1.0)',
        example: 0.15,
        minimum: 0,
        maximum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], UpdateAlgorithmWeightsDto.prototype, "contextualWeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Weight for trending factors (0.0 to 1.0)',
        example: 0.1,
        minimum: 0,
        maximum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], UpdateAlgorithmWeightsDto.prototype, "trendsWeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Admin user ID making the update',
        example: 'admin-user-123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAlgorithmWeightsDto.prototype, "updatedBy", void 0);
//# sourceMappingURL=update-algorithm-weights.dto.js.map