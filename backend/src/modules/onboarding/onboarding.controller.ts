import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { SubmitAnswerDto } from './dto/onboarding.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Onboarding')
@Controller('api/onboarding')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Get('questions')
  @ApiOperation({ summary: 'Get onboarding questions' })
  @ApiQuery({ name: 'category', required: false })
  async getQuestions(@Query('category') category?: string) {
    return this.onboardingService.getQuestions(category);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get onboarding progress' })
  async getProgress(@Request() req: any) {
    return this.onboardingService.getProgress(req.user.userId);
  }

  @Post('answer')
  @ApiOperation({ summary: 'Submit an answer' })
  async submitAnswer(@Request() req: any, @Body() dto: SubmitAnswerDto) {
    return this.onboardingService.submitAnswer(req.user.userId, dto.questionId, dto.answer);
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete onboarding' })
  async complete(@Request() req: any) {
    return this.onboardingService.completeOnboarding(req.user.userId);
  }
}
