import {
  IsString,
  IsInt,
  IsArray,
  IsOptional,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SleepSegment {
  @ApiProperty({ example: '22:30', description: '수면 시작 시각 (HH:mm)' })
  @IsString()
  start: string;

  @ApiProperty({ example: '01:00', description: '수면 종료 시각 (HH:mm)' })
  @IsString()
  end: string;
}

export class CreateSleepDataDto {
  @ApiProperty({ example: 'seoin2743', description: '사용자 ID' })
  @IsString()
  userID: string;

  @ApiProperty({ example: '2025-06-30', description: '수면 날짜 (YYYY-MM-DD)' })
  @IsString()
  date: string;

  @ApiProperty({
    example: '22:30',
    description: '전체 수면의 시작 시각 (HH:mm)',
  })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @ApiProperty({
    example: '07:30',
    description: '전체 수면의 종료 시각 (HH:mm)',
  })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;

  @ApiPropertyOptional({
    description: '수면 중 중간에 깼다가 다시 잤을 경우의 구간들 (HH:mm)',
    type: [SleepSegment],
    example: [
      { start: '22:30', end: '01:00' },
      { start: '02:00', end: '07:30' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SleepSegment)
  @IsOptional()
  segments?: SleepSegment[];

  @ApiProperty({ example: 460, description: '총 수면 시간 (분 단위)' })
  @IsInt()
  totalSleepDuration: number;

  @ApiProperty({ example: 120, description: '깊은 수면 시간 (분 단위)' })
  @IsInt()
  deepSleepDuration: number;

  @ApiProperty({ example: 90, description: 'REM 수면 시간 (분 단위)' })
  @IsInt()
  remSleepDuration: number;

  @ApiProperty({ example: 200, description: '얕은 수면 시간 (분 단위)' })
  @IsInt()
  lightSleepDuration: number;

  @ApiProperty({ example: 50, description: 'Awake 상태 지속 시간 (분 단위)' })
  @IsInt()
  awakeDuration: number;

  @ApiProperty({ example: 82, description: '수면 점수 (0~100)' })
  @IsInt()
  sleepScore: number;
}
