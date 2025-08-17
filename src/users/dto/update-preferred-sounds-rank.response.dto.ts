import { ApiProperty } from '@nestjs/swagger';

export class UpdatePreferredSoundsRankResponseDto {
  @ApiProperty({
    example: '선호 사운드 rank가 성공적으로 업데이트되었습니다.',
    description: '업데이트 성공 메시지',
  })
  message: string;

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
    description: '업데이트된 선호 사운드 rank 정보',
  })
  preferredSounds: Array<{
    filename: string;
    rank: number;
  }>;
}
