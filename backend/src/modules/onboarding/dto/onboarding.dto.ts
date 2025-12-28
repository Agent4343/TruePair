import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({ example: 'q-1' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ example: 'My answer to the question...' })
  @IsNotEmpty()
  answer: any;
}
