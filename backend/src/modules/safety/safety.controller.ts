import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SafetyService } from './safety.service';
import { ReportUserDto, ScheduleDateDto, BlockUserDto } from './dto/safety.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Safety')
@Controller('api/safety')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SafetyController {
  constructor(private safetyService: SafetyService) {}

  @Post('report')
  @ApiOperation({ summary: 'Report a user' })
  async reportUser(@Request() req: any, @Body() dto: ReportUserDto) {
    return this.safetyService.reportUser(req.user.userId, dto.userId, dto.type, dto.description);
  }

  @Get('signals/:userId')
  @ApiOperation({ summary: 'Get safety signals for a user' })
  async getSafetySignals(@Param('userId') userId: string) {
    return this.safetyService.getSafetySignals(userId);
  }

  @Get('pre-date/:matchId')
  @ApiOperation({ summary: 'Get pre-date safety check' })
  async getPreDateCheck(@Request() req: any, @Param('matchId') matchId: string) {
    return this.safetyService.getPreDateSafetyCheck(req.user.userId, matchId);
  }

  @Post('dates')
  @ApiOperation({ summary: 'Schedule a date' })
  async scheduleDate(@Request() req: any, @Body() dto: ScheduleDateDto) {
    return this.safetyService.scheduleDate(
      req.user.userId,
      dto.matchId,
      new Date(dto.dateTime),
      dto.location,
      dto.isPublicPlace,
    );
  }

  @Post('block')
  @ApiOperation({ summary: 'Block a user' })
  async blockUser(@Request() req: any, @Body() dto: BlockUserDto) {
    return this.safetyService.blockUser(req.user.userId, dto.userId, dto.reason);
  }
}
