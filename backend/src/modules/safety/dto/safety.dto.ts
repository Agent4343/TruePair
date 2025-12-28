import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReportUserDto {
  @ApiProperty({ example: 'user-id-here' })
  @IsString()
  userId: string;

  @ApiProperty({
    enum: ['HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FAKE_PROFILE', 'SCAM', 'THREATS', 'OTHER'],
  })
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'Description of the issue...' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ScheduleDateDto {
  @ApiProperty({ example: 'match-id-here' })
  @IsString()
  matchId: string;

  @ApiProperty({ example: '2024-01-15T19:00:00Z' })
  @IsDateString()
  dateTime: string;

  @ApiPropertyOptional({ example: 'Coffee Shop on Main St' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublicPlace?: boolean;
}

export class BlockUserDto {
  @ApiProperty({ example: 'user-id-here' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 'Reason for blocking' })
  @IsOptional()
  @IsString()
  reason?: string;
}
