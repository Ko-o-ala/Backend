import {
  IsString,
  IsInt,
  IsArray,
  IsOptional,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

class SleepSegment {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

export class CreateSleepDataDto {
  @IsString()
  userID: string;

  @IsString()
  date: string; // YYYY-MM-DD

  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SleepSegment)
  @IsOptional()
  segments?: SleepSegment[];

  @IsInt()
  totalSleepDuration: number;

  @IsInt()
  deepSleepDuration: number;

  @IsInt()
  remSleepDuration: number;

  @IsInt()
  lightSleepDuration: number;

  @IsInt()
  awakeDuration: number;

  @IsInt()
  sleepScore: number;
}
