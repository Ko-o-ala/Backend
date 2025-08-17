import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsString,
  ValidateNested,
  IsNotEmpty,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PreferredSoundRankDto {
  @ApiProperty({
    example: 'ALPHA_1.mp3',
    description: '사운드 파일명',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({
    example: 1,
    description: '사운드의 새로운 rank (1부터 시작, 22개 사운드)',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  rank: number;
}

export class UpdatePreferredSoundsRankDto {
  @ApiProperty({
    example: [
      {
        filename: 'ALPHA_1.mp3',
        rank: 1,
      },
      {
        filename: 'FIRE_1.mp3',
        rank: 2,
      },
    ],
    description: '수정할 사운드들의 rank 정보 배열',
    required: true,
    type: [PreferredSoundRankDto],
  })
  @IsArray()
  @ArrayMinSize(1, {
    message: '최소 1개 이상의 사운드 rank 정보가 필요합니다.',
  })
  @ValidateNested({ each: true })
  @Type(() => PreferredSoundRankDto)
  preferredSounds: PreferredSoundRankDto[];
}
