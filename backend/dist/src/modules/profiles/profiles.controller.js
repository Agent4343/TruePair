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
exports.ProfilesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const profiles_service_1 = require("./profiles.service");
const profiles_dto_1 = require("./dto/profiles.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ProfilesController = class ProfilesController {
    constructor(profilesService) {
        this.profilesService = profilesService;
    }
    async create(req, dto) {
        return this.profilesService.create(req.user.userId, dto);
    }
    async getProfile(req) {
        return this.profilesService.findByUserId(req.user.userId);
    }
    async update(req, dto) {
        return this.profilesService.update(req.user.userId, dto);
    }
    async getScore(req) {
        return this.profilesService.getProfileStrength(req.user.userId);
    }
    async addPhoto(req, dto) {
        return this.profilesService.addPhoto(req.user.userId, dto.url, dto.isMain);
    }
    async deletePhoto(req, photoId) {
        return this.profilesService.deletePhoto(req.user.userId, photoId);
    }
    async addPrompt(req, dto) {
        return this.profilesService.addPrompt(req.user.userId, dto.question, dto.answer);
    }
};
exports.ProfilesController = ProfilesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create profile' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, profiles_dto_1.CreateProfileDto]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get own profile' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update profile' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, profiles_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('score'),
    (0, swagger_1.ApiOperation)({ summary: 'Get profile strength score' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "getScore", null);
__decorate([
    (0, common_1.Post)('photos'),
    (0, swagger_1.ApiOperation)({ summary: 'Add photo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, profiles_dto_1.AddPhotoDto]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "addPhoto", null);
__decorate([
    (0, common_1.Delete)('photos/:photoId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete photo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('photoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "deletePhoto", null);
__decorate([
    (0, common_1.Post)('prompts'),
    (0, swagger_1.ApiOperation)({ summary: 'Add prompt' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, profiles_dto_1.AddPromptDto]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "addPrompt", null);
exports.ProfilesController = ProfilesController = __decorate([
    (0, swagger_1.ApiTags)('Profiles'),
    (0, common_1.Controller)('api/profiles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [profiles_service_1.ProfilesService])
], ProfilesController);
//# sourceMappingURL=profiles.controller.js.map