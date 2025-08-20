import { ApiProperty } from '@nestjs/swagger';

export class RecommendedSoundResult {
  @ApiProperty({
    description: '사운드 파일명',
    example: 'FIRE_1.mp3',
  })
  filename: string;

  @ApiProperty({
    description: '사운드 순위',
    example: 1,
  })
  rank: number;
}

export class GetRecommendResultsResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 'minho1991',
  })
  userId: string;

  @ApiProperty({
    description: '날짜 (YYYY-MM-DD 형식)',
    example: '2025-08-12',
  })
  date: string;

  @ApiProperty({
    description: '추천 텍스트',
    example: '잠들지 못하는 밤이 힘들었겠죠...',
  })
  recommendation_text: string;

  @ApiProperty({
    description: '추천된 사운드 목록',
    type: [RecommendedSoundResult],
  })
  recommended_sounds: RecommendedSoundResult[];

  @ApiProperty({
    description: '생성 시간',
    example: '2025-08-13T16:01:21.500Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 시간',
    example: '2025-08-13T16:01:21.500Z',
  })
  updatedAt: Date;
}
