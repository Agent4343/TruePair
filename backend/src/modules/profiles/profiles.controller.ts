import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto, UpdateProfileDto, AddPhotoDto, AddPromptDto } from './dto/profiles.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Profiles')
@Controller('api/profiles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create profile' })
  async create(@Request() req: any, @Body() dto: CreateProfileDto) {
    return this.profilesService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get own profile' })
  async getProfile(@Request() req: any) {
    return this.profilesService.findByUserId(req.user.userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update profile' })
  async update(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.profilesService.update(req.user.userId, dto);
  }

  @Get('score')
  @ApiOperation({ summary: 'Get profile strength score' })
  async getScore(@Request() req: any) {
    return this.profilesService.getProfileStrength(req.user.userId);
  }

  @Post('photos')
  @ApiOperation({ summary: 'Add photo' })
  async addPhoto(@Request() req: any, @Body() dto: AddPhotoDto) {
    return this.profilesService.addPhoto(req.user.userId, dto.url, dto.isMain);
  }

  @Delete('photos/:photoId')
  @ApiOperation({ summary: 'Delete photo' })
  async deletePhoto(@Request() req: any, @Param('photoId') photoId: string) {
    return this.profilesService.deletePhoto(req.user.userId, photoId);
  }

  @Post('prompts')
  @ApiOperation({ summary: 'Add prompt' })
  async addPrompt(@Request() req: any, @Body() dto: AddPromptDto) {
    return this.profilesService.addPrompt(req.user.userId, dto.question, dto.answer);
  }
}
