import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
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

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
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

      await expect(service.changePassword(userId, dto)).rejects.toThrow(BadRequestException);
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

      await expect(service.reactivate('1')).rejects.toThrow(BadRequestException);
    });
  });
});
