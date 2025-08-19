import { ApiProperty } from '@nestjs/swagger';

export class LlmErrorDto {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: '에러 메시지',
    example: 'Bearer 토큰이 필요합니다.',
  })
  message: string;

  @ApiProperty({
    description: '에러 타입',
    example: 'Bad Request',
  })
  error: string;
}
