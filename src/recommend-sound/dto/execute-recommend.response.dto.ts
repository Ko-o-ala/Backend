import { ApiProperty } from '@nestjs/swagger';

export class RecommendedSoundDto {
  @ApiProperty({
    example: 'NATURE_1_WATER.mp3',
    description: '추천된 사운드 파일명',
  })
  filename: string;

  @ApiProperty({
    example: 1,
    description: '추천 순위',
  })
  rank: number;

  @ApiProperty({
    example: 'top',
    description: '사용자 선호도',
  })
  preference: string;
}

export class ExecuteRecommendResponseDto {
  @ApiProperty({
    example: '추천 알고리즘이 성공적으로 실행되었습니다.',
    description: '응답 메시지',
  })
  message: string;

  @ApiProperty({
    description: '추천 결과 데이터',
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        example: 'seoin2744',
        description: '사용자 ID',
      },
      date: {
        type: 'string',
        example: '2025-07-15T00:00:00.000+00:00',
        description: '추천 날짜',
      },
      recommendation_text: {
        type: 'string',
        example: '숨 가쁘게 살아가는 지친 하루하루 속에서...',
        description: '추천 설명 텍스트',
      },
      recommended_sounds: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              example: 'NATURE_1_WATER.mp3',
              description: '추천된 사운드 파일명',
            },
            rank: {
              type: 'number',
              example: 1,
              description: '추천 순위',
            },
            preference: {
              type: 'string',
              example: 'top',
              description: '사용자 선호도',
            },
          },
        },
        description: '추천된 사운드 목록',
      },
    },
  })
  data: {
    userId: string;
    date: string;
    recommendation_text: string;
    recommended_sounds: RecommendedSoundDto[];
  };
}
