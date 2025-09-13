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
var TestIntelligenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
let TestIntelligenceService = TestIntelligenceService_1 = class TestIntelligenceService {
    logger = new common_1.Logger(TestIntelligenceService_1.name);
    constructor() { }
    async testMethod() {
        return 'Test service working';
    }
};
exports.TestIntelligenceService = TestIntelligenceService;
exports.TestIntelligenceService = TestIntelligenceService = TestIntelligenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TestIntelligenceService);
//# sourceMappingURL=test-intelligence.service.js.map