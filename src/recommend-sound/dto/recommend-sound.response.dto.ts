import { ApiProperty } from '@nestjs/swagger';

export class RecommendedSoundDto {
  @ApiProperty({
    description: '음악 파일명',
    example: 'NATURE_1_WATER.mp3',
  })
  filename: string;

  @ApiProperty({
    description: '순위',
    example: 1,
  })
  rank: number;

  @ApiProperty({
    description: '선호도',
    example: 'top',
  })
  preference: string;
}

export class RecommendSoundResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 'seoin2744',
  })
  userId: string;

  @ApiProperty({
    description: '날짜',
    example: '2025-07-15T00:00:00.000+00:00',
  })
  date: string;

  @ApiProperty({
    description: '추천 텍스트',
    example: '숨 가쁘게 살아가는 지친 하루하루 속에서...',
  })
  recommendation_text: string;

  @ApiProperty({
    description: '추천된 음악 목록',
    type: [RecommendedSoundDto],
  })
  recommended_sounds: RecommendedSoundDto[];
}
