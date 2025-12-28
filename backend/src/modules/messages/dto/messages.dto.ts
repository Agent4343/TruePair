import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'Hey! How are you?' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}
