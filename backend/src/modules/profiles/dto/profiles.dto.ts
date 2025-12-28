import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsInt,
  IsObject,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({ example: 'Alex' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @ApiPropertyOptional({ example: 'Alex' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @ApiProperty({ example: '1995-06-15' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'] })
  @IsString()
  gender: string;

  @ApiProperty({ type: [String], example: ['FEMALE'] })
  @IsArray()
  @IsString({ each: true })
  genderPreferences: string[];

  @ApiPropertyOptional({ example: 'San Francisco' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'CA' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Software engineer who loves hiking...' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ example: 180 })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(250)
  height?: number;

  @ApiPropertyOptional({ enum: ['CASUAL', 'SHORT_TERM', 'LONG_TERM', 'MARRIAGE', 'FIGURING_OUT'] })
  @IsOptional()
  @IsString()
  relationshipIntent?: string;

  @ApiPropertyOptional({ example: { top: ['Honesty', 'Kindness'] } })
  @IsOptional()
  @IsObject()
  values?: Record<string, any>;

  @ApiPropertyOptional({ example: { fitness: 7, social: 6 } })
  @IsOptional()
  @IsObject()
  lifestyle?: Record<string, any>;

  @ApiPropertyOptional({ example: { mustHave: [], cantHave: [] } })
  @IsOptional()
  @IsObject()
  dealbreakers?: Record<string, any>;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alex' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Alex' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @ApiPropertyOptional({ example: 'San Francisco' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'CA' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Updated bio...' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ example: 180 })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(250)
  height?: number;

  @ApiPropertyOptional({ enum: ['CASUAL', 'SHORT_TERM', 'LONG_TERM', 'MARRIAGE', 'FIGURING_OUT'] })
  @IsOptional()
  @IsString()
  relationshipIntent?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genderPreferences?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  values?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  lifestyle?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  dealbreakers?: Record<string, any>;
}

export class AddPhotoDto {
  @ApiProperty({ example: 'https://example.com/photo.jpg' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}

export class AddPromptDto {
  @ApiProperty({ example: 'A perfect day for me looks like...' })
  @IsString()
  @MaxLength(200)
  question: string;

  @ApiProperty({ example: 'Morning hike, brunch with friends...' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  answer: string;
}
