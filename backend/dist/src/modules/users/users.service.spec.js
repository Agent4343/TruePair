"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const users_service_1 = require("./users.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
describe('UsersService', () => {
    let service;
    let prismaService;
    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        profile: {
            deleteMany: jest.fn(),
        },
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [users_service_1.UsersService, { provide: prisma_service_1.PrismaService, useValue: mockPrismaService }],
        }).compile();
        service = module.get(users_service_1.UsersService);
        prismaService = module.get(prisma_service_1.PrismaService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('findById', () => {
        it('should return user with profile', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                status: 'ACTIVE',
                onboardingCompleted: true,
                emailVerified: true,
                phoneVerified: false,
                lastActiveAt: new Date(),
                createdAt: new Date(),
                profile: {
                    id: 'p1',
                    firstName: 'Test',
                    displayName: 'Test User',
                    bio: 'Test bio',
                    city: 'San Francisco',
                    state: 'CA',
                    profileStrengthScore: 75,
                },
            };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            const result = await service.findById('1');
            expect(result).toEqual(mockUser);
            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                select: expect.any(Object),
            });
        });
        it('should throw NotFoundException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            await expect(service.findById('nonexistent')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const userId = '1';
            const dto = { currentPassword: 'OldPassword123!', newPassword: 'NewPassword456!' };
            const hashedPassword = await bcrypt.hash(dto.currentPassword, 12);
            const mockUser = {
                id: userId,
                email: 'test@example.com',
                passwordHash: hashedPassword,
            };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.update.mockResolvedValue(mockUser);
            const result = await service.changePassword(userId, dto);
            expect(result.message).toBe('Password changed successfully');
        });
        it('should throw BadRequestException for incorrect current password', async () => {
            const userId = '1';
            const dto = { currentPassword: 'WrongPassword!', newPassword: 'NewPassword456!' };
            const hashedPassword = await bcrypt.hash('CorrectPassword!', 12);
            const mockUser = {
                id: userId,
                email: 'test@example.com',
                passwordHash: hashedPassword,
            };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            await expect(service.changePassword(userId, dto)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('deactivate', () => {
        it('should deactivate user account', async () => {
            const mockUser = { id: '1', email: 'test@example.com', status: 'ACTIVE' };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.update.mockResolvedValue({ ...mockUser, status: 'DEACTIVATED' });
            const result = await service.deactivate('1');
            expect(result.message).toBe('Account deactivated successfully');
            expect(mockPrismaService.user.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { status: 'DEACTIVATED' },
            });
        });
    });
    describe('reactivate', () => {
        it('should reactivate deactivated account', async () => {
            const mockUser = { id: '1', email: 'test@example.com', status: 'DEACTIVATED' };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.update.mockResolvedValue({ ...mockUser, status: 'ACTIVE' });
            const result = await service.reactivate('1');
            expect(result.message).toBe('Account reactivated successfully');
        });
        it('should throw BadRequestException for banned account', async () => {
            const mockUser = { id: '1', email: 'test@example.com', status: 'BANNED' };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            await expect(service.reactivate('1')).rejects.toThrow(common_1.BadRequestException);
        });
    });
});
//# sourceMappingURL=users.service.spec.js.map