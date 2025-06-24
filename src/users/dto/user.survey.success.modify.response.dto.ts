import { ApiProperty } from '@nestjs/swagger';

export class UserSurveySuccessModifyResponseDto {
  @ApiProperty({ example: '설문조사가 성공적으로 수정되었습니다.' })
  message: string;
}
