import { Controller, Get, Put, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user details' })
  async getMe(@Request() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user' })
  async updateMe(@Request() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, dto);
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Change password' })
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.userId, dto);
  }

  @Post('me/deactivate')
  @ApiOperation({ summary: 'Deactivate account' })
  async deactivate(@Request() req: any) {
    return this.usersService.deactivate(req.user.userId);
  }

  @Post('me/reactivate')
  @ApiOperation({ summary: 'Reactivate account' })
  async reactivate(@Request() req: any) {
    return this.usersService.reactivate(req.user.userId);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete account permanently' })
  async delete(@Request() req: any) {
    return this.usersService.delete(req.user.userId);
  }
}
