import { ApiProperty } from '@nestjs/swagger';

export class MonthAvgSleepDataResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 'seoin2733',
  })
  userID: string;

  @ApiProperty({
    description: '월 (YYYY-MM 형식)',
    example: '2025-07',
  })
  month: string;

  @ApiProperty({
    description: '월별 평균 수면 점수',
    example: 79.4,
  })
  avgSleepScore: number;

  @ApiProperty({
    description: '월별 평균 총 수면 시간 (분)',
    example: 436,
  })
  avgTotalSleepDuration: number;
}
