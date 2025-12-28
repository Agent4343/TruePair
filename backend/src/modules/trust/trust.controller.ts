import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrustService } from './trust.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Trust')
@Controller('api/trust')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrustController {
  constructor(private trustService: TrustService) {}

  @Get('score')
  @ApiOperation({ summary: 'Get own trust score' })
  async getTrustScore(@Request() req: any) {
    return this.trustService.getTrustScore(req.user.userId);
  }
}
