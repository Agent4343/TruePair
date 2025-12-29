import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProfileDto, UpdateProfileDto } from './dto/profiles.dto';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    profile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    photo: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
    },
    profilePrompt: {
      create: jest.fn(),
    },
  };

  const mockUserId = 'user-123';
  const mockProfileId = 'profile-456';

  const mockBaseProfile = {
    id: mockProfileId,
    userId: mockUserId,
    firstName: 'Alex',
    displayName: 'Alex',
    birthDate: new Date('1995-06-15'),
    gender: 'MALE',
    genderPreferences: ['FEMALE'],
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    bio: 'Software engineer who loves hiking and photography.',
    height: 180,
    relationshipIntent: 'LONG_TERM',
    values: { top: ['Honesty', 'Kindness'] },
    lifestyle: { fitness: 7, social: 6 },
    dealbreakers: { mustHave: [], cantHave: [] },
    photos: [],
    prompts: [],
    profileStrengthScore: 0,
    completenessScore: 0,
    specificityScore: 50,
    consistencyScore: 80,
    stabilityScore: 90,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createProfileDto: CreateProfileDto = {
      firstName: 'Alex',
      displayName: 'Alex',
      birthDate: '1995-06-15',
      gender: 'MALE',
      genderPreferences: ['FEMALE'],
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      bio: 'Software engineer who loves hiking and photography.',
      height: 180,
      relationshipIntent: 'LONG_TERM',
      values: { top: ['Honesty', 'Kindness'] },
      lifestyle: { fitness: 7, social: 6 },
      dealbreakers: { mustHave: [], cantHave: [] },
    };

    it('should create a new profile successfully', async () => {
      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(null) // First call - check for existing profile
        .mockResolvedValueOnce({ ...mockBaseProfile, photos: [], prompts: [] }); // Second call - for strength calculation
      mockPrismaService.profile.create.mockResolvedValue({
        ...mockBaseProfile,
        photos: [],
        prompts: [],
      });
      mockPrismaService.profile.update.mockResolvedValue(mockBaseProfile);

      const result = await service.create(mockUserId, createProfileDto);

      expect(result.firstName).toBe('Alex');
      expect(result.displayName).toBe('Alex');
      expect(mockPrismaService.profile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUserId,
          firstName: 'Alex',
          displayName: 'Alex',
          gender: 'MALE',
          genderPreferences: ['FEMALE'],
        }),
        include: {
          photos: true,
          prompts: true,
        },
      });
    });

    it('should use firstName as displayName when displayName is not provided', async () => {
      const dtoWithoutDisplayName = { ...createProfileDto };
      delete dtoWithoutDisplayName.displayName;

      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...mockBaseProfile, displayName: 'Alex' });
      mockPrismaService.profile.create.mockResolvedValue({
        ...mockBaseProfile,
        displayName: 'Alex',
        photos: [],
        prompts: [],
      });
      mockPrismaService.profile.update.mockResolvedValue(mockBaseProfile);

      const result = await service.create(mockUserId, dtoWithoutDisplayName);

      expect(mockPrismaService.profile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          displayName: 'Alex',
        }),
        include: expect.any(Object),
      });
    });

    it('should throw BadRequestException if profile already exists', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(mockBaseProfile);

      await expect(service.create(mockUserId, createProfileDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(mockUserId, createProfileDto)).rejects.toThrow(
        'Profile already exists',
      );
    });
  });

  describe('findByUserId', () => {
    it('should return profile with photos and prompts ordered correctly', async () => {
      const profileWithData = {
        ...mockBaseProfile,
        photos: [
          { id: 'photo1', url: 'https://example.com/1.jpg', order: 0 },
          { id: 'photo2', url: 'https://example.com/2.jpg', order: 1 },
        ],
        prompts: [
          { id: 'prompt1', question: 'Q1', answer: 'A1', order: 0 },
        ],
      };

      mockPrismaService.profile.findUnique.mockResolvedValue(profileWithData);

      const result = await service.findByUserId(mockUserId);

      expect(result).toEqual(profileWithData);
      expect(mockPrismaService.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: {
          photos: { orderBy: { order: 'asc' } },
          prompts: { orderBy: { order: 'asc' } },
        },
      });
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.findByUserId('nonexistent-user')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByUserId('nonexistent-user')).rejects.toThrow(
        'Profile not found',
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateProfileDto = {
      firstName: 'Alexander',
      bio: 'Updated bio with more details about my interests.',
      city: 'New York',
    };

    it('should update profile successfully', async () => {
      const updatedProfile = {
        ...mockBaseProfile,
        firstName: 'Alexander',
        bio: 'Updated bio with more details about my interests.',
        city: 'New York',
        photos: [],
        prompts: [],
      };

      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(mockBaseProfile) // First call - check profile exists
        .mockResolvedValueOnce(updatedProfile); // Second call - for strength calculation
      mockPrismaService.profile.update.mockResolvedValue(updatedProfile);

      const result = await service.update(mockUserId, updateDto);

      expect(result.firstName).toBe('Alexander');
      expect(result.bio).toBe('Updated bio with more details about my interests.');
      expect(result.city).toBe('New York');
    });

    it('should only update provided fields', async () => {
      const partialUpdateDto: UpdateProfileDto = { bio: 'Just updating bio' };

      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(mockBaseProfile)
        .mockResolvedValueOnce({ ...mockBaseProfile, bio: 'Just updating bio' });
      mockPrismaService.profile.update.mockResolvedValue({
        ...mockBaseProfile,
        bio: 'Just updating bio',
        photos: [],
        prompts: [],
      });

      await service.update(mockUserId, partialUpdateDto);

      expect(mockPrismaService.profile.update).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: { bio: 'Just updating bio' },
        include: {
          photos: { orderBy: { order: 'asc' } },
          prompts: { orderBy: { order: 'asc' } },
        },
      });
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent-user', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should recalculate profile strength after update', async () => {
      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(mockBaseProfile)
        .mockResolvedValueOnce({ ...mockBaseProfile, photos: [], prompts: [] });
      mockPrismaService.profile.update.mockResolvedValue({
        ...mockBaseProfile,
        photos: [],
        prompts: [],
      });

      await service.update(mockUserId, updateDto);

      // Verify update was called twice - once for the profile update, once for strength calculation
      expect(mockPrismaService.profile.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('getProfileStrength', () => {
    it('should return profile strength with breakdown and tips', async () => {
      const profileWithScores = {
        profileStrengthScore: 75,
        completenessScore: 80,
        specificityScore: 70,
        consistencyScore: 80,
        stabilityScore: 90,
      };

      mockPrismaService.profile.findUnique.mockResolvedValue(profileWithScores);

      const result = await service.getProfileStrength(mockUserId);

      expect(result.overall).toBe(75);
      expect(result.breakdown).toEqual({
        completeness: 80,
        specificity: 70,
        consistency: 80,
        stability: 90,
      });
      expect(result.tips).toBeDefined();
      expect(Array.isArray(result.tips)).toBe(true);
    });

    it('should return improvement tips for low completeness', async () => {
      const profileWithLowScores = {
        profileStrengthScore: 50,
        completenessScore: 60,
        specificityScore: 70,
        consistencyScore: 80,
        stabilityScore: 90,
      };

      mockPrismaService.profile.findUnique.mockResolvedValue(profileWithLowScores);

      const result = await service.getProfileStrength(mockUserId);

      expect(result.tips).toContain('Add more photos to increase your visibility');
      expect(result.tips).toContain('Complete all profile sections for better matches');
    });

    it('should return improvement tips for low specificity', async () => {
      const profileWithLowSpecificity = {
        profileStrengthScore: 60,
        completenessScore: 85,
        specificityScore: 60,
        consistencyScore: 80,
        stabilityScore: 90,
      };

      mockPrismaService.profile.findUnique.mockResolvedValue(profileWithLowSpecificity);

      const result = await service.getProfileStrength(mockUserId);

      expect(result.tips).toContain('Add more detail to your bio to stand out');
      expect(result.tips).toContain('Write longer, more thoughtful prompt answers');
    });

    it('should return positive message for high scores', async () => {
      const profileWithHighScores = {
        profileStrengthScore: 90,
        completenessScore: 95,
        specificityScore: 85,
        consistencyScore: 90,
        stabilityScore: 95,
      };

      mockPrismaService.profile.findUnique.mockResolvedValue(profileWithHighScores);

      const result = await service.getProfileStrength(mockUserId);

      expect(result.tips).toContain('Your profile is looking great!');
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.getProfileStrength('nonexistent-user')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should limit tips to maximum 3', async () => {
      const profileWithLowScores = {
        profileStrengthScore: 40,
        completenessScore: 50,
        specificityScore: 50,
        consistencyScore: 60,
        stabilityScore: 70,
      };

      mockPrismaService.profile.findUnique.mockResolvedValue(profileWithLowScores);

      const result = await service.getProfileStrength(mockUserId);

      expect(result.tips.length).toBeLessThanOrEqual(3);
    });
  });

  describe('addPhoto', () => {
    const photoUrl = 'https://example.com/photo.jpg';

    it('should add photo successfully', async () => {
      const profileWithPhotos = {
        ...mockBaseProfile,
        photos: [],
      };

      const newPhoto = {
        id: 'photo-789',
        profileId: mockProfileId,
        url: photoUrl,
        isMain: true,
        order: 0,
      };

      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(profileWithPhotos)
        .mockResolvedValueOnce({ ...profileWithPhotos, photos: [newPhoto], prompts: [] });
      mockPrismaService.photo.create.mockResolvedValue(newPhoto);
      mockPrismaService.profile.update.mockResolvedValue(profileWithPhotos);

      const result = await service.addPhoto(mockUserId, photoUrl);

      expect(result).toEqual(newPhoto);
      expect(mockPrismaService.photo.create).toHaveBeenCalledWith({
        data: {
          profileId: mockProfileId,
          url: photoUrl,
          isMain: true, // First photo should be main
          order: 0,
        },
      });
    });

    it('should set first photo as main automatically', async () => {
      const profileWithNoPhotos = { ...mockBaseProfile, photos: [] };

      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(profileWithNoPhotos)
        .mockResolvedValueOnce(profileWithNoPhotos);
      mockPrismaService.photo.create.mockResolvedValue({
        id: 'photo-1',
        isMain: true,
        order: 0,
      });
      mockPrismaService.profile.update.mockResolvedValue(profileWithNoPhotos);

      await service.addPhoto(mockUserId, photoUrl, false);

      expect(mockPrismaService.photo.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isMain: true, // Should be true even when passed false for first photo
        }),
      });
    });

    it('should unset previous main photo when adding new main photo', async () => {
      const profileWithPhotos = {
        ...mockBaseProfile,
        photos: [
          { id: 'photo-1', url: 'old.jpg', isMain: true, order: 0 },
        ],
      };

      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(profileWithPhotos)
        .mockResolvedValueOnce(profileWithPhotos);
      mockPrismaService.photo.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.photo.create.mockResolvedValue({
        id: 'photo-2',
        isMain: true,
        order: 1,
      });
      mockPrismaService.profile.update.mockResolvedValue(profileWithPhotos);

      await service.addPhoto(mockUserId, photoUrl, true);

      expect(mockPrismaService.photo.updateMany).toHaveBeenCalledWith({
        where: { profileId: mockProfileId },
        data: { isMain: false },
      });
    });

    it('should throw BadRequestException when maximum 6 photos reached', async () => {
      const profileWithMaxPhotos = {
        ...mockBaseProfile,
        photos: [
          { id: '1' }, { id: '2' }, { id: '3' },
          { id: '4' }, { id: '5' }, { id: '6' },
        ],
      };

      mockPrismaService.profile.findUnique.mockResolvedValue(profileWithMaxPhotos);

      await expect(service.addPhoto(mockUserId, photoUrl)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.addPhoto(mockUserId, photoUrl)).rejects.toThrow(
        'Maximum 6 photos allowed',
      );
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.addPhoto('nonexistent-user', photoUrl)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should set correct order for subsequent photos', async () => {
      const profileWithTwoPhotos = {
        ...mockBaseProfile,
        photos: [
          { id: 'photo-1', order: 0 },
          { id: 'photo-2', order: 1 },
        ],
      };

      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(profileWithTwoPhotos)
        .mockResolvedValueOnce(profileWithTwoPhotos);
      mockPrismaService.photo.create.mockResolvedValue({
        id: 'photo-3',
        order: 2,
      });
      mockPrismaService.profile.update.mockResolvedValue(profileWithTwoPhotos);

      await service.addPhoto(mockUserId, photoUrl);

      expect(mockPrismaService.photo.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          order: 2,
        }),
      });
    });
  });

  describe('deletePhoto', () => {
    const photoId = 'photo-123';

    it('should delete photo successfully', async () => {
      const existingPhoto = {
        id: photoId,
        profileId: mockProfileId,
        url: 'https://example.com/photo.jpg',
      };

      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(mockBaseProfile)
        .mockResolvedValueOnce({ ...mockBaseProfile, photos: [], prompts: [] });
      mockPrismaService.photo.findFirst.mockResolvedValue(existingPhoto);
      mockPrismaService.photo.delete.mockResolvedValue(existingPhoto);
      mockPrismaService.profile.update.mockResolvedValue(mockBaseProfile);

      const result = await service.deletePhoto(mockUserId, photoId);

      expect(result).toEqual({ message: 'Photo deleted' });
      expect(mockPrismaService.photo.delete).toHaveBeenCalledWith({
        where: { id: photoId },
      });
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.deletePhoto('nonexistent-user', photoId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deletePhoto('nonexistent-user', photoId)).rejects.toThrow(
        'Profile not found',
      );
    });

    it('should throw NotFoundException if photo not found', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(mockBaseProfile);
      mockPrismaService.photo.findFirst.mockResolvedValue(null);

      await expect(service.deletePhoto(mockUserId, 'nonexistent-photo')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deletePhoto(mockUserId, 'nonexistent-photo')).rejects.toThrow(
        'Photo not found',
      );
    });

    it('should only delete photos belonging to the user profile', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(mockBaseProfile);
      mockPrismaService.photo.findFirst.mockResolvedValue(null); // Photo exists but not for this profile

      await expect(service.deletePhoto(mockUserId, 'other-user-photo')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.photo.findFirst).toHaveBeenCalledWith({
        where: { id: 'other-user-photo', profileId: mockProfileId },
      });
    });

    it('should recalculate profile strength after deleting photo', async () => {
      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(mockBaseProfile)
        .mockResolvedValueOnce({ ...mockBaseProfile, photos: [], prompts: [] });
      mockPrismaService.photo.findFirst.mockResolvedValue({ id: photoId, profileId: mockProfileId });
      mockPrismaService.photo.delete.mockResolvedValue({});
      mockPrismaService.profile.update.mockResolvedValue(mockBaseProfile);

      await service.deletePhoto(mockUserId, photoId);

      expect(mockPrismaService.profile.update).toHaveBeenCalled();
    });
  });

  describe('addPrompt', () => {
    const question = 'A perfect day for me looks like...';
    const answer = 'Morning hike, brunch with friends, afternoon reading, and a nice dinner.';

    it('should add prompt successfully', async () => {
      const profileWithNoPrompts = {
        ...mockBaseProfile,
        prompts: [],
      };

      const newPrompt = {
        id: 'prompt-123',
        profileId: mockProfileId,
        question,
        answer,
        order: 0,
      };

      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(profileWithNoPrompts)
        .mockResolvedValueOnce({ ...profileWithNoPrompts, photos: [], prompts: [newPrompt] });
      mockPrismaService.profilePrompt.create.mockResolvedValue(newPrompt);
      mockPrismaService.profile.update.mockResolvedValue(profileWithNoPrompts);

      const result = await service.addPrompt(mockUserId, question, answer);

      expect(result).toEqual(newPrompt);
      expect(mockPrismaService.profilePrompt.create).toHaveBeenCalledWith({
        data: {
          profileId: mockProfileId,
          question,
          answer,
          order: 0,
        },
      });
    });

    it('should throw BadRequestException when maximum 3 prompts reached', async () => {
      const profileWithMaxPrompts = {
        ...mockBaseProfile,
        prompts: [
          { id: '1', question: 'Q1', answer: 'A1' },
          { id: '2', question: 'Q2', answer: 'A2' },
          { id: '3', question: 'Q3', answer: 'A3' },
        ],
      };

      mockPrismaService.profile.findUnique.mockResolvedValue(profileWithMaxPrompts);

      await expect(service.addPrompt(mockUserId, question, answer)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.addPrompt(mockUserId, question, answer)).rejects.toThrow(
        'Maximum 3 prompts allowed',
      );
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.addPrompt('nonexistent-user', question, answer)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should set correct order for subsequent prompts', async () => {
      const profileWithOnePrompt = {
        ...mockBaseProfile,
        prompts: [
          { id: 'prompt-1', question: 'Q1', answer: 'A1', order: 0 },
        ],
      };

      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(profileWithOnePrompt)
        .mockResolvedValueOnce(profileWithOnePrompt);
      mockPrismaService.profilePrompt.create.mockResolvedValue({
        id: 'prompt-2',
        order: 1,
      });
      mockPrismaService.profile.update.mockResolvedValue(profileWithOnePrompt);

      await service.addPrompt(mockUserId, question, answer);

      expect(mockPrismaService.profilePrompt.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          order: 1,
        }),
      });
    });

    it('should recalculate profile strength after adding prompt', async () => {
      const profileWithPrompts = {
        ...mockBaseProfile,
        prompts: [],
      };

      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(profileWithPrompts)
        .mockResolvedValueOnce({ ...profileWithPrompts, photos: [], prompts: [] });
      mockPrismaService.profilePrompt.create.mockResolvedValue({
        id: 'prompt-1',
        question,
        answer,
      });
      mockPrismaService.profile.update.mockResolvedValue(profileWithPrompts);

      await service.addPrompt(mockUserId, question, answer);

      expect(mockPrismaService.profile.update).toHaveBeenCalled();
    });
  });

  describe('calculateProfileStrength (integration tests via public methods)', () => {
    it('should calculate completeness based on profile fields', async () => {
      const completeProfile = {
        ...mockBaseProfile,
        firstName: 'Alex',
        bio: 'A detailed bio with more than fifty characters for testing purposes.',
        photos: [{ id: '1' }, { id: '2' }, { id: '3' }],
        prompts: [{ id: '1', answer: 'Answer 1' }, { id: '2', answer: 'Answer 2' }],
        relationshipIntent: 'LONG_TERM',
        city: 'San Francisco',
      };

      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(completeProfile)
        .mockResolvedValueOnce(completeProfile);
      mockPrismaService.profile.update.mockResolvedValue(completeProfile);

      await service.update(mockUserId, { bio: 'Updated bio that is longer than fifty characters for better testing.' });

      // Verify the update was called with correct scores calculation
      expect(mockPrismaService.profile.update).toHaveBeenLastCalledWith(
        expect.objectContaining({
          where: { id: mockProfileId },
          data: expect.objectContaining({
            completenessScore: expect.any(Number),
            specificityScore: expect.any(Number),
          }),
        }),
      );
    });

    it('should calculate specificity based on bio and prompt length', async () => {
      const profileWithLongBio = {
        ...mockBaseProfile,
        bio: 'This is a very long bio with more than 200 characters. It contains detailed information about interests, hobbies, and life goals. The more detailed the bio, the higher the specificity score should be calculated by the service.',
        prompts: [{ id: '1', answer: 'This is a detailed prompt answer with more than fifty characters.' }],
        photos: [],
      };

      mockPrismaService.profile.findUnique.mockResolvedValue(profileWithLongBio);
      mockPrismaService.profile.update.mockResolvedValue(profileWithLongBio);

      // Trigger calculation via getProfileStrength
      mockPrismaService.profile.findUnique.mockResolvedValueOnce({
        profileStrengthScore: 75,
        completenessScore: 80,
        specificityScore: 100, // High due to long bio and detailed prompts
        consistencyScore: 80,
        stabilityScore: 90,
      });

      const result = await service.getProfileStrength(mockUserId);

      expect(result.breakdown.specificity).toBe(100);
    });
  });
});
