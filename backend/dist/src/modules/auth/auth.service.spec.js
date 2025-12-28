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
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("./auth.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
describe('AuthService', () => {
    let service;
    let prismaService;
    let jwtService;
    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    };
    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock-token'),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
                { provide: jwt_1.JwtService, useValue: mockJwtService },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        prismaService = module.get(prisma_service_1.PrismaService);
        jwtService = module.get(jwt_1.JwtService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('register', () => {
        it('should register a new user successfully', async () => {
            const dto = { email: 'test@example.com', password: 'Password123!' };
            const mockUser = { id: '1', email: dto.email, onboardingCompleted: false };
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.user.create.mockResolvedValue(mockUser);
            const result = await service.register(dto);
            expect(result).toHaveProperty('accessToken');
            expect(result.user.email).toBe(dto.email);
        });
        it('should throw ConflictException if email already exists', async () => {
            const dto = { email: 'existing@example.com', password: 'Password123!' };
            mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: dto.email });
            await expect(service.register(dto)).rejects.toThrow(common_1.ConflictException);
        });
        it('should throw BadRequestException for weak password', async () => {
            const dto = { email: 'test@example.com', password: 'weak' };
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            await expect(service.register(dto)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('login', () => {
        it('should login successfully with correct credentials', async () => {
            const dto = { email: 'test@example.com', password: 'Password123!' };
            const hashedPassword = await bcrypt.hash(dto.password, 12);
            const mockUser = {
                id: '1',
                email: dto.email,
                passwordHash: hashedPassword,
                status: 'ACTIVE',
                onboardingCompleted: false,
            };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.update.mockResolvedValue(mockUser);
            const result = await service.login(dto);
            expect(result).toHaveProperty('accessToken');
            expect(result.user.email).toBe(dto.email);
        });
        it('should throw UnauthorizedException for non-existent user', async () => {
            const dto = { email: 'nonexistent@example.com', password: 'Password123!' };
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            await expect(service.login(dto)).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should throw UnauthorizedException for wrong password', async () => {
            const dto = { email: 'test@example.com', password: 'WrongPassword123!' };
            const hashedPassword = await bcrypt.hash('CorrectPassword123!', 12);
            const mockUser = {
                id: '1',
                email: dto.email,
                passwordHash: hashedPassword,
                status: 'ACTIVE',
            };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            await expect(service.login(dto)).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should throw UnauthorizedException for banned user', async () => {
            const dto = { email: 'banned@example.com', password: 'Password123!' };
            const mockUser = {
                id: '1',
                email: dto.email,
                passwordHash: 'hash',
                status: 'BANNED',
            };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            await expect(service.login(dto)).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
    describe('validateUser', () => {
        it('should return user if found and active', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                status: 'ACTIVE',
                onboardingCompleted: false,
            };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            const result = await service.validateUser('1');
            expect(result).toEqual(mockUser);
        });
        it('should throw UnauthorizedException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            await expect(service.validateUser('nonexistent')).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map