import { ApiProperty } from '@nestjs/swagger';

export class UserSurveySuccessResponseDto {
  @ApiProperty({ example: '설문조사가 성공적으로 저장되었습니다.' })
  message: string;
}
