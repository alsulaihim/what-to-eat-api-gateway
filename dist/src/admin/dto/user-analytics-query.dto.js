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
exports.UserAnalyticsQueryDto = exports.AnalyticsTimeRange = exports.UserAnalyticsMetric = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var UserAnalyticsMetric;
(function (UserAnalyticsMetric) {
    UserAnalyticsMetric["ACTIVE_USERS"] = "active_users";
    UserAnalyticsMetric["NEW_REGISTRATIONS"] = "new_registrations";
    UserAnalyticsMetric["RECOMMENDATION_REQUESTS"] = "recommendation_requests";
    UserAnalyticsMetric["USER_RETENTION"] = "user_retention";
    UserAnalyticsMetric["CONVERSION_RATES"] = "conversion_rates";
})(UserAnalyticsMetric || (exports.UserAnalyticsMetric = UserAnalyticsMetric = {}));
var AnalyticsTimeRange;
(function (AnalyticsTimeRange) {
    AnalyticsTimeRange["HOUR"] = "hour";
    AnalyticsTimeRange["DAY"] = "day";
    AnalyticsTimeRange["WEEK"] = "week";
    AnalyticsTimeRange["MONTH"] = "month";
    AnalyticsTimeRange["YEAR"] = "year";
})(AnalyticsTimeRange || (exports.AnalyticsTimeRange = AnalyticsTimeRange = {}));
class UserAnalyticsQueryDto {
    metric;
    startDate;
    endDate;
    timeRange;
    page = 1;
    limit = 50;
}
exports.UserAnalyticsQueryDto = UserAnalyticsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Specific metric to analyze',
        enum: UserAnalyticsMetric,
        example: UserAnalyticsMetric.ACTIVE_USERS,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(UserAnalyticsMetric),
    __metadata("design:type", String)
], UserAnalyticsQueryDto.prototype, "metric", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start date for analytics range (ISO string)',
        example: '2025-01-01T00:00:00.000Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UserAnalyticsQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End date for analytics range (ISO string)',
        example: '2025-01-31T23:59:59.999Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UserAnalyticsQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Time range for data aggregation',
        enum: AnalyticsTimeRange,
        example: AnalyticsTimeRange.DAY,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(AnalyticsTimeRange),
    __metadata("design:type", String)
], UserAnalyticsQueryDto.prototype, "timeRange", void 0);
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
], UserAnalyticsQueryDto.prototype, "page", void 0);
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
], UserAnalyticsQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=user-analytics-query.dto.js.map