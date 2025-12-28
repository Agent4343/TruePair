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
exports.BlockUserDto = exports.ScheduleDateDto = exports.ReportUserDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ReportUserDto {
}
exports.ReportUserDto = ReportUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user-id-here' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReportUserDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FAKE_PROFILE', 'SCAM', 'THREATS', 'OTHER'],
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReportUserDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Description of the issue...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReportUserDto.prototype, "description", void 0);
class ScheduleDateDto {
}
exports.ScheduleDateDto = ScheduleDateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'match-id-here' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDateDto.prototype, "matchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T19:00:00Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ScheduleDateDto.prototype, "dateTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Coffee Shop on Main St' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDateDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ScheduleDateDto.prototype, "isPublicPlace", void 0);
class BlockUserDto {
}
exports.BlockUserDto = BlockUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user-id-here' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BlockUserDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Reason for blocking' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BlockUserDto.prototype, "reason", void 0);
//# sourceMappingURL=safety.dto.js.map