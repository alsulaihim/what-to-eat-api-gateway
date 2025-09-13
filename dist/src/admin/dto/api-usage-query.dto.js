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
exports.ApiUsageQueryDto = exports.ApiUsageTimeRange = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var ApiUsageTimeRange;
(function (ApiUsageTimeRange) {
    ApiUsageTimeRange["HOUR"] = "hour";
    ApiUsageTimeRange["DAY"] = "day";
    ApiUsageTimeRange["WEEK"] = "week";
    ApiUsageTimeRange["MONTH"] = "month";
    ApiUsageTimeRange["YEAR"] = "year";
})(ApiUsageTimeRange || (exports.ApiUsageTimeRange = ApiUsageTimeRange = {}));
class ApiUsageQueryDto {
    apiName;
    startDate;
    endDate;
    timeRange;
    page = 1;
    limit = 50;
}
exports.ApiUsageQueryDto = ApiUsageQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by specific API name',
        example: 'google_places',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApiUsageQueryDto.prototype, "apiName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start date for the query range (ISO string)',
        example: '2025-01-01T00:00:00.000Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ApiUsageQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End date for the query range (ISO string)',
        example: '2025-01-31T23:59:59.999Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ApiUsageQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Time range for aggregation',
        enum: ApiUsageTimeRange,
        example: ApiUsageTimeRange.DAY,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ApiUsageTimeRange),
    __metadata("design:type", String)
], ApiUsageQueryDto.prototype, "timeRange", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ApiUsageQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 50,
        minimum: 1,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ApiUsageQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=api-usage-query.dto.js.map