import { ApiProperty } from '@nestjs/swagger';

export class SleepDataSuccessReturnDto {
  @ApiProperty({ example: '생체 수면 데이터가 성공적으로 저장되었습니다.' })
  message: string;
}
