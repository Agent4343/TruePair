import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/messages.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Messages')
@Controller('api/messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('match/:matchId')
  @ApiOperation({ summary: 'Get messages for a match' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'before', required: false, type: String })
  async getMessages(
    @Request() req: any,
    @Param('matchId') matchId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    return this.messagesService.getMessages(req.user.userId, matchId, limit || 50, before);
  }

  @Post('match/:matchId')
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @Request() req: any,
    @Param('matchId') matchId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(req.user.userId, matchId, dto.content);
  }

  @Post('match/:matchId/read')
  @ApiOperation({ summary: 'Mark messages as read' })
  async markAsRead(@Request() req: any, @Param('matchId') matchId: string) {
    return this.messagesService.markAsRead(req.user.userId, matchId);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread message count' })
  async getUnreadCount(@Request() req: any) {
    return this.messagesService.getUnreadCount(req.user.userId);
  }
}
