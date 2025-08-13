import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExecuteRecommendRequestDto {
  @ApiProperty({
    example: 'seoin2744',
    description: '사용자 ID',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  userID: string;

  @ApiProperty({
    example: '2025-07-15',
    description: '추천을 받을 날짜 (YYYY-MM-DD)',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  date: string;
}
