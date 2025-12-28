import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Matching')
@Controller('api/matching')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Get('discover')
  @ApiOperation({ summary: 'Get discovery profiles' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async discover(@Request() req: any, @Query('limit') limit?: number) {
    return this.matchingService.getDiscoveryProfiles(req.user.userId, limit || 10);
  }

  @Post('like/:userId')
  @ApiOperation({ summary: 'Like a user' })
  async like(@Request() req: any, @Param('userId') userId: string) {
    return this.matchingService.like(req.user.userId, userId);
  }

  @Post('pass/:userId')
  @ApiOperation({ summary: 'Pass on a user' })
  async pass(@Request() req: any, @Param('userId') userId: string) {
    return this.matchingService.pass(req.user.userId, userId);
  }

  @Get('matches')
  @ApiOperation({ summary: 'Get all matches' })
  async getMatches(@Request() req: any) {
    return this.matchingService.getMatches(req.user.userId);
  }

  @Get('matches/:matchId')
  @ApiOperation({ summary: 'Get match details' })
  async getMatch(@Request() req: any, @Param('matchId') matchId: string) {
    return this.matchingService.getMatch(req.user.userId, matchId);
  }
}
