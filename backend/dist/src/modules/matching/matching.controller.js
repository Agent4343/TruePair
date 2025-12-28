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
exports.MatchingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const matching_service_1 = require("./matching.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let MatchingController = class MatchingController {
    constructor(matchingService) {
        this.matchingService = matchingService;
    }
    async discover(req, limit) {
        return this.matchingService.getDiscoveryProfiles(req.user.userId, limit || 10);
    }
    async like(req, userId) {
        return this.matchingService.like(req.user.userId, userId);
    }
    async pass(req, userId) {
        return this.matchingService.pass(req.user.userId, userId);
    }
    async getMatches(req) {
        return this.matchingService.getMatches(req.user.userId);
    }
    async getMatch(req, matchId) {
        return this.matchingService.getMatch(req.user.userId, matchId);
    }
};
exports.MatchingController = MatchingController;
__decorate([
    (0, common_1.Get)('discover'),
    (0, swagger_1.ApiOperation)({ summary: 'Get discovery profiles' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], MatchingController.prototype, "discover", null);
__decorate([
    (0, common_1.Post)('like/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Like a user' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MatchingController.prototype, "like", null);
__decorate([
    (0, common_1.Post)('pass/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Pass on a user' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MatchingController.prototype, "pass", null);
__decorate([
    (0, common_1.Get)('matches'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all matches' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MatchingController.prototype, "getMatches", null);
__decorate([
    (0, common_1.Get)('matches/:matchId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get match details' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MatchingController.prototype, "getMatch", null);
exports.MatchingController = MatchingController = __decorate([
    (0, swagger_1.ApiTags)('Matching'),
    (0, common_1.Controller)('api/matching'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [matching_service_1.MatchingService])
], MatchingController);
//# sourceMappingURL=matching.controller.js.map