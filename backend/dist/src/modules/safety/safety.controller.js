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
exports.SafetyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const safety_service_1 = require("./safety.service");
const safety_dto_1 = require("./dto/safety.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SafetyController = class SafetyController {
    constructor(safetyService) {
        this.safetyService = safetyService;
    }
    async reportUser(req, dto) {
        return this.safetyService.reportUser(req.user.userId, dto.userId, dto.type, dto.description);
    }
    async getSafetySignals(userId) {
        return this.safetyService.getSafetySignals(userId);
    }
    async getPreDateCheck(req, matchId) {
        return this.safetyService.getPreDateSafetyCheck(req.user.userId, matchId);
    }
    async scheduleDate(req, dto) {
        return this.safetyService.scheduleDate(req.user.userId, dto.matchId, new Date(dto.dateTime), dto.location, dto.isPublicPlace);
    }
    async blockUser(req, dto) {
        return this.safetyService.blockUser(req.user.userId, dto.userId, dto.reason);
    }
};
exports.SafetyController = SafetyController;
__decorate([
    (0, common_1.Post)('report'),
    (0, swagger_1.ApiOperation)({ summary: 'Report a user' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, safety_dto_1.ReportUserDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "reportUser", null);
__decorate([
    (0, common_1.Get)('signals/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get safety signals for a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getSafetySignals", null);
__decorate([
    (0, common_1.Get)('pre-date/:matchId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pre-date safety check' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getPreDateCheck", null);
__decorate([
    (0, common_1.Post)('dates'),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule a date' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, safety_dto_1.ScheduleDateDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "scheduleDate", null);
__decorate([
    (0, common_1.Post)('block'),
    (0, swagger_1.ApiOperation)({ summary: 'Block a user' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, safety_dto_1.BlockUserDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "blockUser", null);
exports.SafetyController = SafetyController = __decorate([
    (0, swagger_1.ApiTags)('Safety'),
    (0, common_1.Controller)('api/safety'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [safety_service_1.SafetyService])
], SafetyController);
//# sourceMappingURL=safety.controller.js.map