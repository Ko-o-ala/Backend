import {
  IsString,
  IsInt,
  Matches,
  ValidateNested,
  IsObject,
  IsArray,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SleepTimeDto {
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
}

export class DurationDto {
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
}

export class SegmentDto {
  @ApiProperty({ example: '23:05', description: '세그먼트 시작 시각 (HH:mm)' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '23:30', description: '세그먼트 종료 시각 (HH:mm)' })
  @IsString()
  endTime: string;

  @ApiProperty({ example: 'light', description: '수면 단계' })
  @IsString()
  @IsIn(['rem', 'awake', 'deep', 'light'])
  stage: string;
}

export class CreateSleepDataDto {
  @ApiProperty({ example: 'seoin2743', description: '사용자 ID' })
  @IsString()
  userID: string;

  @ApiProperty({ example: '2025-06-30', description: '수면 날짜 (YYYY-MM-DD)' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date: string;

  @ApiProperty({
    example: {
      startTime: '22:30',
      endTime: '07:30',
    },
    description: '수면 시간 정보',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => SleepTimeDto)
  sleepTime: SleepTimeDto;

  @ApiProperty({
    example: {
      totalSleepDuration: 460,
      deepSleepDuration: 120,
      remSleepDuration: 90,
      lightSleepDuration: 200,
      awakeDuration: 50,
    },
    description: '수면 지속 시간 정보',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => DurationDto)
  Duration: DurationDto;

  @ApiProperty({
    example: [
      { startTime: '23:05', endTime: '23:30', stage: 'light' },
      { startTime: '23:30', endTime: '00:10', stage: 'deep' },
    ],
    description: '수면 세그먼트 배열',
    type: [SegmentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentDto)
  segments: SegmentDto[];

  @ApiProperty({ example: 82, description: '수면 점수 (0~100)' })
  @IsInt()
  sleepScore: number;
}
